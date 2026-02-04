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

    // Get NFT counts
    const { count: totalNfts } = await supabase
      .from('nfts')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'deleted')

    const { count: activeNfts } = await supabase
      .from('nfts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get package counts
    const { count: totalPackages } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })

    const { count: activePackages } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: featuredPackages } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true)

    // Get delivery counts
    const { count: pendingDeliveries } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: processingDeliveries } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing')

    const { count: completedDeliveries } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Get burn totals
    const { data: burnData } = await supabase
      .from('burn_events')
      .select('amount')
      .eq('status', 'completed')

    let totalBurned = 0
    burnData?.forEach((burn) => {
      totalBurned += burn.amount
    })

    // Get this month's burns
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const { data: thisMonthBurnData } = await supabase
      .from('burn_events')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', thisMonth.toISOString())

    let thisMonthBurned = 0
    thisMonthBurnData?.forEach((burn) => {
      thisMonthBurned += burn.amount
    })

    // Get player count
    const { count: totalPlayers } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('audit_logs')
      .select('id, action, entity_type, created_at, admin:admins(email)')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get sales data for chart (last 7 days)
    const last7Days: Array<{ date: string; sales: number; deliveries: number }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const { count: daySales } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())

      const { count: dayDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', date.toISOString())
        .lt('completed_at', nextDate.toISOString())

      last7Days.push({
        date: date.toISOString().split('T')[0],
        sales: daySales || 0,
        deliveries: dayDeliveries || 0,
      })
    }

    // Get inventory alerts
    const inventoryAlerts = await getInventoryAlerts(supabase)

    return NextResponse.json({
      nfts: {
        total: totalNfts || 0,
        active: activeNfts || 0,
      },
      packages: {
        total: totalPackages || 0,
        active: activePackages || 0,
        featured: featuredPackages || 0,
      },
      deliveries: {
        pending: pendingDeliveries || 0,
        processing: processingDeliveries || 0,
        completed: completedDeliveries || 0,
      },
      burns: {
        total: totalBurned,
        thisMonth: thisMonthBurned,
      },
      players: {
        total: totalPlayers || 0,
      },
      recentActivity: recentActivity || [],
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
