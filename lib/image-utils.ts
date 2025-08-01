
import { NextRequest } from 'next/server'

export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function convertRequestFileToBase64(request: NextRequest): Promise<string> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    return await convertFileToBase64(file)
  } catch (error) {
    console.error('Error converting file to base64:', error)
    throw error
  }
}

export function getImageMimeType(base64String: string): string {
  const match = base64String.match(/^data:([^;]+);base64,/)
  return match ? match[1] : 'image/jpeg'
}

export function validateImageSize(base64String: string, maxSizeInMB: number = 5): boolean {
  // Calculate size from base64 string (rough estimate)
  const sizeInBytes = (base64String.length * 3) / 4
  const sizeInMB = sizeInBytes / (1024 * 1024)
  return sizeInMB <= maxSizeInMB
}
