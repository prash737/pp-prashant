"use client"

import { useState } from "react"
import MentorProfileHeader from "./mentor-profile-header"
import { AboutMentorSection } from "./about-mentor-section"
import { ExpertiseSection } from "./expertise-section"
import { MentorshipHistory } from "./mentorship-history"
import { MentorAvailability } from "./mentor-availability"
import { MentorCircleView } from "./mentor-circle-view"
import ActionBar from "../profile/action-bar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Users,
  Star,
  Briefcase,
  CheckCircle,
  BookMarked,
  Network,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Horizontal navigation tabs for mentor profile
const tabs = [
  { id: "about", label: "About" },
  { id: "expertise", label: "Expertise" },
  { id: "mentorship", label: "Mentorship History" },
  { id: "availability", label: "Availability" },
  { id: "circle", label: "My Circle" },
]

export default function MentorProfile() {
  const [activeTab, setActiveTab] = useState("about")

  // Render sidebar content based on active tab
  const renderSidebar = () => {
    switch (activeTab) {
      case "about":
        return (
          <>
            {/* Stats Card for About tab */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentorship Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Mentees</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sessions Completed</span>
                  <span className="font-medium">87</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Rating</span>
                  <span className="font-medium">4.8/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Years Mentoring</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
            </div>

            {/* Testimonials for About tab */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Testimonials</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-500 pl-4 italic text-gray-600">
                  "Dr. Chen's guidance helped me navigate my college applications with confidence. His insights were
                  invaluable!"
                  <p className="mt-2 text-sm font-medium text-gray-900">— Maya S., High School Senior</p>
                </div>
                <div className="border-l-4 border-emerald-500 pl-4 italic text-gray-600">
                  "The most supportive mentor I've had. Always available and genuinely cares about my progress."
                  <p className="mt-2 text-sm font-medium text-gray-900">— Jamal T., College Sophomore</p>
                </div>
              </div>
            </div>
          </>
        )

      case "expertise":
        return (
          <>
            {/* Expertise Areas Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expertise Highlights</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <BookOpen className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">15+ Years Research</h4>
                    <p className="text-sm text-gray-600">Leading AI and machine learning research</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <GraduationCap className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Stanford Professor</h4>
                    <p className="text-sm text-gray-600">Teaching advanced CS courses since 2010</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Industry Consultant</h4>
                    <p className="text-sm text-gray-600">Advisor to Google, Microsoft, and startups</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Publications Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Publications & Resources</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-5 w-5 text-emerald-600 mr-3" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">AI Ethics Whitepaper</p>
                    <p className="text-xs text-gray-500">Published 2023 • 45 pages</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-5 w-5 text-emerald-600 mr-3" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">ML Research Guide</p>
                    <p className="text-xs text-gray-500">Published 2022 • 32 pages</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <BookMarked className="h-5 w-5 text-emerald-600 mr-3" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">CS Career Handbook</p>
                    <p className="text-xs text-gray-500">Published 2021 • 78 pages</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Resources
              </Button>
            </div>
          </>
        )

      case "mentorship":
        return (
          <>
            {/* Mentorship Impact Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentorship Impact</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Mentee Success Rate</span>
                    <span className="text-sm font-medium text-emerald-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Percentage of mentees who achieved their stated goals</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Mentee Satisfaction</span>
                    <span className="text-sm font-medium text-emerald-600">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Based on post-mentorship feedback surveys</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Career Advancement</span>
                    <span className="text-sm font-medium text-emerald-600">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Mentees who advanced in their career within 1 year</p>
                </div>
              </div>
            </div>

            {/* Mentorship Achievements Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentorship Achievements</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Outstanding Mentor Award</h4>
                    <p className="text-sm text-gray-600">Stanford University, 2022</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">100+ Mentees Milestone</h4>
                    <p className="text-sm text-gray-600">Reached in January 2023</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">5-Star Mentor Rating</h4>
                    <p className="text-sm text-gray-600">Maintained for 3 consecutive years</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Notable Mentee Achievements</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>8 mentees accepted to top graduate programs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>12 mentees placed at FAANG companies</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>5 mentees founded successful startups</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )

      case "availability":
        return (
          <>
            {/* Availability Overview Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Overview</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Office Hours</h4>
                    <p className="text-sm text-gray-600">Mon, Wed, Fri: 10AM - 12PM PT</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Mentorship Sessions</h4>
                    <p className="text-sm text-gray-600">Tues, Thurs: 2PM - 5PM PT</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Response Time</h4>
                    <p className="text-sm text-gray-600">Usually within 24 hours</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Currently accepting new mentees
                </Badge>
              </div>
            </div>

            {/* Upcoming Sessions Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Available Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">May 18, 2023</p>
                    <p className="text-xs text-gray-500">10:00 AM - 11:00 AM PT</p>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Book
                  </Button>
                </div>
                <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">May 20, 2023</p>
                    <p className="text-xs text-gray-500">2:00 PM - 3:00 PM PT</p>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Book
                  </Button>
                </div>
                <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">May 23, 2023</p>
                    <p className="text-xs text-gray-500">11:00 AM - 12:00 PM PT</p>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Book
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Calendar
              </Button>
            </div>
          </>
        )

      case "circle":
        return (
          <>
            {/* Circle Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-emerald-600 mr-2" />
                    <span className="text-gray-700">Total Connections</span>
                  </div>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Network className="h-5 w-5 text-emerald-600 mr-2" />
                    <span className="text-gray-700">Circles</span>
                  </div>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-emerald-600 mr-2" />
                    <span className="text-gray-700">Academic Connections</span>
                  </div>
                  <span className="font-medium">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-emerald-600 mr-2" />
                    <span className="text-gray-700">Industry Connections</span>
                  </div>
                  <span className="font-medium">47</span>
                </div>
              </div>
            </div>

            {/* Connection Suggestions Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Connections</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                    <img src="/asian-professor.png" alt="Dr. David Zhang" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">Dr. David Zhang</p>
                    <p className="text-xs text-gray-500">Professor, UC Berkeley</p>
                    <p className="text-xs text-emerald-600">4 mutual connections</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Connect
                  </Button>
                </div>
                <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                    <img
                      src="/diverse-female-student.png"
                      alt="Olivia Williams"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">Olivia Williams</p>
                    <p className="text-xs text-gray-500">AI Researcher, DeepMind</p>
                    <p className="text-xs text-emerald-600">3 mutual connections</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Connect
                  </Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Trending Communities</h4>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                      <img src="/ai-ethics.png" alt="AI Ethics" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">AI Ethics Researchers</p>
                      <p className="text-xs text-gray-500">245 members</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8">
                      Join
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                      <img
                        src="/computer-science-education.png"
                        alt="CS Education"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">CS Education Innovation</p>
                      <p className="text-xs text-gray-500">178 members</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8">
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full bg-gray-50">
      <MentorProfileHeader />

      {/* Horizontal Navigation */}
      <div className="sticky top-16 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === "about" && <AboutMentorSection />}
            {activeTab === "expertise" && <ExpertiseSection />}
            {activeTab === "mentorship" && <MentorshipHistory />}
            {activeTab === "availability" && <MentorAvailability />}
            {activeTab === "circle" && <MentorCircleView />}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ActionBar
              isMentor={true}
              actions={[
                { label: "Message", icon: "message-circle" },
                { label: "Schedule", icon: "calendar" },
                { label: "Share Profile", icon: "share" },
                { label: "Save", icon: "bookmark" },
              ]}
            />

            {/* Dynamic sidebar content based on active tab */}
            {renderSidebar()}
          </div>
        </div>
      </div>
    </div>
  )
}
