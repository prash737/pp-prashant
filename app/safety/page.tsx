
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Eye, AlertTriangle, Heart, Lock, MessageCircle, Settings } from "lucide-react"
import Footer from "@/components/footer"
import InternalNavbar from "@/components/internal-navbar"

export default function SafetyPage() {
  const safetyFeatures = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Content Moderation",
      description: "AI-powered and human moderation to ensure appropriate content",
      details: ["Automated content filtering", "24/7 human review team", "Community reporting system"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Parental Controls",
      description: "Comprehensive tools for parents to oversee their child's activity",
      details: ["Profile visibility controls", "Activity monitoring", "Contact restrictions"]
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Privacy Protection",
      description: "Strong privacy settings to control who sees your information",
      details: ["Granular privacy controls", "Anonymous browsing options", "Data encryption"]
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Secure Platform",
      description: "Industry-standard security measures to protect user data",
      details: ["End-to-end encryption", "Secure authentication", "Regular security audits"]
    }
  ]

  const safetyGuidelines = [
    {
      category: "Personal Information",
      icon: <Lock className="h-6 w-6" />,
      rules: [
        "Never share your real name, address, or phone number publicly",
        "Use privacy settings to control who can see your profile",
        "Be cautious about sharing school or location information",
        "Report any requests for personal information"
      ]
    },
    {
      category: "Online Interactions",
      icon: <MessageCircle className="h-6 w-6" />,
      rules: [
        "Be respectful and kind in all interactions",
        "Report inappropriate messages or behavior immediately",
        "Never agree to meet someone in person without parental approval",
        "Block users who make you feel uncomfortable"
      ]
    },
    {
      category: "Content Sharing",
      icon: <Eye className="h-6 w-6" />,
      rules: [
        "Only share educational and appropriate content",
        "Think before posting - content may be visible to many people",
        "Respect others' privacy and don't share their information",
        "Report inappropriate content when you see it"
      ]
    },
    {
      category: "Account Security",
      icon: <Shield className="h-6 w-6" />,
      rules: [
        "Use a strong, unique password for your account",
        "Never share your login credentials with anyone",
        "Log out when using shared or public computers",
        "Enable two-factor authentication if available"
      ]
    }
  ]

  const reportingSteps = [
    {
      step: 1,
      title: "Identify the Issue",
      description: "Recognize inappropriate content, behavior, or safety concerns"
    },
    {
      step: 2,
      title: "Use Reporting Tools",
      description: "Click the report button on content or profiles that violate guidelines"
    },
    {
      step: 3,
      title: "Provide Details",
      description: "Include specific information about what happened and why it's concerning"
    },
    {
      step: 4,
      title: "Follow Up",
      description: "Our safety team will review your report and take appropriate action"
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
              Safety Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Your safety is our top priority. Learn about the tools, policies, and resources we provide to create a secure educational environment for all users.
            </p>
            <div className="flex justify-center">
              <Image
                src="/images/parent-controlled.png"
                width={400}
                height={300}
                alt="Safety and protection"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-16">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-900 mb-4">Emergency Contact</h2>
                <p className="text-red-800 mb-6">
                  If you're experiencing immediate danger or a serious safety concern, contact local emergency services immediately.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Report Emergency
                  </Button>
                  <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                    Safety Support: safety@pathpiper.com
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Safety Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Safety Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {safetyFeatures.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-teal-500 mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex}>• {detail}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Safety Guidelines */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Safety Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {safetyGuidelines.map((guideline, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="text-teal-500">
                        {guideline.icon}
                      </div>
                      <CardTitle className="text-xl">{guideline.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {guideline.rules.map((rule, ruleIndex) => (
                        <li key={ruleIndex} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reporting Process */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How to Report Safety Concerns</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {reportingSteps.map((step, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* For Parents Section */}
          <div className="mb-16">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">For Parents and Guardians</h2>
                    <p className="text-blue-800 mb-6">
                      We provide comprehensive tools and resources to help parents ensure their child's safety on PathPiper.
                    </p>
                    <ul className="space-y-3 text-blue-800">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Account oversight and monitoring tools
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Privacy and visibility controls
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Regular safety education resources
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Direct communication with our safety team
                      </li>
                    </ul>
                    <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                      Parent Safety Guide
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Image
                      src="/images/diverse-students-studying.png"
                      width={400}
                      height={300}
                      alt="Parents and students"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resources Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Safety Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-6 w-6 text-red-500" />
                    Mental Health Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Resources and support for mental health and emotional wellbeing.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Crisis helpline numbers</li>
                    <li>• Counseling resources</li>
                    <li>• Stress management tips</li>
                    <li>• Support group connections</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-6 w-6 text-blue-500" />
                    Privacy Settings Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Step-by-step instructions for managing your privacy and security settings.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Profile visibility options</li>
                    <li>• Contact restrictions</li>
                    <li>• Blocking and reporting</li>
                    <li>• Data management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-green-500" />
                    Community Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Learn about our community standards and how to be a positive member.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Respectful communication</li>
                    <li>• Appropriate content sharing</li>
                    <li>• Reporting violations</li>
                    <li>• Building positive connections</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Need Help?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Our safety team is here to help. Don't hesitate to reach out with any concerns or questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600">
                Contact Safety Team
              </Button>
              <Button size="lg" variant="outline">
                Browse Help Center
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
