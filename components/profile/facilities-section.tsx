"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Home, Book, Microscope, Coffee, Building2 } from "lucide-react"
import { useState, useEffect } from "react"

interface Facility {
  id: string
  name: string
  description: string
  features: string[]
  images: string[]
  learnMoreLink?: string
}

export default function FacilitiesSection() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/institution/facilities')
      if (response.ok) {
        const data = await response.json()
        setFacilities(data.facilities || [])
      } else {
        throw new Error('Failed to fetch facilities')
      }
    } catch (error) {
      console.error('Error fetching facilities:', error)
      setError('Failed to load facilities')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading facilities...</p>
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Campus Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src="/stanford-aerial-map.png"
                  alt="Stanford University Campus Map"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="px-4 py-2 bg-white rounded-md shadow-md text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                    View Interactive Map
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Featured Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {facilities.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No facilities added yet.</p>
                </div>
              ) : (
                facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="sm:w-1/3 relative h-40 sm:h-40 rounded-lg overflow-hidden">
                      {facility.images && facility.images.length > 0 ? (
                        <Image
                          src={facility.images[0]}
                          alt={facility.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="sm:w-2/3">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-bold">{facility.name}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{facility.description}</p>

                      {facility.features && facility.features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {facility.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {facility.learnMoreLink && (
                        <a 
                          href={facility.learnMoreLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Learn more about {facility.name}
                        </a>
                      )}

                      {facility.images && facility.images.length > 1 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 mb-2">Additional Images:</p>
                          <div className="flex gap-2 flex-wrap">
                            {facility.images.slice(1, 4).map((image, index) => (
                              <div key={index} className="w-16 h-16 relative rounded overflow-hidden">
                                <Image
                                  src={image}
                                  alt={`${facility.name} ${index + 2}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                            {facility.images.length > 4 && (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                +{facility.images.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Campus Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Campus Size</span>
                  <span className="font-semibold">8,180 acres</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Buildings</span>
                  <span className="font-semibold">700+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Libraries</span>
                  <span className="font-semibold">20+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Research Facilities</span>
                  <span className="font-semibold">40+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Athletic Facilities</span>
                  <span className="font-semibold">15+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Coffee className="h-5 w-5 text-blue-600" />
                Campus Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Dining Halls & Cafes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Recreation Centers</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Student Unions</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Health Services</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Performing Arts Centers</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Museums & Galleries</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700">Outdoor Recreation Areas</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a href="#" className="text-blue-600 hover:underline text-sm block">
                  View Campus Map
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
