
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 })
    }

    // Validate file size (max 10MB for feed images)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public/uploads/feed-images')
    const { mkdir } = await import('fs/promises')
    await mkdir(uploadsDir, { recursive: true })

    // Save file to local directory
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Create public URL
    const publicUrl = `/uploads/feed-images/${fileName}`

    return NextResponse.json({ 
      success: true, 
      imageUrl: publicUrl
    })

  } catch (error) {
    console.error('Error uploading feed image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
