import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BookOpen, Globe, Users, MapPin, Landmark, GraduationCap } from "lucide-react"

interface InstitutionData {
  id: string
  name: string
  type: string
  category?: string
  location: string
  bio: string
  logo: string
  coverImage: string
  website: string
  verified: boolean
  founded?: number | null
  tagline: string
  overview?: string
  mission?: string
  coreValues?: string[]
}

interface AboutInstitutionSectionProps {
  institutionData: InstitutionData
}

export default function AboutInstitutionSection({ institutionData }: AboutInstitutionSectionProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Landmark className="h-5 w-5 text-blue-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {institutionData.overview ? (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    {institutionData.overview}
                  </p>
                  {institutionData.coverImage && (
                    <div className="mt-6">
                      <Image
                        src={institutionData.coverImage}
                        alt={`${institutionData.name} cover image`}
                        width={800}
                        height={300}
                        className="rounded-lg object-cover w-full h-48"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No overview available. Please update your institution profile to add an overview.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Mission & Values */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Mission & Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {institutionData.mission || (institutionData.coreValues && institutionData.coreValues.length > 0) ? (
                <>
                  {institutionData.mission && (
                    <>
                      <h3 className="font-semibold text-lg">Our Mission</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {institutionData.mission}
                      </p>
                    </>
                  )}
                  
                  {institutionData.coreValues && institutionData.coreValues.length > 0 && (
                    <>
                      <h3 className="font-semibold text-lg mt-4">Core Values</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {institutionData.coreValues.map((value, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <span className="text-gray-700">{value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">
                  No mission or core values available. Please update your institution profile to add this information.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Facts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Quick Facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">Student Body</span>
                    <span className="text-gray-600">7,645 Undergraduate</span>
                    <span className="text-gray-600 block">9,292 Graduate</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">Faculty</span>
                    <span className="text-gray-600">2,288 Faculty members</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">Campus Size</span>
                    <span className="text-gray-600">8,180 acres (33.1 km²)</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">International</span>
                    <span className="text-gray-600">Students from 90+ countries</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium block">Rankings</span>
                    <span className="text-gray-600">Top 5 globally</span>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">Stanford University</p>
              <p className="text-gray-600">450 Serra Mall</p>
              <p className="text-gray-600">Stanford, CA 94305</p>
              <p className="text-gray-600">United States</p>
              <div className="pt-2">
                <p className="text-gray-600">Phone: (650) 723-2300</p>
                <p className="text-gray-600">Email: admission@stanford.edu</p>
                <a href="#" className="text-blue-600 hover:underline block mt-2">
                  Visit Website
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
