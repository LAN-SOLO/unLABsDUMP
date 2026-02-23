import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

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

    // Run all queries in parallel instead of fetching full table
    const [
      completedBurnsResult,
      pendingBurnsResult,
      totalEventsResult,
      // Fetch only completed burns with amounts for aggregation (limited scope)
      completedAmountsResult,
      thisMonthAmountsResult,
      // Last 7 days completed burns for chart
      last7DaysBurnsResult,
    ] = await Promise.all([
      supabase
        .from('burn_events')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed'),
      supabase
        .from('burn_events')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('burn_events').select('id', { count: 'exact', head: true }),
      // Get completed burn amounts
      supabase.from('burn_events').select('amount').eq('status', 'completed'),
      // This month's completed burns
      supabase
        .from('burn_events')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', thisMonth.toISOString()),
      // Last 7 days for chart (only need amount + created_at)
      supabase
        .from('burn_events')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', sevenDaysAgo.toISOString()),
    ])

    // Sum amounts
    let totalBurned = 0
    completedAmountsResult.data?.forEach((b) => {
      totalBurned += b.amount
    })

    let thisMonthBurned = 0
    thisMonthAmountsResult.data?.forEach((b) => {
      thisMonthBurned += b.amount
    })

    // Build 7-day chart from batch data
    const last7Days: Array<{ date: string; amount: number }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dateStr = date.toISOString()
      const nextDateStr = nextDate.toISOString()

      let dayAmount = 0
      last7DaysBurnsResult.data?.forEach((burn) => {
        if (burn.created_at >= dateStr && burn.created_at < nextDateStr) {
          dayAmount += burn.amount
        }
      })

      last7Days.push({
        date: date.toISOString().split('T')[0],
        amount: dayAmount,
      })
    }

    return NextResponse.json({
      totalBurned,
      thisMonthBurned,
      completedBurns: completedBurnsResult.count || 0,
      pendingBurns: pendingBurnsResult.count || 0,
      totalEvents: totalEventsResult.count || 0,
      uniqueBurners: 0, // Removed: required full table scan for Set(); add RPC if needed
      last7Days,
    })
  } catch (error) {
    console.error('Burns stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
