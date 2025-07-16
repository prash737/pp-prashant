
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // In a production app, you would use a service like Unfurl or implement proper web scraping
    // For now, we'll return a basic preview structure
    const domain = new URL(url).hostname
    
    // Basic preview data - in production you'd fetch meta tags from the URL
    const preview = {
      title: `${domain} - Link Preview`,
      description: `Link to ${domain}`,
      image: null,
      url: url
    }

    return NextResponse.json(preview)
  } catch (error) {
    console.error('Error generating link preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate link preview' },
      { status: 500 }
    )
  }
}
