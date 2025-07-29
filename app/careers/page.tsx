
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Code, Palette, TrendingUp } from "lucide-react"
import Footer from "@/components/footer"
import InternalNavbar from "@/components/internal-navbar"

export default function CareersPage() {
  const openings = [
    {
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Build beautiful, responsive user interfaces for our educational platform using React, TypeScript, and modern web technologies.",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"]
    },
    {
      title: "Backend Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Design and implement scalable backend systems to support our growing global community of students and educators.",
      skills: ["Node.js", "PostgreSQL", "Prisma", "API Design"]
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Create intuitive, engaging designs that make education accessible and enjoyable for students worldwide.",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"]
    },
    {
      title: "Content Strategist",
      department: "Marketing",
      location: "Remote",
      type: "Part-time",
      description: "Develop compelling content strategies to engage students, educators, and institutions on our platform.",
      skills: ["Content Marketing", "SEO", "Social Media", "Analytics"]
    },
    {
      title: "Community Manager",
      department: "Community",
      location: "Remote",
      type: "Full-time",
      description: "Foster a positive, safe, and engaging community environment for students and educators.",
      skills: ["Community Building", "Moderation", "Communication", "Event Planning"]
    }
  ]

  const benefits = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Remote-First Culture",
      description: "Work from anywhere in the world with flexible hours that suit your lifestyle."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Professional Growth",
      description: "Continuous learning opportunities, conference attendance, and skill development support."
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Cutting-Edge Tech",
      description: "Work with the latest technologies and tools to build innovative educational solutions."
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Creative Freedom",
      description: "Express your creativity and contribute to meaningful features that impact student lives."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Join Our Mission
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help us build the future of educational social networking. Join a team passionate about empowering students worldwide.
            </p>
          </div>

          {/* Why PathPiper Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Work at PathPiper?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-teal-500 mb-4 flex justify-center">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Open Positions</h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              {openings.map((job, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <Button>Apply Now</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Culture Section */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Culture</h2>
              <p className="text-lg text-gray-600 mb-8">
                At PathPiper, we believe in creating an inclusive, collaborative environment where everyone can thrive. Our team is passionate about education, technology, and making a positive impact on students' lives around the world.
              </p>
              <p className="text-lg text-gray-600">
                We value diversity, creativity, and continuous learning. Whether you're a seasoned professional or just starting your career, we provide the support and opportunities you need to grow and succeed.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Don't See Your Role?</h2>
            <p className="text-xl text-gray-600 mb-8">
              We're always looking for talented individuals who share our passion for education and innovation.
            </p>
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
