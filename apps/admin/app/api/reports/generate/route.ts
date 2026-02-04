import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getTemplate } from '@/lib/reports/templates'
import {
  generateSalesReport,
  generateInventoryReport,
  generateBurnReport,
  generateDeliveryReport,
  generateAdminActivityReport,
  reportToCSV,
} from '@/lib/reports/generator'
import { z } from 'zod'

const generateSchema = z.object({
  templateId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(['json', 'csv']).default('json'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = generateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { templateId, startDate, endDate, format } = result.data
    const template = getTemplate(templateId)

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const supabase = await createClient()

    // Default date range: last 30 days
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const end = endDate || new Date().toISOString()

    let report

    switch (templateId) {
      case 'sales_summary':
      case 'sales_by_package':
        report = await generateSalesReport(supabase, start, end)
        break
      case 'inventory_status':
      case 'nft_status':
        report = await generateInventoryReport(supabase)
        break
      case 'burn_report':
        report = await generateBurnReport(supabase, start, end)
        break
      case 'delivery_report':
        report = await generateDeliveryReport(supabase, start, end)
        break
      case 'admin_activity':
        report = await generateAdminActivityReport(supabase, start, end)
        break
      default:
        return NextResponse.json({ error: 'Unknown report type' }, { status: 400 })
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'report_generated',
      entity_type: 'report',
      details: { templateId, startDate: start, endDate: end, format },
    })

    if (format === 'csv') {
      const csv = reportToCSV(report)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${templateId}-${Date.now()}.csv"`,
        },
      })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
