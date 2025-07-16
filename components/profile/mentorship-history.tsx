import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Users, Calendar, Clock, Award, Star, MessageSquare, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MentorshipHistory() {
  // Mock mentorship data
  const mentorshipStats = {
    totalMentees: 120,
    activeMentees: 12,
    completedPrograms: 108,
    averageRating: 4.8,
    totalHours: 1450,
    successStories: 24,
  }

  const activeMentorships = [
    {
      menteeName: "Alex Johnson",
      menteeImage: "/student-with-hat.png",
      program: "Computer Science Research",
      startDate: "March 2023",
      progress: 65,
      nextSession: "May 18, 2023",
    },
    {
      menteeName: "Priya Sharma",
      menteeImage: "/diverse-students-studying.png",
      program: "AI Career Guidance",
      startDate: "January 2023",
      progress: 80,
      nextSession: "May 15, 2023",
    },
    {
      menteeName: "Marcus Williams",
      menteeImage: "/placeholder.svg?height=40&width=40&query=student profile",
      program: "Graduate School Applications",
      startDate: "April 2023",
      progress: 30,
      nextSession: "May 20, 2023",
    },
  ]

  const successStories = [
    {
      menteeName: "Sophia Chen",
      outcome: "Accepted to MIT Ph.D. Program",
      testimonial:
        "Dr. Chen's guidance was instrumental in helping me refine my research proposal and prepare for graduate school interviews. His insights into the academic world were invaluable.",
      year: 2022,
    },
    {
      menteeName: "David Kim",
      outcome: "Secured ML Engineer position at Google",
      testimonial:
        "The technical interview preparation and portfolio review sessions with Dr. Chen helped me stand out in a competitive hiring process. His industry connections also opened doors for me.",
      year: 2021,
    },
  ]

  const mentorshipPrograms = [
    {
      title: "Research Mentorship",
      description:
        "Guidance for students interested in computer science research, from project selection to publication.",
      duration: "6-12 months",
      capacity: "5 mentees",
      currentlyAvailable: true,
    },
    {
      title: "Career Transition to AI",
      description:
        "Structured program for professionals looking to pivot their career into artificial intelligence and machine learning.",
      duration: "4 months",
      capacity: "8 mentees",
      currentlyAvailable: false,
    },
    {
      title: "Graduate School Preparation",
      description:
        "Comprehensive support for students applying to graduate programs in computer science and related fields.",
      duration: "3 months",
      capacity: "10 mentees",
      currentlyAvailable: true,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Mentorship Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mentorship Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-emerald-600 mb-2">
                <Users className="h-5 w-5 mr-2" />
                <span className="font-medium">Total Mentees</span>
              </div>
              <p className="text-2xl font-bold">{mentorshipStats.totalMentees}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-emerald-600 mb-2">
                <Users className="h-5 w-5 mr-2" />
                <span className="font-medium">Active Mentees</span>
              </div>
              <p className="text-2xl font-bold">{mentorshipStats.activeMentees}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-emerald-600 mb-2">
                <Award className="h-5 w-5 mr-2" />
                <span className="font-medium">Completed</span>
              </div>
              <p className="text-2xl font-bold">{mentorshipStats.completedPrograms}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-emerald-600 mb-2">
                <Star className="h-5 w-5 mr-2" />
                <span className="font-medium">Avg. Rating</span>
              </div>
              <p className="text-2xl font-bold">{mentorshipStats.averageRating}/5</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-emerald-600 mb-2">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-medium">Total Hours</span>
              </div>
              <p className="text-2xl font-bold">{mentorshipStats.totalHours}+</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-emerald-600 mb-2">
                <MessageSquare className="h-5 w-5 mr-2" />
                <span className="font-medium">Success Stories</span>
              </div>
              <p className="text-2xl font-bold">{mentorshipStats.successStories}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Mentorships */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Users className="h-5 w-5 mr-2 text-emerald-600" />
            Active Mentorships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeMentorships.map((mentorship, index) => (
              <div key={index} className="flex items-center border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={mentorship.menteeImage || "/placeholder.svg"}
                      alt={mentorship.menteeName}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-gray-900">{mentorship.menteeName}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 text-sm text-gray-600">
                    <span>{mentorship.program}</span>
                    <span>•</span>
                    <span>Started: {mentorship.startDate}</span>
                    <span>•</span>
                    <span>Progress: {mentorship.progress}%</span>
                  </div>
                  <div className="mt-1 text-sm text-emerald-600">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Next session: {mentorship.nextSession}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
              View All Active Mentorships
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Award className="h-5 w-5 mr-2 text-emerald-600" />
            Success Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {successStories.map((story, index) => (
              <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">{story.menteeName}</h4>
                <p className="text-emerald-600 font-medium">{story.outcome}</p>
                <p className="text-gray-600 italic mt-2">"{story.testimonial}"</p>
                <p className="text-gray-500 text-sm mt-1">{story.year}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
              View More Success Stories
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mentorship Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mentorship Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentorshipPrograms.map((program, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{program.title}</h4>
                  {program.currentlyAvailable ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Available</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      Full
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mt-2">{program.description}</p>
                <div className="flex flex-wrap gap-x-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{program.capacity}</span>
                  </div>
                </div>
                {program.currentlyAvailable && (
                  <div className="mt-4">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Apply for Program</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
