import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getPackageInventory, getInventoryAlerts } from '@/lib/packages/inventory'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all active packages with their inventory status
    const { data: packages } = await supabase
      .from('packages')
      .select('id, name, is_active, is_featured')
      .eq('is_active', true)
      .order('name')

    if (!packages) {
      return NextResponse.json({ inventory: [], alerts: [] })
    }

    const inventory = await Promise.all(
      packages.map((pkg) => getPackageInventory(supabase, pkg.id))
    )

    const alerts = await getInventoryAlerts(supabase)

    return NextResponse.json({
      inventory: inventory.filter(Boolean),
      alerts,
      summary: {
        totalPackages: packages.length,
        lowStockCount: inventory.filter((i) => i?.isLowStock).length,
        totalAvailable: inventory.reduce((sum, i) => sum + (i?.availableNfts || 0), 0),
        totalSold: inventory.reduce((sum, i) => sum + (i?.soldNfts || 0), 0),
      },
    })
  } catch (error) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
