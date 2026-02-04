import { SupabaseClient } from '@supabase/supabase-js'

export interface SecurityAlert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  admin_id?: string
  admin_email?: string
  ip_address?: string
  created_at: string
  acknowledged: boolean
}

export type AlertCondition = {
  type: string
  check: (supabase: SupabaseClient) => Promise<SecurityAlert[]>
}

/**
 * Check for failed login attempts (>3 in last 5 minutes)
 */
async function checkFailedLogins(supabase: SupabaseClient): Promise<SecurityAlert[]> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('admin_id, ip_address, created_at, admin:admins(email)')
    .eq('action', 'login_failed')
    .gte('created_at', fiveMinutesAgo)

  if (!logs || logs.length === 0) return []

  // Group by admin/IP
  const grouped = new Map<string, typeof logs>()
  for (const log of logs) {
    const key = log.admin_id || log.ip_address || 'unknown'
    const existing = grouped.get(key) || []
    existing.push(log)
    grouped.set(key, existing)
  }

  const alerts: SecurityAlert[] = []
  for (const [key, entries] of grouped) {
    if (entries.length >= 3) {
      const admin = entries[0]?.admin as unknown as { email: string } | null
      alerts.push({
        id: `failed_login_${key}_${Date.now()}`,
        type: 'failed_logins',
        severity: entries.length >= 5 ? 'critical' : 'warning',
        title: 'Multiple Failed Login Attempts',
        description: `${entries.length} failed login attempts in the last 5 minutes${admin?.email ? ` for ${admin.email}` : ''}`,
        admin_id: entries[0]?.admin_id || undefined,
        admin_email: admin?.email || undefined,
        ip_address: entries[0]?.ip_address || undefined,
        created_at: entries[0]?.created_at || new Date().toISOString(),
        acknowledged: false,
      })
    }
  }

  return alerts
}

/**
 * Check for new IP address logins
 */
async function checkNewIPLogins(supabase: SupabaseClient): Promise<SecurityAlert[]> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: recentLogins } = await supabase
    .from('audit_logs')
    .select('admin_id, ip_address, created_at, admin:admins(email)')
    .eq('action', 'login_success')
    .gte('created_at', oneDayAgo)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!recentLogins || recentLogins.length === 0) return []

  const alerts: SecurityAlert[] = []

  for (const login of recentLogins) {
    if (!login.ip_address || !login.admin_id) continue

    // Check if this IP was used before
    const { count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('admin_id', login.admin_id)
      .eq('ip_address', login.ip_address)
      .eq('action', 'login_success')
      .lt('created_at', oneDayAgo)

    if (count === 0) {
      const admin = login.admin as unknown as { email: string } | null
      alerts.push({
        id: `new_ip_${login.admin_id}_${login.ip_address}`,
        type: 'new_ip_login',
        severity: 'warning',
        title: 'Login from New IP Address',
        description: `${admin?.email || 'Admin'} logged in from a new IP: ${login.ip_address}`,
        admin_id: login.admin_id,
        admin_email: admin?.email || undefined,
        ip_address: login.ip_address,
        created_at: login.created_at,
        acknowledged: false,
      })
    }
  }

  return alerts
}

/**
 * Check for bulk operations (>10 items)
 */
async function checkBulkOperations(supabase: SupabaseClient): Promise<SecurityAlert[]> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('id, admin_id, action, details, created_at, admin:admins(email)')
    .in('action', ['bulk_update', 'bulk_delete', 'bulk_import'])
    .gte('created_at', oneHourAgo)

  if (!logs || logs.length === 0) return []

  return logs.map((log) => {
    const admin = log.admin as unknown as { email: string } | null
    const details = log.details as Record<string, unknown> | null
    const count = (details?.count as number) || 0
    return {
      id: `bulk_op_${log.id}`,
      type: 'bulk_operation',
      severity: count > 50 ? 'critical' : 'warning',
      title: 'Bulk Operation Detected',
      description: `${admin?.email || 'Admin'} performed ${log.action} affecting ${count} items`,
      admin_id: log.admin_id,
      admin_email: admin?.email || undefined,
      created_at: log.created_at,
      acknowledged: false,
    }
  })
}

/**
 * Check for burn operations
 */
async function checkBurnOperations(supabase: SupabaseClient): Promise<SecurityAlert[]> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: burns } = await supabase
    .from('burn_events')
    .select('id, amount, player_id, created_at')
    .gte('created_at', oneDayAgo)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!burns || burns.length === 0) return []

  return burns
    .filter((burn) => burn.amount > 1000)
    .map((burn) => ({
      id: `burn_${burn.id}`,
      type: 'large_burn',
      severity: burn.amount > 10000 ? ('critical' as const) : ('warning' as const),
      title: 'Large Burn Operation',
      description: `${burn.amount} _unSC tokens burned`,
      created_at: burn.created_at,
      acknowledged: false,
    }))
}

/**
 * Check for 2FA disable events
 */
async function check2FADisable(supabase: SupabaseClient): Promise<SecurityAlert[]> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('id, admin_id, created_at, admin:admins(email)')
    .eq('action', '2fa_disabled')
    .gte('created_at', oneDayAgo)

  if (!logs || logs.length === 0) return []

  return logs.map((log) => {
    const admin = log.admin as unknown as { email: string } | null
    return {
      id: `2fa_disable_${log.id}`,
      type: '2fa_disabled',
      severity: 'critical' as const,
      title: '2FA Disabled',
      description: `${admin?.email || 'Admin'} disabled two-factor authentication`,
      admin_id: log.admin_id,
      admin_email: admin?.email || undefined,
      created_at: log.created_at,
      acknowledged: false,
    }
  })
}

/**
 * Run all security alert checks
 */
export async function getSecurityAlerts(supabase: SupabaseClient): Promise<SecurityAlert[]> {
  const [failedLogins, newIPs, bulkOps, burns, twoFADisable] = await Promise.all([
    checkFailedLogins(supabase).catch(() => []),
    checkNewIPLogins(supabase).catch(() => []),
    checkBulkOperations(supabase).catch(() => []),
    checkBurnOperations(supabase).catch(() => []),
    check2FADisable(supabase).catch(() => []),
  ])

  const allAlerts = [...failedLogins, ...newIPs, ...bulkOps, ...burns, ...twoFADisable]

  // Sort by severity (critical first) then by date
  const severityOrder = { critical: 0, warning: 1, info: 2 }
  allAlerts.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (sevDiff !== 0) return sevDiff
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return allAlerts
}
