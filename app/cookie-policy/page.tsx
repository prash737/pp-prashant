
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cookie, Settings, Shield, BarChart3 } from "lucide-react"
import Footer from "@/components/footer"
import InternalNavbar from "@/components/internal-navbar"

export default function CookiePolicyPage() {
  const cookieTypes = [
    {
      icon: <Shield className="h-6 w-6" />,
      name: "Essential Cookies",
      purpose: "Required for basic platform functionality",
      examples: ["Login authentication", "Security features", "Account preferences"],
      canDisable: false,
      color: "bg-green-100 text-green-800"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      name: "Analytics Cookies",
      purpose: "Help us understand how users interact with PathPiper",
      examples: ["Page views", "Feature usage", "Performance metrics"],
      canDisable: true,
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: <Settings className="h-6 w-6" />,
      name: "Functional Cookies",
      purpose: "Remember your preferences and settings",
      examples: ["Theme preferences", "Language settings", "Notification preferences"],
      canDisable: true,
      color: "bg-purple-100 text-purple-800"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Cookie Policy
            </h1>
            <p className="text-xl text-gray-600">
              Learn about how PathPiper uses cookies to improve your experience while protecting your privacy.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: January 15, 2024
            </p>
          </div>

          {/* Quick Overview */}
          <div className="mb-12">
            <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
              <CardContent className="p-8 text-center">
                <Cookie className="h-12 w-12 text-teal-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Cookies are small text files stored on your device when you visit websites. They help us remember your preferences, 
                  keep you logged in, and understand how you use PathPiper to improve our services.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cookie Types */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Types of Cookies We Use</h2>
            <div className="space-y-6">
              {cookieTypes.map((cookie, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-teal-500">
                          {cookie.icon}
                        </div>
                        <CardTitle className="text-xl">{cookie.name}</CardTitle>
                      </div>
                      <Badge className={cookie.color}>
                        {cookie.canDisable ? "Optional" : "Required"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{cookie.purpose}</p>
                    <div>
                      <h4 className="font-semibold mb-2">Examples:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {cookie.examples.map((example, exampleIndex) => (
                          <li key={exampleIndex}>{example}</li>
                        ))}
                      </ul>
                    </div>
                    {cookie.canDisable && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Control:</strong> You can disable these cookies in your browser settings or through our cookie preferences center.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Detailed Information */}
          <div className="prose prose-lg max-w-none mb-12">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>How We Use Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Authentication and Security</h4>
                  <p className="text-gray-600">
                    Essential cookies help us verify your identity when you log in and protect your account from unauthorized access. 
                    These cookies are necessary for the platform to function properly.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Personalization</h4>
                  <p className="text-gray-600">
                    We use cookies to remember your preferences, such as language settings, theme choices, and notification preferences, 
                    so you don't have to reset them each time you visit.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Platform Improvement</h4>
                  <p className="text-gray-600">
                    Analytics cookies help us understand which features are most popular, how users navigate the platform, 
                    and where we can make improvements to enhance the user experience.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Third-Party Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We work with trusted third-party services that may place cookies on your device. These include:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Authentication Services:</strong> To provide secure login functionality</li>
                  <li><strong>Analytics Providers:</strong> To help us understand platform usage (with your consent)</li>
                  <li><strong>Security Services:</strong> To protect against spam and abuse</li>
                </ul>
                <p className="text-gray-600">
                  We carefully vet all third-party services to ensure they meet our privacy and security standards.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Managing Your Cookie Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Browser Settings</h4>
                  <p className="text-gray-600">
                    Most web browsers allow you to control cookies through their settings. You can typically:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>View and delete existing cookies</li>
                    <li>Block third-party cookies</li>
                    <li>Block cookies from specific sites</li>
                    <li>Block all cookies (may affect functionality)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">PathPiper Settings</h4>
                  <p className="text-gray-600">
                    You can manage your cookie preferences directly in your PathPiper account settings. 
                    This allows you to choose which optional cookies you want to accept.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Special Considerations for Minors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  For users under 18, we implement additional privacy protections:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Minimal data collection through cookies</li>
                  <li>No advertising or tracking cookies</li>
                  <li>Parental control over cookie preferences</li>
                  <li>Enhanced security cookie requirements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Updates to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We may update this cookie policy from time to time to reflect changes in our practices or applicable laws. 
                  We will notify users of significant changes through email or prominent platform notices.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cookie Preferences Center */}
          <div className="text-center bg-white rounded-xl p-8 border">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Your Cookie Preferences</h2>
            <p className="text-gray-600 mb-6">
              You can review and update your cookie settings at any time. Essential cookies cannot be disabled as they are 
              required for the platform to function properly.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Cookie Settings:</strong> Available in your browser settings</p>
              <p className="text-gray-700"><strong>Privacy Information:</strong> privacy@pathpiper.com</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions About Cookies?</h3>
            <p className="text-gray-600 mb-4">
              If you have questions about our use of cookies or this policy, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg inline-block">
              <p><strong>Email:</strong> privacy@pathpiper.com</p>
              <p><strong>Address:</strong> 123 Innovation Street, Suite 456, San Francisco, CA 94102</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
