
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Award, Heart, Globe, Shield } from "lucide-react"
import Footer from "@/components/footer"
import InternalNavbar from "@/components/internal-navbar"

export default function AboutPage() {
  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Student-Centered",
      description: "Every decision we make puts students first, ensuring their safety, growth, and success."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safety First",
      description: "We maintain the highest standards of online safety and privacy protection."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Community",
      description: "Connecting students worldwide while respecting cultural diversity and local contexts."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Excellence",
      description: "We strive for excellence in education technology and student experience."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Empathy",
      description: "Understanding and supporting the unique journey of each student."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Innovation",
      description: "Continuously improving and innovating to serve students better."
    }
  ]

  const milestones = [
    {
      year: "2023",
      title: "PathPiper Founded",
      description: "Started with a vision to create a safe, educational social platform for students."
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded to serve students in over 50 countries worldwide."
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Launched AI-powered personalized learning recommendations and safety features."
    },
    {
      year: "2024",
      title: "Institution Partnerships",
      description: "Partnered with leading educational institutions to enhance student experiences."
    }
  ]

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former education technology executive with 15 years of experience in student-centered platforms."
    },
    {
      name: "Michael Rodriguez",
      role: "CTO & Co-Founder",
      bio: "Security expert and full-stack developer passionate about creating safe online spaces for students."
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Educational Content",
      bio: "Former university professor with expertise in personalized learning and student development."
    },
    {
      name: "James Kim",
      role: "Head of Safety",
      bio: "Child safety advocate with extensive experience in online content moderation and protection."
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
              About PathPiper
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of student networking - a safe, supportive, and educational platform 
              that connects students globally while prioritizing their growth, safety, and success.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our Mission</h2>
                <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto">
                  To create a global community where students can safely connect, learn, and grow together. 
                  We provide age-appropriate tools and experiences that support academic achievement, 
                  personal development, and meaningful connections across cultures and borders.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-teal-500 mb-4 flex justify-center">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Journey Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Journey</h2>
            <div className="max-w-4xl mx-auto">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-6 mb-8">
                  <div className="bg-teal-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm">
                    {milestone.year}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {team.map((member, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-teal-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Impact Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl font-bold text-teal-500 mb-2">500K+</div>
                <p className="text-gray-600">Students Connected</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-500 mb-2">50+</div>
                <p className="text-gray-600">Countries Served</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-500 mb-2">10K+</div>
                <p className="text-gray-600">Educational Institutions</p>
              </div>
            </div>
            <p className="text-xl text-gray-600">
              Join thousands of students who are already building their future on PathPiper.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
