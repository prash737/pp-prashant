import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Code, Database, BookOpen, Briefcase, GraduationCap, Users } from "lucide-react"

export function ExpertiseSection() {
  // Mock expertise data
  const technicalSkills = [
    { name: "Machine Learning", level: 95 },
    { name: "Computer Vision", level: 90 },
    { name: "Natural Language Processing", level: 85 },
    { name: "Deep Learning", level: 92 },
    { name: "Python", level: 98 },
    { name: "TensorFlow/PyTorch", level: 88 },
    { name: "Data Science", level: 90 },
    { name: "Cloud Computing (AWS, GCP)", level: 80 },
  ]

  const mentorshipAreas = [
    { name: "Research Guidance", icon: <BookOpen className="h-5 w-5" /> },
    { name: "Career Planning", icon: <Briefcase className="h-5 w-5" /> },
    { name: "Technical Skill Development", icon: <Code className="h-5 w-5" /> },
    { name: "Academic Advising", icon: <GraduationCap className="h-5 w-5" /> },
    { name: "Project Management", icon: <Database className="h-5 w-5" /> },
    { name: "Team Leadership", icon: <Users className="h-5 w-5" /> },
  ]

  const publications = [
    {
      title: "Advances in Neural Network Architectures for Computer Vision Tasks",
      journal: "IEEE Transactions on Pattern Analysis and Machine Intelligence",
      year: 2021,
      link: "#",
      tags: ["Computer Vision", "Neural Networks"],
    },
    {
      title: "Efficient Transfer Learning Methods for Low-Resource Domains",
      journal: "Conference on Neural Information Processing Systems (NeurIPS)",
      year: 2020,
      link: "#",
      tags: ["Transfer Learning", "NLP"],
    },
    {
      title: "A Survey of Reinforcement Learning Applications in Education",
      journal: "Journal of Educational Technology & Society",
      year: 2019,
      link: "#",
      tags: ["Reinforcement Learning", "EdTech"],
    },
  ]

  const courses = [
    {
      title: "CS229: Machine Learning",
      institution: "Stanford University",
      description:
        "Graduate-level course covering supervised and unsupervised learning algorithms, deep learning, and reinforcement learning.",
      period: "Fall 2022, Spring 2023",
    },
    {
      title: "CS231n: Convolutional Neural Networks for Visual Recognition",
      institution: "Stanford University",
      description: "Deep dive into deep learning architectures for computer vision tasks.",
      period: "Winter 2022, Winter 2023",
    },
    {
      title: "CS224n: Natural Language Processing with Deep Learning",
      institution: "Stanford University",
      description: "Advanced course on NLP techniques using neural networks.",
      period: "Spring 2022",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Technical Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Code className="h-5 w-5 mr-2 text-emerald-600" />
            Technical Expertise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicalSkills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                  <span className="text-sm font-medium text-gray-500">{skill.level}%</span>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mentorship Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mentorship Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentorshipAreas.map((area, index) => (
              <div key={index} className="flex items-center p-4 border rounded-lg bg-gray-50">
                <div className="flex-shrink-0 mr-3 text-emerald-600">{area.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{area.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Publications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-emerald-600" />
            Selected Publications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {publications.map((pub, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h4 className="font-medium text-gray-900">
                  <a href={pub.link} className="hover:text-emerald-600">
                    {pub.title}
                  </a>
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {pub.journal}, {pub.year}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pub.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="bg-gray-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <a href="#" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              View all publications →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Courses Taught */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-emerald-600" />
            Courses Taught
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {courses.map((course, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h4 className="font-medium text-gray-900">{course.title}</h4>
                <p className="text-emerald-600 text-sm">{course.institution}</p>
                <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                <p className="text-gray-500 text-sm mt-1">{course.period}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-emerald-600" />
            Industry Expertise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            In addition to my academic work, I've collaborated with several industry partners on applied AI research and
            development projects:
          </p>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li>
              Led a computer vision project with Google Research to improve object detection in autonomous vehicles
            </li>
            <li>Consulted for Microsoft on natural language processing applications for their productivity suite</li>
            <li>Advised several AI startups on technical strategy and machine learning implementation</li>
            <li>Developed educational content for online learning platforms focused on data science and AI</li>
          </ul>
          <p className="text-gray-700 mt-4">
            This industry experience allows me to provide mentees with practical insights into how academic concepts
            apply in real-world settings and help them prepare for industry careers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
