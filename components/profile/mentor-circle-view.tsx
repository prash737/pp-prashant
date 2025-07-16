"use client"

import { useState } from "react"
import {
  Search,
  Grid3X3,
  Network,
  Users,
  BookOpen,
  Briefcase,
  GraduationCap,
  Building,
  Star,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export function MentorCircleView() {
  const [viewMode, setViewMode] = useState<"grid" | "graph">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCircle, setActiveCircle] = useState<string | null>(null)

  // Mock circle data
  const mentorCircles = [
    {
      id: "cs-mentorship",
      name: "CS Mentorship",
      type: "Mentees",
      members: 24,
      description: "Current and former computer science students I'm mentoring",
      image: "/multiple-monitor-coding.png",
      color: "from-blue-500 to-cyan-400",
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "stanford-faculty",
      name: "Stanford Faculty",
      type: "Colleagues",
      members: 18,
      description: "Fellow faculty members at Stanford University",
      image: "/university-laboratory.png",
      color: "from-emerald-500 to-teal-400",
      icon: <Building className="h-5 w-5 text-emerald-500" />,
    },
    {
      id: "industry-partners",
      name: "Industry Partners",
      type: "Professional",
      members: 32,
      description: "Connections from industry collaborations and research",
      image: "/bustling-university-campus.png",
      color: "from-purple-500 to-indigo-400",
      icon: <Briefcase className="h-5 w-5 text-purple-500" />,
    },
    {
      id: "research-group",
      name: "Research Group",
      type: "Academic",
      members: 15,
      description: "Current and former research lab members",
      image: "/college-library.png",
      color: "from-amber-500 to-orange-400",
      icon: <GraduationCap className="h-5 w-5 text-amber-500" />,
    },
  ]

  const connections = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Associate Professor, MIT",
      relationship: "Colleague",
      image: "/diverse-professor-lecturing.png",
      circles: ["stanford-faculty", "research-group"],
      lastInteraction: "2 days ago",
      status: "Active",
      progress: 100,
    },
    {
      id: 2,
      name: "Alex Chen",
      role: "Ph.D. Student",
      relationship: "Mentee",
      image: "/student-with-hat.png",
      circles: ["cs-mentorship", "research-group"],
      lastInteraction: "Yesterday",
      status: "Active",
      progress: 75,
    },
    {
      id: 3,
      name: "Dr. James Wilson",
      role: "Research Director, Google AI",
      relationship: "Industry Partner",
      image: "/math-teacher.png",
      circles: ["industry-partners"],
      lastInteraction: "1 week ago",
      status: "Active",
      progress: 90,
    },
    {
      id: 4,
      name: "Maya Patel",
      role: "ML Engineer, Microsoft",
      relationship: "Former Mentee",
      image: "/diverse-students-studying.png",
      circles: ["cs-mentorship", "industry-partners"],
      lastInteraction: "3 days ago",
      status: "Active",
      progress: 100,
    },
    {
      id: 5,
      name: "Prof. Robert Lee",
      role: "Department Chair, Stanford",
      relationship: "Colleague",
      image: "/diverse-classroom-teacher.png",
      circles: ["stanford-faculty"],
      lastInteraction: "5 days ago",
      status: "Active",
      progress: 85,
    },
    {
      id: 6,
      name: "Emma Rodriguez",
      role: "Undergraduate Researcher",
      relationship: "Mentee",
      image: "/diverse-female-student.png",
      circles: ["cs-mentorship", "research-group"],
      lastInteraction: "Today",
      status: "Active",
      progress: 40,
    },
  ]

  const mentorshipStats = {
    totalMentees: 42,
    activeMentees: 12,
    completedMentorships: 30,
    averageRating: 4.8,
    totalHours: 320,
    impactScore: 92,
  }

  const recentActivities = [
    {
      id: 1,
      type: "session",
      with: "Alex Chen",
      date: "Yesterday",
      description: "1-hour mentoring session on research methodology",
    },
    {
      id: 2,
      type: "recommendation",
      with: "Maya Patel",
      date: "3 days ago",
      description: "Wrote a recommendation letter for job application",
    },
    {
      id: 3,
      type: "introduction",
      with: "Emma Rodriguez",
      date: "1 week ago",
      description: "Introduced to Dr. James Wilson for research collaboration",
    },
  ]

  // Filter connections based on search query and active circle
  const filteredConnections = connections.filter(
    (connection) =>
      (searchQuery === "" ||
        connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        connection.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        connection.relationship.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (activeCircle === null || connection.circles.includes(activeCircle)),
  )

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 shadow-sm border border-emerald-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <h2 className="text-2xl font-bold text-emerald-800 mb-2">Your Mentorship Circle</h2>
            <p className="text-emerald-700 mb-4">
              You're connected with {connections.length} professionals across {mentorCircles.length} circles
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">Total Mentees</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">{mentorshipStats.totalMentees}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-emerald-700">Avg. Rating</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">{mentorshipStats.averageRating}/5</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-emerald-700">Total Hours</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">{mentorshipStats.totalHours}h</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100 flex flex-col justify-center">
            <div className="text-center mb-2">
              <span className="text-sm font-medium text-emerald-700">Mentorship Impact Score</span>
              <div className="flex items-center justify-center mt-1">
                <span className="text-3xl font-bold text-emerald-600">{mentorshipStats.impactScore}</span>
                <span className="text-lg text-emerald-500 ml-1">/100</span>
              </div>
            </div>
            <Progress value={mentorshipStats.impactScore} className="h-2 bg-emerald-100" />
            <p className="text-xs text-center mt-2 text-emerald-600">
              Based on engagement, feedback, and mentee success
            </p>
          </div>
        </div>
      </div>

      {/* Circle navigation and search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2">
          <Button
            variant={activeCircle === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCircle(null)}
            className="rounded-full"
          >
            <Users className="h-4 w-4 mr-2" />
            All Connections
          </Button>
          {mentorCircles.map((circle) => (
            <Button
              key={circle.id}
              variant={activeCircle === circle.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCircle(circle.id)}
              className="rounded-full"
            >
              {circle.icon}
              <span className="ml-2">{circle.name}</span>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search connections..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === "graph" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("graph")}
              className="rounded-none"
            >
              <Network className="h-4 w-4 mr-1" />
              Graph
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main connections grid */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Connections</TabsTrigger>
                <TabsTrigger value="mentees">Mentees</TabsTrigger>
                <TabsTrigger value="colleagues">Colleagues</TabsTrigger>
                <TabsTrigger value="industry">Industry</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredConnections.map((connection) => (
                    <Card key={connection.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex p-4">
                        <Avatar className="h-12 w-12 mr-4 border-2 border-emerald-100">
                          <AvatarImage src={connection.image || "/placeholder.svg"} alt={connection.name} />
                          <AvatarFallback>{connection.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                            {connection.name}
                            {connection.relationship === "Mentee" && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                Mentee
                              </Badge>
                            )}
                          </h4>
                          <p className="text-xs text-gray-500">{connection.role}</p>
                          <div className="mt-1 flex items-center">
                            <span className="text-xs text-gray-500 mr-2">Progress:</span>
                            <Progress value={connection.progress} className="h-1.5 flex-1" />
                            <span className="text-xs font-medium ml-2">{connection.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                        <span>Last interaction: {connection.lastInteraction}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="mentees" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredConnections
                    .filter((c) => c.relationship === "Mentee" || c.relationship === "Former Mentee")
                    .map((connection) => (
                      <Card key={connection.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex p-4">
                          <Avatar className="h-12 w-12 mr-4 border-2 border-blue-100">
                            <AvatarImage src={connection.image || "/placeholder.svg"} alt={connection.name} />
                            <AvatarFallback>{connection.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                              {connection.name}
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                {connection.relationship}
                              </Badge>
                            </h4>
                            <p className="text-xs text-gray-500">{connection.role}</p>
                            <div className="mt-1 flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Progress:</span>
                              <Progress value={connection.progress} className="h-1.5 flex-1" />
                              <span className="text-xs font-medium ml-2">{connection.progress}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                          <span>Last interaction: {connection.lastInteraction}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="colleagues" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredConnections
                    .filter((c) => c.relationship === "Colleague")
                    .map((connection) => (
                      <Card key={connection.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex p-4">
                          <Avatar className="h-12 w-12 mr-4 border-2 border-emerald-100">
                            <AvatarImage src={connection.image || "/placeholder.svg"} alt={connection.name} />
                            <AvatarFallback>{connection.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">{connection.name}</h4>
                            <p className="text-xs text-gray-500">{connection.role}</p>
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {connection.circles
                                  .map((c) => mentorCircles.find((mc) => mc.id === c)?.name)
                                  .join(", ")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                          <span>Last interaction: {connection.lastInteraction}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="industry" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredConnections
                    .filter((c) => c.relationship === "Industry Partner")
                    .map((connection) => (
                      <Card key={connection.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex p-4">
                          <Avatar className="h-12 w-12 mr-4 border-2 border-purple-100">
                            <AvatarImage src={connection.image || "/placeholder.svg"} alt={connection.name} />
                            <AvatarFallback>{connection.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">{connection.name}</h4>
                            <p className="text-xs text-gray-500">{connection.role}</p>
                            <div className="mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                              >
                                Industry Partner
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                          <span>Last interaction: {connection.lastInteraction}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="border-l-2 border-emerald-500 pl-4 py-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">with {activity.with}</span>
                        <span className="text-xs text-gray-500">{activity.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full text-emerald-600">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>

            {/* Circle Overview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Circles</CardTitle>
                <CardDescription>Overview of your mentorship network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mentorCircles.map((circle) => (
                    <div
                      key={circle.id}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setActiveCircle(circle.id === activeCircle ? null : circle.id)}
                    >
                      <div
                        className={`h-10 w-10 rounded-full bg-gradient-to-br ${circle.color} flex items-center justify-center mr-3 shadow-sm`}
                      >
                        {circle.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{circle.name}</p>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500">{circle.members} members</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{circle.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Circles
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-8 border border-emerald-100">
            <div className="flex flex-col items-center justify-center text-center">
              <Network className="h-16 w-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold text-emerald-800 mb-2">Interactive Network Visualization</h3>
              <p className="text-emerald-600 max-w-md mb-6">
                See how your mentees, colleagues, and industry partners are connected in an interactive network graph.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                {mentorCircles.map((circle) => (
                  <div key={circle.id} className="text-center">
                    <div
                      className={`h-12 w-12 rounded-full bg-gradient-to-br ${circle.color} flex items-center justify-center mx-auto mb-2 shadow-sm`}
                    >
                      {circle.icon}
                    </div>
                    <p className="text-sm font-medium">{circle.name}</p>
                    <p className="text-xs text-gray-500">{circle.members} members</p>
                  </div>
                ))}
              </div>
              <Button className="mt-6">Explore Network</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default MentorCircleView
