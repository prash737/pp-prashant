
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsOfServicePage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // Choose navbar based on user role
  const renderNavbar = () => {
    if (loading) {
      return <Navbar /> // Show default navbar while loading
    }

    if (!user) {
      return <Navbar /> // Show default navbar for non-authenticated users
    }

    // Show role-specific navbar for authenticated users
    switch (user.role) {
      case 'institution':
        return <InstitutionNavbar />
      case 'student':
      case 'mentor':
      default:
        return <InternalNavbar />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {renderNavbar()}
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600">
              Understanding the rules and guidelines that help keep PathPiper safe and educational for everyone.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-blue-50 border-blue-200">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to PathPiper</h2>
                <p className="text-gray-600 mb-4">
                  These Terms of Service ("Terms") govern your use of PathPiper, an educational social networking platform designed specifically for students, educators, mentors, and institutions.
                </p>
                <p className="text-gray-600">
                  By using PathPiper, you agree to these terms. If you're under 18, your parent or guardian must also agree to these terms on your behalf.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Eligibility and Account Creation</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Age Requirements</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Users must be at least 8 years old to use PathPiper</li>
                      <li>Users under 13 require verified parental consent</li>
                      <li>Users 13-17 are encouraged to involve parents in their PathPiper experience</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Responsibility</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Provide accurate and truthful information</li>
                      <li>Keep your account information up to date</li>
                      <li>Maintain the security of your account credentials</li>
                      <li>You are responsible for all activity on your account</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Educational Purpose and Appropriate Use</h2>
                <p className="text-gray-600 mb-4">
                  PathPiper is designed exclusively for educational purposes. You agree to use the platform to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                  <li>Learn, share knowledge, and grow academically</li>
                  <li>Connect with peers, mentors, and educational institutions</li>
                  <li>Participate in educational discussions and activities</li>
                  <li>Showcase your academic achievements and projects</li>
                  <li>Seek and provide educational guidance and support</li>
                </ul>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Prohibited Uses</h4>
                  <p className="text-red-700 text-sm">
                    PathPiper may not be used for non-educational purposes, commercial activities, dating, or any content inappropriate for a learning environment.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Community Guidelines and Conduct</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Be Respectful</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Treat all community members with kindness and respect</li>
                      <li>Use appropriate language suitable for an educational environment</li>
                      <li>Respect different opinions, backgrounds, and learning styles</li>
                      <li>No bullying, harassment, or discriminatory behavior</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Be Safe</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Never share personal information like addresses or phone numbers</li>
                      <li>Report any concerning behavior to our safety team</li>
                      <li>Do not arrange to meet other users in person without proper supervision</li>
                      <li>Be cautious about sharing photos or videos</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Be Honest</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Don't impersonate others or create fake accounts</li>
                      <li>Give credit for others' work and ideas</li>
                      <li>Report your achievements accurately</li>
                      <li>Don't cheat or help others cheat on academic work</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Content and Intellectual Property</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Content</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>You retain ownership of the content you create</li>
                      <li>You grant PathPiper permission to display and share your content within the platform</li>
                      <li>You are responsible for ensuring you have the right to share any content you upload</li>
                      <li>Content must be appropriate for an educational environment</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">PathPiper's Content</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Educational resources and platform features are owned by PathPiper</li>
                      <li>You may use our educational content for personal learning purposes</li>
                      <li>Our trademarks and branding may not be used without permission</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Safety and Moderation</h2>
                <p className="text-gray-600 mb-4">
                  PathPiper employs multiple layers of safety protection:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Automated content moderation using child-safe AI systems</li>
                  <li>Human moderators trained in child safety and education</li>
                  <li>User reporting tools for concerning content or behavior</li>
                  <li>Parental oversight tools for younger users</li>
                  <li>Regular safety audits and policy updates</li>
                </ul>
                
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Reporting</h4>
                  <p className="text-green-700 text-sm">
                    If you see something concerning, please report it immediately. We take all reports seriously and investigate promptly.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
                <p className="text-gray-600 mb-4">
                  Your privacy is extremely important to us. Key points include:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>We collect only information necessary for educational purposes</li>
                  <li>We never sell or share personal information with advertisers</li>
                  <li>Enhanced protections apply to users under 18</li>
                  <li>Parents have control over their children's information</li>
                  <li>See our detailed Privacy Policy for complete information</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Consequences for Violations</h2>
                <p className="text-gray-600 mb-4">
                  Violations of these terms may result in:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Minor Violations</h3>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                      <li>Warning and educational guidance</li>
                      <li>Temporary restriction of certain features</li>
                      <li>Required completion of safety training</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Serious Violations</h3>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                      <li>Temporary or permanent account suspension</li>
                      <li>Removal of content</li>
                      <li>Notification of parents/guardians</li>
                      <li>Reporting to authorities if required by law</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers and Limitations</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Content</h3>
                    <p className="text-gray-600 text-sm">
                      While we strive to provide accurate educational content, PathPiper is not a substitute for formal education or professional advice.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Availability</h3>
                    <p className="text-gray-600 text-sm">
                      We aim for 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be communicated in advance.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">User-Generated Content</h3>
                    <p className="text-gray-600 text-sm">
                      While we moderate content, users are ultimately responsible for the accuracy and appropriateness of their contributions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to These Terms</h2>
                <p className="text-gray-600 mb-4">
                  We may update these Terms from time to time. When we do:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>We'll notify all users at least 30 days before significant changes take effect</li>
                  <li>For users under 18, we'll notify parents/guardians directly</li>
                  <li>We'll highlight key changes in plain language</li>
                  <li>Continued use of the platform constitutes acceptance of new terms</li>
                  <li>You can always view the current terms on our website</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  Questions about these Terms of Service? We're here to help:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p><strong>General Questions:</strong> support@pathpiper.com</p>
                  <p><strong>Safety Concerns:</strong> safety@pathpiper.com</p>
                  <p><strong>Legal Inquiries:</strong> legal@pathpiper.com</p>
                  <p><strong>Phone:</strong> +1 (555) PATH-PIPE</p>
                  <p><strong>Mail:</strong> PathPiper Legal Team, 123 Education Ave, San Francisco, CA 94105</p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 bg-teal-50 border-teal-200">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You</h2>
                <p className="text-gray-600 mb-4">
                  Thank you for being part of the PathPiper community! Together, we're building a safer, more connected educational experience for learners worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="/safety"
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    Safety Center
                  </a>
                  <a 
                    href="/contact"
                    className="border border-teal-500 text-teal-600 hover:bg-teal-100 px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    Contact Support
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
