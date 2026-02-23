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

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Run all count queries in parallel instead of fetching full status column
    const [
      pendingResult,
      processingResult,
      completedResult,
      failedResult,
      totalResult,
      recentResult,
      todayCompletedResult,
    ] = await Promise.all([
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
      supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'failed'),
      supabase.from('deliveries').select('id', { count: 'exact', head: true }),
      supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString()),
      supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', today.toISOString()),
    ])

    return NextResponse.json({
      stats: {
        pending: pendingResult.count || 0,
        processing: processingResult.count || 0,
        completed: completedResult.count || 0,
        failed: failedResult.count || 0,
        total: totalResult.count || 0,
      },
      recent24h: recentResult.count || 0,
      todayCompleted: todayCompletedResult.count || 0,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
