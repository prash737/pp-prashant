
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
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

                {/* Quick Links */}
                <Card className="p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">Quick Help</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-3">
                    <a href="/safety" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <Shield className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">Safety Center</p>
                        <p className="text-sm text-gray-600">Report safety concerns</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <HelpCircle className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">Help Center</p>
                        <p className="text-sm text-gray-600">Find answers to common questions</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">Live Chat</p>
                        <p className="text-sm text-gray-600">Chat with support (if available)</p>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl text-gray-900 mb-2">Send Us a Message</CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent className="px-0">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" placeholder="Enter your first name" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" placeholder="Enter your last name" className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="Enter your email address" className="mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="userType">I am a... *</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="parent">Parent/Guardian</SelectItem>
                          <SelectItem value="teacher">Teacher/Educator</SelectItem>
                          <SelectItem value="institution">Institution Representative</SelectItem>
                          <SelectItem value="mentor">Mentor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="What is this regarding?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="safety">Safety Concern</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="press">Press/Media</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Please describe your question or concern in detail..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="privacy" className="mt-1" />
                      <Label htmlFor="privacy" className="text-sm text-gray-600">
                        I agree to PathPiper's <a href="/privacy-policy" className="text-teal-600 hover:text-teal-700">Privacy Policy</a> and understand that my information will be used to respond to my inquiry.
                      </Label>
                    </div>

                    <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                      Send Message
                    </Button>
                  </form>
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
