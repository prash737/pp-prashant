
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Mail, Phone, MapPin, Clock, MessageCircle, Shield, HelpCircle } from "lucide-react"

export default function ContactPage() {
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
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help! Whether you have questions, feedback, or need support, our team is ready to assist you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div>
              <Card className="p-6">
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                      <p className="text-gray-600 text-sm mb-2">Get in touch with our support team</p>
                      <a href="mailto:support@pathpiper.com" className="text-teal-600 hover:text-teal-700 font-medium">
                        support@pathpiper.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                      <p className="text-gray-600 text-sm mb-2">Speak with our support team</p>
                      <a href="tel:+1-555-PATHPIPE" className="text-blue-600 hover:text-blue-700 font-medium">
                        +1 (555) PATH-PIPE
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Visit Us</h3>
                      <p className="text-gray-600 text-sm mb-2">Our headquarters</p>
                      <p className="text-purple-600 font-medium">
                        123 Education Ave<br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Support Hours</h3>
                      <p className="text-gray-600 text-sm mb-2">When we're available</p>
                      <p className="text-green-600 font-medium">
                        Mon-Fri: 8AM - 6PM PST<br />
                        Sat-Sun: 10AM - 4PM PST
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Help & Resources */}
            <div>
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl text-gray-900 mb-4">Quick Help & Resources</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <a href="/safety" className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                    <Shield className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">Safety Center</p>
                      <p className="text-sm text-gray-600">Report safety concerns and view our safety guidelines</p>
                    </div>
                  </a>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <HelpCircle className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">Help Center</p>
                      <p className="text-sm text-gray-600">Find answers to common questions (Coming Soon)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <MessageCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">Live Chat</p>
                      <p className="text-sm text-gray-600">Chat with support (Coming Soon)</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <h4 className="font-medium text-teal-900 mb-2">Prefer to reach out directly?</h4>
                    <p className="text-sm text-teal-700 mb-3">
                      Send us an email at <strong>support@pathpiper.com</strong> and we'll get back to you within 24 hours.
                    </p>
                    <p className="text-xs text-teal-600">
                      Please include as much detail as possible about your question or concern to help us assist you better.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Emergency Contact */}
          <Card className="mt-12 p-6 bg-red-50 border-red-200">
            <CardContent className="flex items-start space-x-4">
              <Shield className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Emergency or Safety Concerns</h3>
                <p className="text-red-800 mb-4">
                  If you need to report an emergency or have immediate safety concerns related to our platform, please contact us immediately:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="mailto:safety@pathpiper.com" 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block text-center"
                  >
                    Email: safety@pathpiper.com
                  </a>
                  <a 
                    href="tel:+1-555-SAFE-NOW" 
                    className="border border-red-600 text-red-700 hover:bg-red-100 px-6 py-2 rounded-lg font-medium transition-colors inline-block text-center"
                  >
                    Call: +1 (555) SAFE-NOW
                  </a>
                </div>
                <p className="text-sm text-red-700 mt-3">
                  For immediate emergencies, please contact your local emergency services (911 in the US).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
