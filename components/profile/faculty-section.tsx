import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ExternalLink, Award, BookOpen, Users } from "lucide-react"

interface Faculty {
  id: string
  name: string
  title: string
  department: string
  image: string
  expertise: string[]
  email: string
  featured: boolean
  bio?: string
  qualifications?: string
  experience?: string
  specialization?: string
}

export default function FacultySection() {
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/institution/faculty')
      if (response.ok) {
        const data = await response.json()
        setFacultyMembers(data.faculty || [])
      } else {
        throw new Error('Failed to fetch faculty')
      }
    } catch (error) {
      console.error('Error fetching faculty:', error)
      setError('Failed to load faculty')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading faculty...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (facultyMembers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-500">No faculty added yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Featured Faculty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {facultyMembers
                .filter((faculty) => faculty.featured)
                .map((faculty) => (
                  <div
                    key={faculty.id}
                    className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="sm:w-1/4 relative h-40 sm:h-40 rounded-lg overflow-hidden">
                      <Image
                        src={faculty.image || "/placeholder.svg"}
                        alt={faculty.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="sm:w-3/4">
                      <h3 className="text-lg font-bold">{faculty.name}</h3>
                      <p className="text-gray-600">{faculty.title}</p>
                      <p className="text-gray-500 text-sm">{faculty.department}</p>

                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-gray-500 mb-2">Areas of Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {faculty.expertise.map((area, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4">
                        <a
                          href={`mailto:${faculty.email}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Contact</span>
                        </a>
                        <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                          <ExternalLink className="h-4 w-4" />
                          <span>Profile</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Faculty Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nobel Laureates</span>
                  <span className="font-semibold">55+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">MacArthur Fellows</span>
                  <span className="font-semibold">30+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">National Academy Members</span>
                  <span className="font-semibold">160+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pulitzer Prize Winners</span>
                  <span className="font-semibold">8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Faculty Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Faculty</span>
                  <span className="font-semibold">2,288</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Student-Faculty Ratio</span>
                  <span className="font-semibold">5:1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Faculty with PhDs</span>
                  <span className="font-semibold">97%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">International Faculty</span>
                  <span className="font-semibold">30%</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a href="#" className="text-blue-600 hover:underline text-sm block">
                    Browse Faculty Directory
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
