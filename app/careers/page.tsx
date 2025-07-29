
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Users, Zap, Heart, Globe } from "lucide-react"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"

export default function CareersPage() {
  const openings = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Build beautiful, responsive user interfaces for our student-focused platform using React, TypeScript, and modern web technologies."
    },
    {
      title: "Safety & Moderation Specialist",
      department: "Safety",
      location: "New York, NY / Remote",
      type: "Full-time",
      description: "Ensure student safety through content moderation, policy development, and implementation of safety features."
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Design intuitive, age-appropriate interfaces that enhance the student learning and networking experience."
    },
    {
      title: "Educational Content Manager",
      department: "Content",
      location: "London, UK / Remote",
      type: "Full-time",
      description: "Develop and curate educational content that supports student growth and engagement on our platform."
    },
    {
      title: "Data Scientist",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Analyze user behavior and platform data to improve student experiences and safety measures."
    },
    {
      title: "Community Manager",
      department: "Community",
      location: "Remote",
      type: "Full-time",
      description: "Foster positive community interactions and support student engagement across our global platform."
    }
  ]

  const benefits = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Health & Wellness",
      description: "Comprehensive healthcare, mental health support, and wellness programs"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Work-Life Balance",
      description: "Flexible hours, unlimited PTO, and remote work options"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Professional Growth",
      description: "Learning budget, conference attendance, and career development programs"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Inclusive Culture",
      description: "Diverse, supportive team with strong collaboration and respect"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Impact",
      description: "Work on a platform that positively impacts students worldwide"
    }
  ]

  const values = [
    {
      title: "Student First",
      description: "Every decision we make prioritizes student safety, growth, and success."
    },
    {
      title: "Innovation",
      description: "We continuously push boundaries to create better educational experiences."
    },
    {
      title: "Collaboration",
      description: "We work together as a team to achieve common goals and support each other."
    },
    {
      title: "Integrity",
      description: "We act with honesty, transparency, and ethical responsibility in everything we do."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Join Our Mission
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help us build the future of student networking. Join a team that's passionate about 
              creating safe, supportive spaces where students can learn, grow, and connect globally.
            </p>
          </div>

          {/* Why Work With Us */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Work With Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="text-teal-500 mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Open Positions</h2>
            <div className="space-y-6">
              {openings.map((job, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                    </div>
                    <p className="text-gray-600">{job.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Make an Impact?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Don't see a role that fits? We're always looking for talented individuals who share our passion for education and student success.
            </p>
            <p className="text-lg text-gray-600">
              Send your resume and a cover letter to <a href="mailto:careers@pathpiper.com" className="text-teal-600 hover:underline">careers@pathpiper.com</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
