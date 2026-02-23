import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

// Known audit actions and entity types (code-defined constants).
// Update these when new audit_logs.insert() calls are added.
const ACTIONS = [
  'burn_created',
  'delivery_created',
  'delivery_failed',
  'delivery_processed',
  'delivery_updated',
  'metadata_updated',
  'nft_bulk_deleted',
  'nft_bulk_imported',
  'nft_bulk_updated',
  'nft_created',
  'nft_deleted',
  'nft_exported',
  'nft_updated',
  'package_created',
  'package_deleted',
  'package_updated',
  'report_generated',
]

const ENTITY_TYPES = ['burn_event', 'delivery', 'nft', 'package', 'report']

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      actions: ACTIONS,
      entityTypes: ENTITY_TYPES,
    })
  } catch (error) {
    console.error('Audit actions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
