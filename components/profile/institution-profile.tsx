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
  overview?: string
  mission?: string
  coreValues?: string[]
  gallery?: Array<{
    id: string
    url: string
    caption?: string
  }>
  programs?: any[]
  faculty?: any[]
  facilities?: any[]
  events?: any[]
  followers?: number
}

interface InstitutionProfileProps {
  institutionData: InstitutionData
  institutionId?: string
  isViewMode?: boolean
  isShareMode?: boolean
}

export default function InstitutionProfile({ institutionData, institutionId, isViewMode = false, isShareMode = false }: InstitutionProfileProps) {
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

  // Handle scroll to update active section - simplified for better reliability
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight

      // Find which section should be active based on scroll position
      let targetSection = "about"

      sections.forEach(({ id }) => {
        const element = sectionRefs.current[id]
        if (!element) return

        const elementTop = element.offsetTop
        const elementHeight = element.offsetHeight

        // Check if section is in view (at least 50% visible or top 200px of container)
        const sectionStart = elementTop
        const sectionEnd = elementTop + elementHeight
        const viewStart = scrollTop
        const viewEnd = scrollTop + containerHeight

        // If section top is within the top 200px of the viewport, consider it active
        if (sectionStart <= viewStart + 200 && sectionEnd > viewStart + 100) {
          targetSection = id
        }
      })

      if (targetSection !== activeSection) {
        setActiveSection(targetSection)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      // Call initially to set correct active section
      handleScroll()

      return () => {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [activeSection, sections])

  // Handle navigation click
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element && containerRef.current) {
      const elementTop = element.offsetTop

      // Scroll to the section with some padding from the top
      containerRef.current.scrollTo({
        top: elementTop - 20, // 20px padding from top
        behavior: 'smooth'
      })

      // Update active section immediately for better UX
      setActiveSection(sectionId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InstitutionProfileHeader institutionData={institutionData} institutionId={institutionId} isViewMode={isViewMode} isShareMode={isShareMode} />

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

      {/* Desktop and Mobile Layout - Match header container width */}
      <div className="relative">
        <div className="container mx-auto px-4 max-w-7xl py-6">
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
                className="h-[calc(100vh-200px)] lg:h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide transition-all duration-300"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  scrollBehavior: 'smooth',
                }}
              >
                <div className="space-y-8 lg:pr-4">
                  <div 
                    ref={(el) => sectionRefs.current['about'] = el}
                    id="about"
                    className="scroll-mt-6"
                  >
                    <AboutInstitutionSection institutionData={institutionData} isViewMode={isViewMode} />
                  </div>

                  <div 
                    ref={(el) => sectionRefs.current['programs'] = el}
                    id="programs"
                    className="scroll-mt-6"
                  >
                    <ProgramsSection 
                      institutionId={institutionData.id} 
                      isViewMode={isViewMode} 
                      programs={institutionData.programs}
                    />
                  </div>

                  <div 
                    ref={(el) => sectionRefs.current['faculty'] = el}
                    id="faculty"
                    className="scroll-mt-6"
                  >
                    <FacultySection 
                      institutionId={institutionId || institutionData?.id} 
                      isViewMode={isViewMode} 
                      faculty={institutionData.faculty}
                    />
                  </div>

                  <div 
                    ref={(el) => sectionRefs.current['facilities'] = el}
                    id="facilities"
                    className="scroll-mt-6"
                  >
                    <FacilitiesSection 
                      isViewMode={isViewMode} 
                      facilities={institutionData.facilities}
                      institutionId={institutionData.id}
                    />
                  </div>

                  <div 
                    ref={(el) => sectionRefs.current['events'] = el}
                    id="events"
                    className="scroll-mt-6"
                  >
                    <EventsSection 
                      isViewMode={isViewMode} 
                      events={institutionData.events}
                      institutionId={institutionData.id}
                    />
                  </div>

                  <div 
                    ref={(el) => sectionRefs.current['gallery'] = el}
                    id="gallery"
                    className="scroll-mt-6"
                  >
                    <GallerySection 
                      images={institutionData.gallery} 
                      isViewMode={isViewMode} 
                      institutionId={institutionData.id}
                    />
                  </div>
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