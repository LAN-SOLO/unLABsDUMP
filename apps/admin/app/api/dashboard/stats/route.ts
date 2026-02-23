import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getInventoryAlerts } from '@/lib/packages/inventory'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    // Run ALL independent count queries in parallel
    const [
      totalNftsResult,
      activeNftsResult,
      totalPackagesResult,
      activePackagesResult,
      featuredPackagesResult,
      pendingDeliveriesResult,
      processingDeliveriesResult,
      completedDeliveriesResult,
      burnDataResult,
      thisMonthBurnResult,
      totalPlayersResult,
      recentActivityResult,
      // Batch: last 7 days of purchases and deliveries
      recentPurchasesResult,
      recentCompletedDeliveriesResult,
      inventoryAlerts,
    ] = await Promise.all([
      supabase.from('nfts').select('id', { count: 'exact', head: true }).neq('status', 'deleted'),
      supabase.from('nfts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('packages').select('id', { count: 'exact', head: true }),
      supabase.from('packages').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase
        .from('packages')
        .select('id', { count: 'exact', head: true })
        .eq('is_featured', true),
      supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'processing'),
      supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed'),
      // Fetch burn amounts (completed only) - single query instead of full table scan
      supabase.from('burn_events').select('amount, created_at').eq('status', 'completed'),
      // This month burns - redundant with above but keeps logic clear
      supabase
        .from('burn_events')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', thisMonth.toISOString()),
      supabase.from('players').select('id', { count: 'exact', head: true }),
      supabase
        .from('audit_logs')
        .select('id, action, entity_type, created_at, admin:admins(email)')
        .order('created_at', { ascending: false })
        .limit(10),
      // Batch fetch last 7 days: get all purchases in range (just created_at for grouping)
      supabase.from('purchases').select('created_at').gte('created_at', sevenDaysAgo.toISOString()),
      // Batch fetch last 7 days: get all completed deliveries in range
      supabase
        .from('deliveries')
        .select('completed_at')
        .eq('status', 'completed')
        .gte('completed_at', sevenDaysAgo.toISOString()),
      getInventoryAlerts(supabase),
    ])

    // Calculate burn totals from single query
    let totalBurned = 0
    burnDataResult.data?.forEach((burn) => {
      totalBurned += burn.amount
    })

    let thisMonthBurned = 0
    thisMonthBurnResult.data?.forEach((burn) => {
      thisMonthBurned += burn.amount
    })

    // Build 7-day chart from batch data (client-side grouping instead of 14 queries)
    const last7Days: Array<{ date: string; sales: number; deliveries: number }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dateStr = date.toISOString()
      const nextDateStr = nextDate.toISOString()

      const daySales =
        recentPurchasesResult.data?.filter(
          (p) => p.created_at >= dateStr && p.created_at < nextDateStr
        ).length || 0

      const dayDeliveries =
        recentCompletedDeliveriesResult.data?.filter(
          (d) => d.completed_at && d.completed_at >= dateStr && d.completed_at < nextDateStr
        ).length || 0

      last7Days.push({
        date: date.toISOString().split('T')[0],
        sales: daySales,
        deliveries: dayDeliveries,
      })
    }

    return NextResponse.json({
      nfts: {
        total: totalNftsResult.count || 0,
        active: activeNftsResult.count || 0,
      },
      packages: {
        total: totalPackagesResult.count || 0,
        active: activePackagesResult.count || 0,
        featured: featuredPackagesResult.count || 0,
      },
      deliveries: {
        pending: pendingDeliveriesResult.count || 0,
        processing: processingDeliveriesResult.count || 0,
        completed: completedDeliveriesResult.count || 0,
      },
      burns: {
        total: totalBurned,
        thisMonth: thisMonthBurned,
      },
      players: {
        total: totalPlayersResult.count || 0,
      },
      recentActivity: recentActivityResult.data || [],
      charts: {
        last7Days,
      },
      inventoryAlerts,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
