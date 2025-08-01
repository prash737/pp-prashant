
import { NextRequest, NextResponse } from 'next/server'
import { convertRequestFileToBase64, validateImageSize } from '@/lib/image-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Institution event upload request received')

    // Convert uploaded file to base64
    const base64Image = await convertRequestFileToBase64(request)
    
    // Validate image size (max 5MB)
    if (!validateImageSize(base64Image, 5)) {
      return NextResponse.json(
        { error: 'Image size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    console.log('✅ Institution event image converted to base64 successfully')

    return NextResponse.json({
      success: true,
      url: base64Image // Return base64 data URL directly
    })
  } catch (error) {
    console.error('Error uploading event image:', error)
    return NextResponse.json(
      { error: 'Failed to upload event image' },
      { status: 500 }
    )
  }
}
