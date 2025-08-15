
import { NextRequest, NextResponse } from 'next/server'
import { updateUserProfile, getUserSocialLinks, updateUserSocialLinks, getUserProfile } from '@/lib/db/profile'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching social contact data')

    // Get userId from query params or cookies
    const { searchParams } = new URL(request.url)
    let userId = searchParams.get('userId')
    
    // If no userId in query params, try to get from cookies
    if (!userId) {
      const cookieStore = request.cookies
      userId = cookieStore.get('sb-user-id')?.value
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Fetch profile data and social links - optimized parallel execution
    const [profile, socialLinks] = await Promise.all([
      getUserProfile(userId),
      getUserSocialLinks(userId)
    ])
    
    console.log('✅ Fetched profile and social links:', { email: profile?.email, phone: profile?.phone, socialLinksCount: socialLinks.length })

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

    const body = await request.json()
    const { userId, email, phone, socialLinks } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('📊 Received data:', { userId, email, phone, socialLinksCount: socialLinks?.length || 0 })

    // Update profile contact info and social links in parallel if both provided
    const promises = []
    
    if (email !== undefined || phone !== undefined) {
      const profileData: any = {}
      if (email !== undefined) profileData.email = email
      if (phone !== undefined) profileData.phone = phone
      
      promises.push(updateUserProfile(userId, profileData))
      console.log('✅ Queued profile contact info update')
    }

    if (socialLinks && Array.isArray(socialLinks)) {
      promises.push(updateUserSocialLinks(userId, socialLinks))
      console.log('✅ Queued social links update')
    }

    // Execute all updates in parallel for maximum speed
    const results = await Promise.all(promises)
    
    // Return updated social links if they were updated
    if (socialLinks && Array.isArray(socialLinks)) {
      const updatedLinks = results[promises.length - 1] // Last result is social links
      console.log('✅ Updated social links:', updatedLinks.length)
      
      return NextResponse.json({ 
        message: 'Social contact data saved successfully',
        socialLinks: updatedLinks
      })
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
