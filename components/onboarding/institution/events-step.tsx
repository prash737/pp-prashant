"use client"

import { useState } from "react"
import { Plus, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
}

interface EventsStepProps {
  initialData: Event[]
  onComplete: (data: Event[]) => void
  onNext: () => void
  onSkip: () => void
}

export default function EventsStep({ initialData = [], onComplete, onNext, onSkip }: EventsStepProps) {
  const [events, setEvents] = useState<Event[]>(initialData.length > 0 ? initialData : [])
  const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({
    name: "",
    description: "",
    date: "",
    location: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleAddEvent = () => {
    if (!currentEvent.name) return

    const newEvent = {
      ...currentEvent,
      id: Date.now().toString(),
    } as Event

    setEvents([...events, newEvent])
    setCurrentEvent({
      name: "",
      description: "",
      date: "",
      location: "",
    })
    setIsEditing(false)
  }

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const handleSave = () => {
    onComplete(events)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Upcoming Events</h2>
        <p className="text-slate-600">
          Add upcoming events at your institution to showcase activities and opportunities.
        </p>
      </div>

      {/* List of added events */}
      {events.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-700">Your Events</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between p-4 bg-purple-50 rounded-lg border border-purple-100"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <h4 className="font-medium text-slate-800">{event.name}</h4>
                  </div>
                  <p className="text-sm text-slate-600">{event.description}</p>
                  <div className="flex gap-4 text-xs text-slate-500 mt-1">
                    <span>Date: {event.date}</span>
                    <span>Location: {event.location}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveEvent(event.id)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add event form */}
      {isEditing ? (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
          <h3 className="text-lg font-medium text-slate-700">Add New Event</h3>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                placeholder="e.g., Open House"
                value={currentEvent.name}
                onChange={(e) => setCurrentEvent({ ...currentEvent, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                placeholder="Brief description of the event..."
                value={currentEvent.description}
                onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={currentEvent.date}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  placeholder="e.g., Main Campus"
                  value={currentEvent.location}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAddEvent}
              disabled={!currentEvent.name}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Add Event
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentEvent({
                  name: "",
                  description: "",
                  date: "",
                  location: "",
                })
                setIsEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
          {events.length > 0 ? "Save & Continue" : "Continue"}
        </Button>
      </div>
    </div>
  )
}
