import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if institutionId is provided (for public view)
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    const targetInstitutionId = institutionId || user.id

    console.log('Fetching events for institution:', targetInstitutionId)

    // Fetch events for this institution
    const events = await prisma.institutionEvents.findMany({
      where: { institutionId: targetInstitutionId },
      orderBy: { startDate: 'desc' }
    })

    console.log('Found events:', events.length)
    console.log('Events details:', events.map(e => ({
      id: e.id,
      title: e.title,
      eventType: e.event_type,
      startDate: e.start_date
    })))

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching institution events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Delete the specific event
    await prisma.institutionEvents.delete({
      where: { 
        id: eventId,
        institutionId: user.id // Ensure user owns this event
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting institution event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { events, preserveExisting } = body

    if (!preserveExisting) {
      // Legacy behavior - delete all existing events and replace
      await prisma.institutionEvents.deleteMany({
        where: { institutionId: user.id }
      })
    }

    // Process events
    if (events && events.length > 0) {
      const validEvents = events.filter((event: any) => 
        event.title && event.description && event.eventType && event.startDate
      )

      if (validEvents.length > 0) {
        for (const event of validEvents) {
          if (event.id && event.id !== '') {
            // Update existing event
            await prisma.institutionEvents.update({
              where: { 
                id: event.id,
                institutionId: user.id // Ensure user owns this event
              },
              data: {
                title: event.title,
                description: event.description,
                eventType: event.eventType,
                startDate: new Date(event.startDate),
                endDate: event.endDate ? new Date(event.endDate) : null,
                location: event.location || null,
                imageUrl: event.imageUrl || null,
                registrationUrl: event.registrationUrl || null
              }
            })
          } else {
            // Create new event
            await prisma.institutionEvents.create({
              data: {
                institutionId: user.id,
                title: event.title,
                description: event.description,
                eventType: event.eventType,
                startDate: new Date(event.startDate),
                endDate: event.endDate ? new Date(event.endDate) : null,
                location: event.location || null,
                imageUrl: event.imageUrl || null,
                registrationUrl: event.registrationUrl || null
              }
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving institution events:', error)
    return NextResponse.json({ error: 'Failed to save events' }, { status: 500 })
  }
}