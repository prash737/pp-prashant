import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' })
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed' })
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size too large. Maximum 5MB allowed.' })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const filename = `${randomId}_${timestamp}${extension}`

    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'institutions', 'faculty')
    await mkdir(uploadDir, { recursive: true })

    // Write file
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    const publicUrl = `/uploads/institutions/faculty/${filename}`

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: filename
    })
  } catch (error) {
    console.error('Error uploading faculty image:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload image' })
  }
}