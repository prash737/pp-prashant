
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching social contact data')

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id

    // Fetch profile data using direct Supabase query
    console.log('🔍 Supabase Query: Fetching profile data for user:', userId)
    console.log('📝 Query Details: SELECT email, phone FROM profiles WHERE id = ?')
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, phone')
      .eq('id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Fetch social links using direct Supabase query
    console.log('🔍 Supabase Query: Fetching social links for user:', userId)
    console.log('📝 Query Details: SELECT * FROM social_links WHERE user_id = ?')
    
    const { data: socialLinksData, error: socialLinksError } = await supabase
      .from('social_links')
      .select('*')
      .eq('user_id', userId)

    if (socialLinksError) {
      console.error('❌ Error fetching social links:', socialLinksError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Transform snake_case fields to camelCase for frontend compatibility
    const socialLinks = (socialLinksData || []).map(link => ({
      id: link.id,
      userId: link.user_id,
      platform: link.platform,
      url: link.url,
      displayName: link.display_name,
      createdAt: link.created_at,
      updatedAt: link.updated_at
    }))

    console.log('✅ Fetched profile and social links:', { 
      email: profile?.email, 
      phone: profile?.phone, 
      socialLinksCount: socialLinks.length,
      socialLinksData: socialLinks
    })

    return NextResponse.json({ 
      profile: {
        email: profile?.email || null,
        phone: profile?.phone || null
      },
      socialLinks 
    })

  } catch (error) {
    console.error('❌ Error fetching social contact data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social contact data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Saving social contact data')

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    const body = await request.json()
    const { email, phone, socialLinks } = body

    console.log('📊 Received data:', { email, phone, socialLinksCount: socialLinks?.length || 0 })

    // Update profile contact info if provided
    if (email !== undefined || phone !== undefined) {
      const profileData: any = {}
      if (email !== undefined) profileData.email = email
      if (phone !== undefined) profileData.phone = phone
      
      console.log('🔍 Supabase Query: Updating profile contact info')
      console.log('📝 Query Details: UPDATE profiles SET ... WHERE id = ?')
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Error updating profile:', updateError)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
      
      console.log('✅ Updated profile contact info')
    }

    // Update social links if provided
    if (socialLinks && Array.isArray(socialLinks)) {
      // Delete existing social links for the user
      console.log('🔍 Supabase Query: Deleting existing social links')
      console.log('📝 Query Details: DELETE FROM social_links WHERE user_id = ?')
      
      const { error: deleteError } = await supabase
        .from('social_links')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.error('❌ Error deleting existing social links:', deleteError)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }

      console.log('✅ Deleted existing social links')

      // Create new social links if any provided
      if (socialLinks.length > 0) {
        // Construct social links data with URL building logic
        const socialLinksToCreate = socialLinks.map(link => {
          let fullUrl = link.url

          // Construct full URLs from handles using base URLs (existing logic)
          const baseUrls: { [key: string]: string } = {
            'instagram': 'https://instagram.com/',
            'facebook': 'https://facebook.com/',
            'linkedin': 'https://linkedin.com/in/',
            'x': 'https://x.com/',
            'twitter': 'https://x.com/',
            'behance': 'https://behance.net/',
            'dribbble': 'https://dribbble.com/'
          }

          // If platform has a base URL and the URL doesn't already start with http, construct it
          if (baseUrls[link.platform.toLowerCase()] && !fullUrl.startsWith('http')) {
            fullUrl = baseUrls[link.platform.toLowerCase()] + fullUrl
          }

          return {
            user_id: userId,
            platform: link.platform,
            url: fullUrl,
            display_name: link.displayName || null,
            created_at: new Date(),
            updated_at: new Date()
          }
        })

        console.log('🔍 Supabase Query: Creating new social links')
        console.log('📝 Query Details: INSERT INTO social_links VALUES (...) RETURNING *')
        
        const { data: createdLinks, error: createError } = await supabase
          .from('social_links')
          .insert(socialLinksToCreate)
          .select()

        if (createError) {
          console.error('❌ Error creating social links:', createError)
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        }

        // Transform response to camelCase for frontend compatibility
        const transformedLinks = (createdLinks || []).map(link => ({
          id: link.id,
          userId: link.user_id,
          platform: link.platform,
          url: link.url,
          displayName: link.display_name,
          createdAt: link.created_at,
          updatedAt: link.updated_at
        }))
        
        console.log('✅ Updated social links:', transformedLinks.length)
        
        return NextResponse.json({ 
          message: 'Social contact data saved successfully',
          socialLinks: transformedLinks
        })
      }
    }

    return NextResponse.json({ message: 'Contact info saved successfully' })

  } catch (error) {
    console.error('❌ Error saving social contact data:', error)
    return NextResponse.json(
      { error: 'Failed to save social contact data' },
      { status: 500 }
    )
  }
}
