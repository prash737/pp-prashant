import { BriefcaseIcon, GraduationCap, Award, MapPin, Mail, Globe, Linkedin, Twitter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function AboutMentorSection() {
  // Mock mentor data
  const mentor = {
    bio: "I'm a Computer Science Professor at Stanford University with 15+ years of experience in AI and machine learning. I've worked at Google Research and led several industry projects. My passion is helping students bridge the gap between academic knowledge and real-world applications. I specialize in guiding students through research projects, career planning, and skill development in computer science and data science.",
    education: [
      {
        degree: "Ph.D. in Computer Science",
        institution: "MIT",
        year: "2008",
        logo: "/placeholder.svg?height=40&width=40&query=MIT logo",
      },
      {
        degree: "M.S. in Computer Science",
        institution: "Stanford University",
        year: "2004",
        logo: "/placeholder.svg?height=40&width=40&query=Stanford logo",
      },
      {
        degree: "B.S. in Electrical Engineering",
        institution: "UC Berkeley",
        year: "2002",
        logo: "/placeholder.svg?height=40&width=40&query=UC Berkeley logo",
      },
    ],
    experience: [
      {
        role: "Professor of Computer Science",
        company: "Stanford University",
        period: "2012 - Present",
        logo: "/placeholder.svg?height=40&width=40&query=Stanford logo",
      },
      {
        role: "Research Scientist",
        company: "Google Research",
        period: "2008 - 2012",
        logo: "/placeholder.svg?height=40&width=40&query=Google logo",
      },
      {
        role: "Research Assistant",
        company: "MIT CSAIL",
        period: "2004 - 2008",
        logo: "/placeholder.svg?height=40&width=40&query=MIT logo",
      },
    ],
    awards: [
      "ACM Distinguished Educator Award (2020)",
      "Google Faculty Research Award (2018)",
      "Stanford Teaching Excellence Award (2016, 2019)",
      "Best Paper Award, CVPR 2015",
    ],
    contact: {
      email: "michael.chen@stanford.edu",
      website: "www.michaelchen.edu",
      linkedin: "linkedin.com/in/michaelchen",
      twitter: "@prof_mchen",
    },
    location: "Stanford, California",
  }

  return (
    <div className="space-y-8">
      {/* Bio Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">About Me</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>

          <div className="mt-6 flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2 text-gray-400" />
            <span>{mentor.location}</span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center text-gray-600">
              <Mail className="h-5 w-5 mr-2 text-gray-400" />
              <a href={`mailto:${mentor.contact.email}`} className="hover:text-emerald-600">
                {mentor.contact.email}
              </a>
            </div>
            <div className="flex items-center text-gray-600">
              <Globe className="h-5 w-5 mr-2 text-gray-400" />
              <a
                href={`https://${mentor.contact.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600"
              >
                {mentor.contact.website}
              </a>
            </div>
            <div className="flex items-center text-gray-600">
              <Linkedin className="h-5 w-5 mr-2 text-gray-400" />
              <a
                href={`https://${mentor.contact.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600"
              >
                {mentor.contact.linkedin}
              </a>
            </div>
            <div className="flex items-center text-gray-600">
              <Twitter className="h-5 w-5 mr-2 text-gray-400" />
              <a
                href={`https://twitter.com/${mentor.contact.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600"
              >
                {mentor.contact.twitter}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-emerald-600" />
            Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentor.education.map((edu, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 mr-4">
                  <Image
                    src={edu.logo || "/placeholder.svg"}
                    alt={edu.institution}
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                  <p className="text-gray-600">
                    {edu.institution}, {edu.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-emerald-600" />
            Professional Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentor.experience.map((exp, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 mr-4">
                  <Image
                    src={exp.logo || "/placeholder.svg"}
                    alt={exp.company}
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{exp.role}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.period}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Awards Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Award className="h-5 w-5 mr-2 text-emerald-600" />
            Awards & Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mentor.awards.map((award, index) => (
              <li key={index} className="flex items-start">
                <Badge variant="outline" className="mr-2 mt-1 bg-amber-50 text-amber-700 border-amber-200">
                  🏆
                </Badge>
                <span className="text-gray-700">{award}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Mentorship Philosophy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mentorship Philosophy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            I believe in a personalized approach to mentorship that focuses on each student's unique strengths and
            goals. My mentoring style combines structured guidance with the freedom for students to explore their
            interests. I emphasize practical applications of theoretical knowledge and help students build both
            technical skills and professional competencies.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            My goal is to help students not just succeed academically, but to develop the critical thinking,
            problem-solving, and communication skills needed for long-term career success. I'm committed to creating an
            inclusive environment where diverse perspectives are valued and all students feel supported.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
