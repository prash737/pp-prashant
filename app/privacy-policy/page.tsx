
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Your privacy and safety are our top priorities. Learn how we protect your personal information.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-blue-50 border-blue-200">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Privacy</h2>
                <p className="text-gray-600 mb-4">
                  PathPiper is designed specifically for educational purposes with a strong focus on student safety and privacy. We understand the special responsibility we have when serving young learners and their families.
                </p>
                <p className="text-gray-600">
                  This Privacy Policy explains how we collect, use, protect, and share information when you use PathPiper, with special attention to the protections we provide for users under 18 years of age.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Information</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Name, age, and email address</li>
                      <li>Educational information (school, grade level, subjects of interest)</li>
                      <li>Profile information you choose to share</li>
                      <li>Parental consent records (for users under 13)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Content</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Posts, comments, and educational content you create</li>
                      <li>Learning progress and achievements</li>
                      <li>Interaction with educational materials</li>
                      <li>Skills and interests you share</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Information</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>How you interact with our platform</li>
                      <li>Features you use and time spent</li>
                      <li>Device information and browser type</li>
                      <li>IP address and general location (city/state level only)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Provide and improve our educational services</li>
                  <li>Personalize learning experiences and content recommendations</li>
                  <li>Facilitate safe connections between students, mentors, and institutions</li>
                  <li>Ensure platform safety through content moderation</li>
                  <li>Communicate important updates and educational opportunities</li>
                  <li>Comply with legal obligations and protect user safety</li>
                  <li>Analyze usage patterns to improve our platform (in aggregate only)</li>
                </ul>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
                  <p className="text-yellow-700 text-sm">
                    We never use student information for advertising purposes or share it with advertisers. Our business model is based on platform subscriptions, not advertising.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Protections for Young Users</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Users Under 13 (COPPA Compliance)</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Parental consent required before account creation</li>
                      <li>Limited data collection to educational purposes only</li>
                      <li>No behavioral advertising or tracking</li>
                      <li>Enhanced content moderation and safety features</li>
                      <li>Parents can review, modify, or delete their child's information</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Users 13-17 (Additional Protections)</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Optional parental oversight features</li>
                      <li>Privacy-by-default settings</li>
                      <li>Limited data sharing capabilities</li>
                      <li>Enhanced safety reporting tools</li>
                      <li>Age-appropriate content filtering</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
                <p className="text-gray-600 mb-4">
                  We do not sell, rent, or trade personal information. We may share information only in these limited circumstances:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">With Your Consent</h3>
                    <p className="text-gray-600">When you explicitly choose to share information with other users, mentors, or institutions.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Partners</h3>
                    <p className="text-gray-600">With schools or educational institutions you're affiliated with, as necessary for educational purposes.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety and Legal Requirements</h3>
                    <p className="text-gray-600">When required by law or necessary to protect the safety of our users, especially minors.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Providers</h3>
                    <p className="text-gray-600">With trusted partners who help us operate our platform, under strict confidentiality agreements.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-600 mb-4">
                  We implement industry-leading security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>End-to-end encryption for sensitive communications</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Secure data storage with access controls</li>
                  <li>Staff training on privacy and security best practices</li>
                  <li>Incident response procedures for any security concerns</li>
                  <li>Compliance with SOC 2 and other security standards</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
                <p className="text-gray-600 mb-4">
                  You have several rights regarding your personal information:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Access and Portability</h3>
                    <p className="text-gray-600 text-sm">Request a copy of your personal information in a portable format.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Correction</h3>
                    <p className="text-gray-600 text-sm">Update or correct inaccurate personal information.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Deletion</h3>
                    <p className="text-gray-600 text-sm">Request deletion of your personal information (subject to legal requirements).</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Settings</h3>
                    <p className="text-gray-600 text-sm">Control who can see your profile and educational content.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">International Users and Data Transfers</h2>
                <p className="text-gray-600 mb-4">
                  PathPiper serves users globally while maintaining strong privacy protections:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>GDPR compliance for European users</li>
                  <li>Data localization where required by law</li>
                  <li>Appropriate safeguards for international data transfers</li>
                  <li>Respect for local privacy laws and cultural norms</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                <p className="text-gray-600 mb-4">
                  We may update this Privacy Policy from time to time. When we make changes:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>We'll notify you through the platform and via email</li>
                  <li>For users under 18, we'll notify parents/guardians</li>
                  <li>We'll provide a summary of key changes</li>
                  <li>The effective date will be updated at the top of this policy</li>
                  <li>Material changes will require renewed consent where required by law</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 bg-teal-50 border-teal-200">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Our Privacy Team</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about this Privacy Policy or how we handle your information:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Email:</strong> privacy@pathpiper.com</p>
                  <p><strong>Phone:</strong> +1 (555) PRIVACY</p>
                  <p><strong>Mail:</strong> PathPiper Privacy Team, 123 Education Ave, San Francisco, CA 94105</p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <a 
                    href="/contact"
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    Contact Us
                  </a>
                  <a 
                    href="/cookie-policy"
                    className="border border-teal-500 text-teal-600 hover:bg-teal-100 px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    Cookie Policy
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
