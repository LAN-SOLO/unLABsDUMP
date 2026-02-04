import { SupabaseClient } from '@supabase/supabase-js'

export interface InventoryStatus {
  packageId: string
  packageName: string
  totalNfts: number
  availableNfts: number
  reservedNfts: number
  soldNfts: number
  isLowStock: boolean
}

export interface InventoryAlert {
  packageId: string
  packageName: string
  available: number
  threshold: number
  severity: 'warning' | 'critical'
}

const LOW_STOCK_THRESHOLD = 5
const CRITICAL_STOCK_THRESHOLD = 1

/**
 * Get inventory status for a specific package
 */
export async function getPackageInventory(
  supabase: SupabaseClient,
  packageId: string
): Promise<InventoryStatus | null> {
  const { data: pkg } = await supabase
    .from('packages')
    .select('id, name')
    .eq('id', packageId)
    .single()

  if (!pkg) return null

  // Get total NFTs in package
  const { count: totalNfts } = await supabase
    .from('package_nfts')
    .select('*', { count: 'exact', head: true })
    .eq('package_id', packageId)

  // Get NFTs that have been sold (purchased/delivered)
  const { count: soldNfts } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('package_id', packageId)
    .in('status', ['completed', 'delivered'])

  // Get NFTs currently reserved (pending purchase)
  const { count: reservedNfts } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('package_id', packageId)
    .eq('status', 'pending')

  const total = totalNfts || 0
  const sold = soldNfts || 0
  const reserved = reservedNfts || 0
  const available = Math.max(0, total - sold - reserved)

  return {
    packageId,
    packageName: pkg.name,
    totalNfts: total,
    availableNfts: available,
    reservedNfts: reserved,
    soldNfts: sold,
    isLowStock: available <= LOW_STOCK_THRESHOLD,
  }
}

/**
 * Get inventory alerts for all active packages
 */
export async function getInventoryAlerts(supabase: SupabaseClient): Promise<InventoryAlert[]> {
  const { data: packages } = await supabase
    .from('packages')
    .select('id, name')
    .eq('is_active', true)

  if (!packages) return []

  const alerts: InventoryAlert[] = []

  for (const pkg of packages) {
    const inventory = await getPackageInventory(supabase, pkg.id)
    if (!inventory) continue

    if (inventory.availableNfts <= CRITICAL_STOCK_THRESHOLD) {
      alerts.push({
        packageId: pkg.id,
        packageName: pkg.name,
        available: inventory.availableNfts,
        threshold: CRITICAL_STOCK_THRESHOLD,
        severity: 'critical',
      })
    } else if (inventory.availableNfts <= LOW_STOCK_THRESHOLD) {
      alerts.push({
        packageId: pkg.id,
        packageName: pkg.name,
        available: inventory.availableNfts,
        threshold: LOW_STOCK_THRESHOLD,
        severity: 'warning',
      })
    }
  }

  return alerts
}

/**
 * Check if a package has enough inventory for a purchase
 */
export async function checkAvailability(
  supabase: SupabaseClient,
  packageId: string,
  quantity: number = 1
): Promise<{ available: boolean; remaining: number }> {
  const inventory = await getPackageInventory(supabase, packageId)
  if (!inventory) {
    return { available: false, remaining: 0 }
  }

  return {
    available: inventory.availableNfts >= quantity,
    remaining: inventory.availableNfts,
  }
}
