
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="text-lg text-gray-600">
              Learn how PathPiper uses cookies to improve your experience while keeping your data safe.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                <p className="text-gray-600 mb-4">
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and helping us understand how you use our platform.
                </p>
                <p className="text-gray-600">
                  At PathPiper, we're committed to using cookies responsibly and transparently, especially given our focus on providing a safe environment for young learners.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-teal-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                    <p className="text-gray-600 mb-2">
                      These cookies are necessary for the basic functionality of our website and cannot be disabled.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Authentication and login sessions</li>
                      <li>Security features and fraud prevention</li>
                      <li>Basic website navigation and functionality</li>
                      <li>Age verification and parental consent tracking</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                    <p className="text-gray-600 mb-2">
                      These cookies help us provide enhanced features and remember your preferences.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Language and region preferences</li>
                      <li>Theme and display settings</li>
                      <li>Accessibility options</li>
                      <li>Educational content personalization</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                    <p className="text-gray-600 mb-2">
                      These help us understand how our platform is used so we can improve the educational experience.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Usage patterns and popular features</li>
                      <li>Performance monitoring and error tracking</li>
                      <li>Educational content effectiveness</li>
                      <li>Platform safety and security metrics</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety and Moderation Cookies</h3>
                    <p className="text-gray-600 mb-2">
                      Special cookies that help us maintain a safe environment for young users.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Content moderation system preferences</li>
                      <li>Safety filter settings</li>
                      <li>Parental control configurations</li>
                      <li>Age-appropriate content delivery</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                <p className="text-gray-600 mb-4">
                  We carefully select third-party services that share our commitment to student safety and privacy. These may include:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Educational Content Providers:</strong> To deliver age-appropriate learning materials</li>
                  <li><strong>Safety Services:</strong> For content moderation and child protection</li>
                  <li><strong>Analytics Services:</strong> To understand platform usage (with privacy-focused providers)</li>
                  <li><strong>Communication Tools:</strong> For safe messaging and video calling features</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Protections for Young Users</h2>
                <p className="text-gray-600 mb-4">
                  We implement additional cookie protections specifically for our young users:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>No behavioral advertising cookies for users under 16</li>
                  <li>Enhanced parental control over cookie preferences</li>
                  <li>Automatic expiration of non-essential cookies</li>
                  <li>Regular audits of all third-party cookie usage</li>
                  <li>Compliance with COPPA and GDPR regulations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
                <p className="text-gray-600 mb-4">
                  You have several options to control how cookies are used on your device:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Settings</h3>
                    <p className="text-gray-600">
                      Visit your account settings to customize your cookie preferences. Parents can manage these settings for their children's accounts.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Settings</h3>
                    <p className="text-gray-600 mb-2">
                      Most browsers allow you to control cookies through their settings:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Block all cookies (may affect functionality)</li>
                      <li>Block third-party cookies only</li>
                      <li>Delete existing cookies</li>
                      <li>Set cookies to expire when you close your browser</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Opt-Out Tools</h3>
                    <p className="text-gray-600">
                      We provide easy-to-use tools to opt out of non-essential cookies while maintaining the safety and functionality of our platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
                <p className="text-gray-600 mb-4">
                  Different cookies have different lifespans based on their purpose:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Authentication Cookies:</strong> Expire after 30 days of inactivity</li>
                  <li><strong>Preference Cookies:</strong> Stored for up to 1 year</li>
                  <li><strong>Analytics Cookies:</strong> Expire after 2 years (anonymized after 6 months)</li>
                  <li><strong>Safety Cookies:</strong> Retained as long as necessary for user protection</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
                <p className="text-gray-600 mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. When we make significant changes:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>We'll notify users through the platform</li>
                  <li>Parents will receive email notifications about changes affecting their children</li>
                  <li>The "Last updated" date at the top of this policy will be revised</li>
                  <li>We'll provide a summary of key changes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 bg-teal-50 border-teal-200">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about our cookie practices or need help managing your preferences, we're here to help:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="/contact"
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    Contact Support
                  </a>
                  <a 
                    href="/privacy-policy"
                    className="border border-teal-500 text-teal-600 hover:bg-teal-100 px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    View Privacy Policy
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
