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

    // Get total burned
    const { data: allBurns, error: burnsError } = await supabase
      .from('burn_events')
      .select('amount, token_type, status, created_at, player_id')

    if (burnsError) {
      console.error('Burns stats error:', burnsError)
      return NextResponse.json({ error: 'Failed to fetch burn stats' }, { status: 500 })
    }

    const burns = allBurns || []

    // Calculate totals
    let totalBurned = 0
    let completedBurns = 0
    let pendingBurns = 0

    burns.forEach((burn) => {
      if (burn.status === 'completed') {
        totalBurned += burn.amount
        completedBurns++
      } else if (burn.status === 'pending') {
        pendingBurns++
      }
    })

    // Calculate this month's burns
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    let thisMonthBurned = 0
    burns.forEach((burn) => {
      if (burn.status === 'completed' && new Date(burn.created_at) >= thisMonth) {
        thisMonthBurned += burn.amount
      }
    })

    // Calculate last 7 days by day
    const last7Days: Array<{ date: string; amount: number }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      let dayAmount = 0
      burns.forEach((burn) => {
        const burnDate = new Date(burn.created_at)
        if (burn.status === 'completed' && burnDate >= date && burnDate < nextDate) {
          dayAmount += burn.amount
        }
      })

      last7Days.push({
        date: date.toISOString().split('T')[0],
        amount: dayAmount,
      })
    }

    // Get unique burners count
    const uniqueBurners = new Set(burns.map((b) => b.player_id)).size

    return NextResponse.json({
      totalBurned,
      thisMonthBurned,
      completedBurns,
      pendingBurns,
      totalEvents: burns.length,
      uniqueBurners,
      last7Days,
    })
  } catch (error) {
    console.error('Burns stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
