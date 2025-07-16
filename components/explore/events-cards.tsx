import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"

export function EventsCards() {
  const events = [
    {
      id: 1,
      title: "Robotics Workshop",
      image: "/images/robotics-workshop.png",
      date: "June 15, 2023",
      time: "10:00 AM - 2:00 PM",
      location: "Tech Center, Building 5",
      category: "Workshop",
    },
    {
      id: 2,
      title: "Science Fair 2023",
      image: "/images/science-fair.png",
      date: "July 8-10, 2023",
      time: "9:00 AM - 5:00 PM",
      location: "Main Campus, Exhibition Hall",
      category: "Fair",
    },
    {
      id: 3,
      title: "Coding Bootcamp",
      image: "/images/coding-bootcamp.png",
      date: "August 1-15, 2023",
      time: "Online, Self-paced",
      location: "Virtual",
      category: "Course",
    },
  ]

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        <Link href="/explore/events" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-40">
              <Image src={event.image || "/placeholder.svg"} alt={event.title} className="object-cover" fill />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                {event.category}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{event.title}</h3>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Calendar size={14} className="mr-1 flex-shrink-0" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Clock size={14} className="mr-1 flex-shrink-0" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <MapPin size={14} className="mr-1 flex-shrink-0" />
                <span>{event.location}</span>
              </div>
              <button className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-medium py-1.5 rounded transition-colors">
                RSVP
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
