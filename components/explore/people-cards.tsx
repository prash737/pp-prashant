import Image from "next/image"
import { UserPlus } from "lucide-react"

export function PeopleCards() {
  const people = [
    {
      id: 1,
      name: "Dr. Jane Smith",
      image: "/diverse-female-student.png",
      role: "Mentor",
      expertise: "Computer Science, AI Ethics",
      mutualConnections: 3,
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      image: "/asian-professor.png",
      role: "Mentor",
      expertise: "Physics, Mathematics",
      mutualConnections: 5,
    },
    {
      id: 3,
      name: "Sarah Johnson",
      image: "/student-with-hat.png",
      role: "Student",
      expertise: "Biology, Chemistry",
      mutualConnections: 2,
    },
    {
      id: 4,
      name: "Dr. Robert Williams",
      image: "/math-teacher.png",
      role: "Mentor",
      expertise: "Mathematics, Statistics",
      mutualConnections: 1,
    },
  ]

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">People You Might Want to Connect With</h2>
        <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">View all</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {people.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                  <Image src={person.image || "/placeholder.svg"} alt={person.name} className="object-cover" fill />
                </div>
                <div>
                  <h3 className="font-semibold">{person.name}</h3>
                  <div className="text-sm text-gray-500">{person.role}</div>
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-3">
                <span className="font-medium">Expertise:</span> {person.expertise}
              </div>
              <div className="text-xs text-gray-500 mb-3">{person.mutualConnections} mutual connections</div>
              <button className="w-full flex items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-medium py-1.5 rounded transition-colors">
                <UserPlus size={16} className="mr-1" />
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
