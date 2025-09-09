
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching achievement categories')
    
    // Fetch achievement categories using direct Supabase query
    const { data: categories, error } = await supabase
      .from('achievement_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Error fetching achievement categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch achievement categories' },
        { status: 500 }
      )
    }

    console.log(`✅ Fetched ${categories?.length || 0} achievement categories`)
    return NextResponse.json({ categories: categories || [] })
  } catch (error) {
    console.error('❌ Error fetching achievement categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievement categories' },
      { status: 500 }
    )
  }
}
