
import { NextRequest, NextResponse } from 'next/server'
import { convertFileToBase64 } from '@/lib/image-utils'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size too large. Maximum 5MB allowed.' })
    }

    // Convert to base64
    const base64Data = await convertFileToBase64(file)

    // Return the base64 data URL
    return NextResponse.json({ 
      success: true, 
      url: base64Data
    })
  } catch (error) {
    console.error('Error uploading facility image:', error)
    return NextResponse.json({ error: 'Failed to upload facility image' }, { status: 500 })
  }
}
