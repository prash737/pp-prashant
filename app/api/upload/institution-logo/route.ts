
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const filename = `${uuidv4()}_${Date.now()}.${file.name.split('.').pop()}`
    const path = join(process.cwd(), 'public/uploads/institutions/logos', filename)

    // Ensure directory exists
    const { mkdir } = await import('fs/promises')
    const { dirname } = await import('path')
    await mkdir(dirname(path), { recursive: true })

    await writeFile(path, buffer)
    
    const url = `/uploads/institutions/logos/${filename}`
    
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
  }
}
