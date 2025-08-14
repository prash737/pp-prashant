
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Validate current token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }
    
    // For now, return the same token (Supabase handles refresh internally)
    // In a more complex setup, you might generate a new JWT here
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'student'
      }
    })
    
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json({ success: false, error: 'Refresh failed' }, { status: 500 })
  }
}
