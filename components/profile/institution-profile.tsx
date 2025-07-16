"use client"

import { useState, useEffect, useRef } from "react"
import InstitutionProfileHeader from "./institution-profile-header"
import AboutInstitutionSection from "./about-institution-section"
import ProgramsSection from "./programs-section"
import FacultySection from "./faculty-section"
import FacilitiesSection from "./facilities-section"
import EventsSection from "./events-section"
import GallerySection from "./gallery-section"

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
  gallery?: Array<{
    id: string
    url: string
    caption?: string
  }>
}

interface InstitutionProfileProps {
  institutionData: InstitutionData
}

export default function InstitutionProfile({ institutionData }: InstitutionProfileProps) {
  const [activeSection, setActiveSection] = useState("about")
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const sections = [
    { id: "about", label: "About" },
    { id: "programs", label: "Programs" },
    { id: "faculty", label: "Faculty" },
    { id: "facilities", label: "Facilities" },
    { id: "events", label: "Events" },
    { id: "gallery", label: "Gallery" },
  ]

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const scrollTop = containerRef.current.scrollTop
      const containerHeight = containerRef.current.clientHeight
      const centerPoint = containerHeight / 2

      // Find which section is closest to the center of the viewport
      let currentSection = "about"
      let minDistance = Infinity

      sections.forEach(({ id }) => {
        const element = sectionRefs.current[id]
        if (!element) return

        const rect = element.getBoundingClientRect()
        const containerRect = containerRef.current!.getBoundingClientRect()

        // Calculate distance from section center to viewport center
        const sectionTop = rect.top - containerRect.top
        const sectionBottom = rect.bottom - containerRect.top
        const sectionCenter = (sectionTop + sectionBottom) / 2
        const distance = Math.abs(sectionCenter - centerPoint)

        if (distance < minDistance) {
          minDistance = distance
          currentSection = id
        }
      })

      setActiveSection(currentSection)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      // Call initially to set correct active section
      handleScroll()
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Handle navigation click
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const scrollTop = containerRef.current.scrollTop
      const containerHeight = containerRef.current.clientHeight

      // Calculate scroll position to center the section in viewport
      const elementHeight = elementRect.height
      const targetScrollTop = scrollTop + elementRect.top - containerRect.top - (containerHeight / 2) + (elementHeight / 2)

      containerRef.current.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      })
    }
  }

  const isViewMode = false;
  const currentUser = {};
  const student = {};

  return (
    <div className="min-h-screen bg-gray-50">
      <InstitutionProfileHeader institutionData={institutionData} />

      {/* Mobile: Sticky Top Navigation */}
      <div className="lg:hidden sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 mb-6 -mx-4 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {sections.find(s => s.id === activeSection)?.label || "About"}
          </h2>
          <div className="flex gap-1">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                  activeSection === id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop and Mobile Layout - Full width container to match header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <nav className="space-y-2">
                  {sections.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeSection === id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1">
            <div 
              ref={containerRef}
              className="h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="space-y-8 lg:pr-4">
                <div 
                  ref={(el) => sectionRefs.current['about'] = el}
                  id="about"
                  className="scroll-mt-6"
                >
                  <AboutInstitutionSection institutionData={institutionData} />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['programs'] = el}
                  id="programs"
                  className="scroll-mt-6"
                >
                  <ProgramsSection institutionId={institutionData.id} />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['faculty'] = el}
                  id="faculty"
                  className="scroll-mt-6"
                >
                  <FacultySection />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['facilities'] = el}
                  id="facilities"
                  className="scroll-mt-6"
                >
                  <FacilitiesSection />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['events'] = el}
                  id="events"
                  className="scroll-mt-6"
                >
                  <EventsSection />
                </div>

                <div 
                  ref={(el) => sectionRefs.current['gallery'] = el}
                  id="gallery"
                  className="scroll-mt-6"
                >
                  <GallerySection images={institutionData.gallery} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Institution Self Analysis Floating Button */}
      {!isViewMode && (
        <div className="fixed bottom-6 right-6 z-50">
          <a
            href="/institution/self-analysis"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4M9 7h6M9 11h6M9 15h6" />
            </svg>
            <span className="font-semibold">Institution Analysis</span>
          </a>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}