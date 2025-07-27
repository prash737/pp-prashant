
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, GraduationCap, BookOpen, Globe, Phone, Mail, Building2, Calendar, Award, ChevronDown, ChevronUp, Landmark } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

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
  isViewMode?: boolean
}

export default function AboutInstitutionSection({ institutionData, isViewMode = false }: AboutInstitutionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [quickFacts, setQuickFacts] = useState<any>(null)
  const [contactInfo, setContactInfo] = useState<any>(null)
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchQuickFactsAndContactInfo()
  }, [institutionData.id])

  const fetchQuickFactsAndContactInfo = async () => {
    try {
      setIsLoading(true)

      // Fetch quick facts - include institutionId for public view
      const quickFactsUrl = isViewMode 
        ? `/api/institution/quick-facts?institutionId=${institutionData.id}`
        : '/api/institution/quick-facts'
      const quickFactsResponse = await fetch(quickFactsUrl, {
        credentials: 'include'
      })
      if (quickFactsResponse.ok) {
        const quickFactsData = await quickFactsResponse.json()
        setQuickFacts(quickFactsData.quickFacts)
      }

      // Fetch contact info - include institutionId for public view
      const contactInfoUrl = isViewMode
        ? `/api/institution/contact-info?institutionId=${institutionData.id}`
        : '/api/institution/contact-info'
      const contactInfoResponse = await fetch(contactInfoUrl, {
        credentials: 'include'
      })
      if (contactInfoResponse.ok) {
        const contactInfoData = await contactInfoResponse.json()
        setContactInfo(contactInfoData.contactInfo)
      }

      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const quickFactsData = quickFacts
  const contactInfoData = contactInfo

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
              {institutionData?.overview ? (
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
              {institutionData?.mission || (institutionData?.coreValues && institutionData.coreValues.length > 0) ? (
                <>
                  {institutionData?.mission && (
                    <>
                      <h3 className="font-semibold text-lg">Our Mission</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {institutionData.mission}
                      </p>
                    </>
                  )}

                  {institutionData?.coreValues && institutionData.coreValues.length > 0 && (
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
              {isLoading && !isViewMode ? (
                <div className="space-y-4">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                </div>
              ) : (
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium block">Student Body</span>
                      <span className="text-gray-600">
                        {quickFactsData?.undergraduate_students ? `${quickFactsData.undergraduate_students.toLocaleString()} Undergraduate` : 'Not added yet'}
                      </span>
                      {quickFactsData?.graduate_students && (
                        <span className="text-gray-600 block">{quickFactsData.graduate_students.toLocaleString()} Graduate</span>
                      )}
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium block">Faculty</span>
                      <span className="text-gray-600">
                        {quickFactsData?.faculty_members ? `${quickFactsData.faculty_members.toLocaleString()} Faculty members` : 'Not added yet'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium block">Campus Size</span>
                      <span className="text-gray-600">
                        {quickFactsData?.campus_size_acres ? `${quickFactsData.campus_size_acres.toLocaleString()} acres` : 
                         quickFactsData?.campus_size_km2 ? `${quickFactsData.campus_size_km2.toLocaleString()} km²` : 'Not added yet'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium block">International Students</span>
                      <span className="text-gray-600">
                        {quickFactsData?.international_students_countries ? `Students from ${quickFactsData.international_students_countries}+ countries` : 'Not added yet'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium block">Ranking</span>
                      <span className="text-gray-600">
                        {quickFactsData?.global_ranking || 'Not added yet'}
                      </span>
                    </div>
                  </li>
                  
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && !isViewMode ? (
                <div className="space-y-4">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium block">Address</span>
                      <span className="text-gray-600">
                        {contactInfoData?.address || contactInfoData?.city || contactInfoData?.state || contactInfoData?.country ? (
                          `${contactInfoData?.address || ''} ${contactInfoData?.city || ''} ${contactInfoData?.state || ''} ${contactInfoData?.postal_code || ''} ${contactInfoData?.country || ''}`.trim()
                        ) : (
                          'Not added yet'
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium block">Phone</span>
                      <span className="text-gray-600">{contactInfoData?.phone || 'Not added yet'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium block">Email</span>
                      <span className="text-gray-600">{contactInfoData?.email || 'Not added yet'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium block">Website</span>
                      <span className="text-gray-600">
                        {contactInfoData?.website || institutionData?.website || 'Not added yet'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
