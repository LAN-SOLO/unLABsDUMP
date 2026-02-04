import { SupabaseClient } from '@supabase/supabase-js'

export interface ReportData {
  title: string
  generatedAt: string
  dateRange: { start: string; end: string }
  data: Record<string, unknown>
}

/**
 * Generate a sales summary report
 */
export async function generateSalesReport(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<ReportData> {
  const { data: purchases } = await supabase
    .from('purchases')
    .select('id, amount, currency, package_id, created_at, packages(name)')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .in('status', ['completed', 'delivered'])

  const totalSales = purchases?.length || 0
  const totalRevenue = purchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  // Group by package
  const packageSales: Record<string, { name: string; count: number; revenue: number }> = {}
  purchases?.forEach((p) => {
    const pkgName = (p.packages as unknown as { name: string } | null)?.name || 'Unknown'
    if (!packageSales[p.package_id]) {
      packageSales[p.package_id] = { name: pkgName, count: 0, revenue: 0 }
    }
    packageSales[p.package_id].count++
    packageSales[p.package_id].revenue += p.amount || 0
  })

  return {
    title: 'Sales Summary Report',
    generatedAt: new Date().toISOString(),
    dateRange: { start: startDate, end: endDate },
    data: {
      totalSales,
      totalRevenue,
      topPackages: Object.values(packageSales)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    },
  }
}

/**
 * Generate an inventory report
 */
export async function generateInventoryReport(supabase: SupabaseClient): Promise<ReportData> {
  const { data: nfts } = await supabase.from('nfts').select('id, status, metadata, collection')

  const statusBreakdown: Record<string, number> = {}
  const collectionBreakdown: Record<string, number> = {}

  nfts?.forEach((nft) => {
    statusBreakdown[nft.status] = (statusBreakdown[nft.status] || 0) + 1
    const collection = nft.collection || 'Uncategorized'
    collectionBreakdown[collection] = (collectionBreakdown[collection] || 0) + 1
  })

  const { count: totalPackages } = await supabase
    .from('packages')
    .select('*', { count: 'exact', head: true })

  const { count: activePackages } = await supabase
    .from('packages')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return {
    title: 'Inventory Status Report',
    generatedAt: new Date().toISOString(),
    dateRange: { start: '', end: '' },
    data: {
      totalNfts: nfts?.length || 0,
      statusBreakdown,
      collectionBreakdown,
      totalPackages: totalPackages || 0,
      activePackages: activePackages || 0,
    },
  }
}

/**
 * Generate a burn report
 */
export async function generateBurnReport(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<ReportData> {
  const { data: burns } = await supabase
    .from('burn_events')
    .select('id, amount, player_id, token_type, created_at')
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const totalBurned = burns?.reduce((sum, b) => sum + b.amount, 0) || 0
  const uniqueBurners = new Set(burns?.map((b) => b.player_id)).size

  return {
    title: 'Burn Activity Report',
    generatedAt: new Date().toISOString(),
    dateRange: { start: startDate, end: endDate },
    data: {
      totalBurned,
      totalEvents: burns?.length || 0,
      uniqueBurners,
    },
  }
}

/**
 * Generate a delivery report
 */
export async function generateDeliveryReport(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<ReportData> {
  const { data: deliveries } = await supabase
    .from('deliveries')
    .select('id, status, created_at, completed_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const statusBreakdown: Record<string, number> = {}
  let totalProcessingTime = 0
  let completedCount = 0

  deliveries?.forEach((d) => {
    statusBreakdown[d.status] = (statusBreakdown[d.status] || 0) + 1
    if (d.status === 'completed' && d.completed_at) {
      const processingTime = new Date(d.completed_at).getTime() - new Date(d.created_at).getTime()
      totalProcessingTime += processingTime
      completedCount++
    }
  })

  const avgProcessingTimeMs = completedCount > 0 ? totalProcessingTime / completedCount : 0

  return {
    title: 'Delivery Performance Report',
    generatedAt: new Date().toISOString(),
    dateRange: { start: startDate, end: endDate },
    data: {
      totalDeliveries: deliveries?.length || 0,
      statusBreakdown,
      completionRate: deliveries?.length
        ? ((completedCount / deliveries.length) * 100).toFixed(1)
        : '0',
      avgProcessingTimeHours: (avgProcessingTimeMs / (1000 * 60 * 60)).toFixed(1),
    },
  }
}

/**
 * Generate an admin activity report
 */
export async function generateAdminActivityReport(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<ReportData> {
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('id, admin_id, action, entity_type, created_at, admin:admins(email)')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const actionBreakdown: Record<string, number> = {}
  const adminBreakdown: Record<string, { email: string; count: number }> = {}

  logs?.forEach((log) => {
    actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1
    const admin = log.admin as unknown as { email: string } | null
    const adminKey = log.admin_id
    if (!adminBreakdown[adminKey]) {
      adminBreakdown[adminKey] = { email: admin?.email || 'Unknown', count: 0 }
    }
    adminBreakdown[adminKey].count++
  })

  return {
    title: 'Admin Activity Report',
    generatedAt: new Date().toISOString(),
    dateRange: { start: startDate, end: endDate },
    data: {
      totalActions: logs?.length || 0,
      actionBreakdown,
      topAdmins: Object.values(adminBreakdown)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    },
  }
}

/**
 * Export report data to CSV string
 */
export function reportToCSV(report: ReportData): string {
  const rows: string[] = []

  rows.push(`"${report.title}"`)
  rows.push(`"Generated: ${new Date(report.generatedAt).toLocaleString()}"`)
  if (report.dateRange.start) {
    rows.push(`"Date Range: ${report.dateRange.start} to ${report.dateRange.end}"`)
  }
  rows.push('')

  // Flatten data into key-value pairs
  for (const [key, value] of Object.entries(report.data)) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      rows.push(`"${key}"`)
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        rows.push(`"${k}","${v}"`)
      }
      rows.push('')
    } else if (Array.isArray(value)) {
      rows.push(`"${key}"`)
      if (value.length > 0 && typeof value[0] === 'object') {
        const headers = Object.keys(value[0])
        rows.push(headers.map((h) => `"${h}"`).join(','))
        for (const item of value) {
          rows.push(headers.map((h) => `"${(item as Record<string, unknown>)[h]}"`).join(','))
        }
      }
      rows.push('')
    } else {
      rows.push(`"${key}","${value}"`)
    }
  }

  return rows.join('\n')
}
