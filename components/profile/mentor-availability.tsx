"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function MentorAvailability() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Mock availability data
  const weeklySchedule = [
    { day: "Monday", slots: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"] },
    { day: "Tuesday", slots: ["1:00 PM - 3:00 PM"] },
    { day: "Wednesday", slots: ["9:00 AM - 11:00 AM", "4:00 PM - 6:00 PM"] },
    { day: "Thursday", slots: [] },
    { day: "Friday", slots: ["11:00 AM - 1:00 PM"] },
    { day: "Saturday", slots: [] },
    { day: "Sunday", slots: [] },
  ]

  const upcomingSessions = [
    {
      menteeName: "Alex Johnson",
      date: "May 18, 2023",
      time: "10:30 AM - 11:30 AM",
      topic: "Research Project Review",
    },
    {
      menteeName: "Priya Sharma",
      date: "May 15, 2023",
      time: "3:30 PM - 4:30 PM",
      topic: "Career Planning Session",
    },
    {
      menteeName: "Marcus Williams",
      date: "May 20, 2023",
      time: "11:00 AM - 12:00 PM",
      topic: "Graduate Application Review",
    },
  ]

  const availableTimeSlots = [
    { date: "May 22, 2023", slots: ["10:00 AM", "11:00 AM", "3:00 PM", "4:00 PM"] },
    { date: "May 23, 2023", slots: ["1:00 PM", "2:00 PM"] },
    { date: "May 24, 2023", slots: ["9:00 AM", "10:00 AM", "4:00 PM", "5:00 PM"] },
    { date: "May 26, 2023", slots: ["11:00 AM", "12:00 PM"] },
  ]

  const mentorshipOptions = [
    {
      type: "One-time Consultation",
      duration: "60 minutes",
      price: "Free",
      description: "A single session to discuss specific questions or get advice on a particular topic.",
    },
    {
      type: "Short-term Mentorship",
      duration: "4 weeks (weekly sessions)",
      price: "Varies",
      description: "Focused guidance on a specific project, skill development, or short-term goal.",
    },
    {
      type: "Comprehensive Mentorship",
      duration: "3-6 months",
      price: "Varies",
      description: "In-depth mentorship with regular sessions, structured curriculum, and ongoing support.",
    },
  ]

  // Simplified calendar view (in a real app, you'd use a proper calendar component)
  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="space-y-8">
      {/* Book a Session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Book a Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-gray-700">
              Select a date and time slot to schedule a mentorship session. All times are in Pacific Time (PT).
            </p>
          </div>

          {/* Simplified Calendar UI */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Select a Date</h3>
            <div className="border rounded-lg p-4">
              <div className="text-center mb-4">
                <h4 className="font-medium">{currentMonth}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableTimeSlots.map((dateSlot, index) => (
                  <Button
                    key={index}
                    variant={selectedDate === dateSlot.date ? "default" : "outline"}
                    className={selectedDate === dateSlot.date ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    onClick={() => setSelectedDate(dateSlot.date as any)}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateSlot.date}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Select a Time</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableTimeSlots
                  .find((dateSlot) => dateSlot.date === selectedDate)
                  ?.slots.map((timeSlot, index) => (
                    <Button key={index} variant="outline" className="text-gray-700">
                      {timeSlot}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* Mentorship Options */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Mentorship Options</h3>
            <div className="space-y-4">
              {mentorshipOptions.map((option, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:border-emerald-500 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">{option.type}</h4>
                    <Badge
                      variant={index === 0 ? "default" : "outline"}
                      className={index === 0 ? "bg-emerald-100 text-emerald-800" : ""}
                    >
                      {option.price}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-2">{option.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {option.duration}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Request Mentorship</Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-emerald-600" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.map((session, index) => (
              <div key={index} className="flex items-center border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mr-4 w-12 h-12 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-gray-900">{session.menteeName}</h4>
                  <p className="text-gray-600">{session.topic}</p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>{session.date}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{session.time}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
