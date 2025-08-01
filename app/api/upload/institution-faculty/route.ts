import { NextRequest, NextResponse } from 'next/server'
import { convertImageToBase64 } from '@/lib/image-utils'

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

    // Convert to base64
    const base64Data = await convertImageToBase64(file)

    // Return the base64 data URL
    return NextResponse.json({ 
      success: true, 
      url: base64Data
    })
  } catch (error) {
    console.error('Error uploading faculty image:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload image' })
  }
}