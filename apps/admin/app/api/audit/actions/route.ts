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

    // Get distinct actions
    const { data: actionsData, error: actionsError } = await supabase
      .from('audit_logs')
      .select('action')

    if (actionsError) {
      console.error('Actions fetch error:', actionsError)
      return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 })
    }

    // Get distinct entity types
    const { data: entityTypesData, error: entityTypesError } = await supabase
      .from('audit_logs')
      .select('entity_type')

    if (entityTypesError) {
      console.error('Entity types fetch error:', entityTypesError)
      return NextResponse.json({ error: 'Failed to fetch entity types' }, { status: 500 })
    }

    // Get unique values
    const actions = [...new Set(actionsData?.map((a) => a.action).filter(Boolean))]
    const entityTypes = [...new Set(entityTypesData?.map((e) => e.entity_type).filter(Boolean))]

    return NextResponse.json({
      actions,
      entityTypes,
    })
  } catch (error) {
    console.error('Audit actions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
