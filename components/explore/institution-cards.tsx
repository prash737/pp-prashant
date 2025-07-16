import Image from "next/image"
import Link from "next/link"
import { MapPin, Users, Award } from "lucide-react"

export function InstitutionCards() {
  const institutions = [
    {
      id: 1,
      name: "Stanford University",
      image: "/stanford-aerial-map.png",
      location: "Stanford, CA",
      students: "16,520+",
      programs: "90+ programs",
      type: "University",
    },
    {
      id: 2,
      name: "MIT",
      image: "/university-classroom.png",
      location: "Cambridge, MA",
      students: "11,376+",
      programs: "120+ programs",
      type: "University",
    },
    {
      id: 3,
      name: "Berkeley High School",
      image: "/diverse-classroom-teacher.png",
      location: "Berkeley, CA",
      students: "3,200+",
      programs: "25+ programs",
      type: "High School",
    },
    {
      id: 4,
      name: "Code Academy",
      image: "/computer-science-education.png",
      location: "Online",
      students: "45,000+",
      programs: "30+ programs",
      type: "Online Learning",
    },
  ]

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Educational Institutions</h2>
        <Link href="/explore/institutions" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {institutions.map((institution) => (
          <div
            key={institution.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-32">
              <Image
                src={institution.image || "/placeholder.svg"}
                alt={institution.name}
                className="object-cover"
                fill
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">{institution.name}</h3>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <MapPin size={14} className="mr-1" />
                <span>{institution.location}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Users size={14} className="mr-1" />
                <span>{institution.students}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <Award size={14} className="mr-1" />
                <span>{institution.programs}</span>
              </div>
              <div className="mt-3">
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {institution.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
