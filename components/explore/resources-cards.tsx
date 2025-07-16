import Image from "next/image"
import Link from "next/link"
import { BookOpen, Clock, Download } from "lucide-react"

export function ResourcesCards() {
  const resources = [
    {
      id: 1,
      title: "Advanced Math Tutorials",
      image: "/images/math-tutorial.png",
      type: "Tutorial Series",
      duration: "12 lessons, 6 hours",
      level: "Advanced",
      category: "Mathematics",
    },
    {
      id: 2,
      title: "Literature Study Guide",
      image: "/images/literature-guide.png",
      type: "Study Guide",
      duration: "8 chapters",
      level: "Intermediate",
      category: "Literature",
    },
    {
      id: 3,
      title: "Chemistry Experiments",
      image: "/images/chemistry-experiments.png",
      type: "Lab Guide",
      duration: "10 experiments",
      level: "Beginner",
      category: "Chemistry",
    },
  ]

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Educational Resources</h2>
        <Link href="/explore/resources" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-40">
              <Image src={resource.image || "/placeholder.svg"} alt={resource.title} className="object-cover" fill />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                {resource.category}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{resource.title}</h3>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <BookOpen size={14} className="mr-1 flex-shrink-0" />
                <span>{resource.type}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Clock size={14} className="mr-1 flex-shrink-0" />
                <span>{resource.duration}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-2">
                  {resource.level}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-medium py-1.5 rounded transition-colors">
                  View
                </button>
                <button className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 w-9 h-8 rounded transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
