
import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate?: string
  location?: string
  imageUrl?: string
  registrationUrl?: string
}

type EventFilter = 'upcoming' | 'ongoing' | 'occurred'

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<EventFilter>('upcoming')

  useEffect(() => {
    fetchEvents(activeFilter)
  }, [activeFilter])

  const fetchEvents = async (filter: EventFilter = 'upcoming') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/institution/events?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getCategoryColor = (eventType: string) => {
    const colors: { [key: string]: string } = {
      'academic': 'bg-blue-600',
      'cultural': 'bg-purple-600',
      'sports': 'bg-red-600',
      'workshop': 'bg-teal-600',
      'seminar': 'bg-amber-600',
      'conference': 'bg-purple-600',
      'competition': 'bg-green-600'
    }
    return colors[eventType.toLowerCase()] || 'bg-gray-600'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Added Yet</h3>
              <p className="text-gray-500">
                Events and activities will be displayed here once they are added to the institution profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Split events into featured (first 2) and upcoming
  const featuredEvents = events.slice(0, 2)
  const upcomingEvents = events.slice(2)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Featured Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {featuredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                >
                  <div className="sm:w-1/3 relative h-40 sm:h-40 rounded-lg overflow-hidden">
                    <Image 
                      src={event.imageUrl || "/placeholder.svg"} 
                      alt={event.title} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center rounded-full border border-transparent ${getCategoryColor(event.eventType)} px-2.5 py-0.5 text-xs font-semibold text-white`}>
                        {event.eventType}
                      </span>
                    </div>
                  </div>
                  <div className="sm:w-2/3">
                    <h3 className="text-lg font-bold">{event.title}</h3>

                    <div className="space-y-1 my-2">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                        <span>{formatTime(event.startDate)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>

                    {event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm font-medium"
                      >
                        Register Now <ArrowRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <span className={`inline-flex items-center rounded-full border border-transparent ${getCategoryColor(event.eventType)} px-2 py-0.5 text-[10px] font-semibold text-white`}>
                          {event.eventType}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span>{formatTime(event.startDate)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Event Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveFilter('upcoming')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'upcoming'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Events Upcoming
                </button>
                <button
                  onClick={() => setActiveFilter('ongoing')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'ongoing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Events Going On
                </button>
                <button
                  onClick={() => setActiveFilter('occurred')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'occurred'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Events Occurred
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
