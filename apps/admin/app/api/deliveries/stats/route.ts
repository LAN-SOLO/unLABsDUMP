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

    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('deliveries')
      .select('status')

    if (statusError) {
      console.error('Stats fetch error:', statusError)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: statusCounts?.length || 0,
    }

    statusCounts?.forEach((delivery) => {
      if (delivery.status in stats) {
        stats[delivery.status as keyof typeof stats]++
      }
    })

    // Get recent deliveries count (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { count: recentCount } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString())

    // Get today's completed deliveries
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayCompleted } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', today.toISOString())

    return NextResponse.json({
      stats,
      recent24h: recentCount || 0,
      todayCompleted: todayCompleted || 0,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
