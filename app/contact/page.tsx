import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle } from "lucide-react"
import Footer from "@/components/footer"
import InternalNavbar from "@/components/internal-navbar"

export default function ContactPage() {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Get help with any questions or issues",
      contact: "support@pathpiper.com",
      response: "Response within 24 hours"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available in-app",
      response: "Instant response"
    },
    {
      icon: <HelpCircle className="h-6 w-6" />,
      title: "Help Center",
      description: "Browse our comprehensive FAQ and guides",
      contact: "help.pathpiper.com",
      response: "Self-service 24/7"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+1 (555) 123-4567",
      response: "Mon-Fri 9AM-6PM EST"
    }
  ]

  const offices = [
    {
      city: "San Francisco",
      address: "123 Innovation Street, Suite 456, San Francisco, CA 94102",
      phone: "+1 (555) 123-4567",
      hours: "Mon-Fri 9AM-6PM PST"
    },
    {
      city: "New York",
      address: "789 Education Avenue, Floor 12, New York, NY 10001",
      phone: "+1 (555) 987-6543",
      hours: "Mon-Fri 9AM-6PM EST"
    },
    {
      city: "London",
      address: "456 Learning Lane, London, UK EC1A 1BB",
      phone: "+44 20 7123 4567",
      hours: "Mon-Fri 9AM-5PM GMT"
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
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about PathPiper? Need support? Want to partner with us? We're here to help and would love to hear from you.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Contact Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contactMethods.map((method, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-teal-500 mt-1">
                        {method.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                        <p className="text-sm font-medium text-gray-900 mb-1">{method.contact}</p>
                        <p className="text-xs text-gray-500">{method.response}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Office Locations */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Offices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {offices.map((office, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{office.city}</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <p className="text-sm text-gray-600">{office.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">{office.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">{office.hours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Contact Information */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Additional Contact Information</h2>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">General Inquiries</h3>
                      <p className="text-gray-600">info@pathpiper.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Media & Press</h3>
                      <p className="text-gray-600">press@pathpiper.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Partnerships</h3>
                      <p className="text-gray-600">partnerships@pathpiper.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Safety Reports</h3>
                      <p className="text-gray-600">safety@pathpiper.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Legal</h3>
                      <p className="text-gray-600">legal@pathpiper.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}