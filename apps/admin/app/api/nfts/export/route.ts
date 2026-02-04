import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const status = searchParams.get('status')
    const rarity = searchParams.get('rarity')
    const collection = searchParams.get('collection')

    const supabase = await createClient()

    let query = supabase
      .from('nfts')
      .select(
        'id, name, description, image_url, metadata, rarity, collection, mint_address, status, created_at, updated_at'
      )
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (rarity) {
      query = query.eq('rarity', rarity)
    }

    if (collection) {
      query = query.eq('collection', collection)
    }

    const { data: nfts, error } = await query

    if (error) {
      console.error('Export error:', error)
      return NextResponse.json({ error: 'Failed to export NFTs' }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'nft_exported',
      entity_type: 'nft',
      details: { count: nfts?.length || 0, format },
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'id',
        'name',
        'description',
        'image_url',
        'rarity',
        'collection',
        'mint_address',
        'status',
        'created_at',
      ]
      const csvRows = [headers.join(',')]

      for (const nft of nfts || []) {
        const row = headers.map((header) => {
          const value = nft[header as keyof typeof nft]
          if (value === null || value === undefined) return ''
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value)
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        csvRows.push(row.join(','))
      }

      const csvContent = csvRows.join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="nfts-export-${Date.now()}.csv"`,
        },
      })
    }

    // Default to JSON
    return new NextResponse(JSON.stringify(nfts, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="nfts-export-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
