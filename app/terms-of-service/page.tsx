
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, XCircle, Users } from "lucide-react"
import Footer from "@/components/footer"
import InternalNavbar from "@/components/internal-navbar"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600">
              Guidelines for using PathPiper safely and responsibly.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: January 15, 2024
            </p>
          </div>

          {/* Key Points */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Points</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-2">Educational Purpose</h3>
                  <p className="text-sm text-gray-600">PathPiper is designed for educational networking and academic growth</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-2">Community Guidelines</h3>
                  <p className="text-sm text-gray-600">Respectful behavior and appropriate content are required at all times</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <AlertTriangle className="h-8 w-8 text-orange-500 mb-3" />
                  <h3 className="font-semibold mb-2">Age Requirements</h3>
                  <p className="text-sm text-gray-600">Users under 18 require parental consent and have additional protections</p>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <XCircle className="h-8 w-8 text-red-500 mb-3" />
                  <h3 className="font-semibold mb-2">Prohibited Content</h3>
                  <p className="text-sm text-gray-600">Harassment, inappropriate content, and misuse will result in account termination</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Terms Content */}
          <div className="prose prose-lg max-w-none">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  By accessing or using PathPiper, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of these terms, you may not access or use our services.
                </p>
                <p className="text-gray-600">
                  These terms apply to all users, including students, educators, parents, and institutions. Additional terms may apply to specific features or services.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>2. Eligibility and Account Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Age Requirements</h4>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Users must be at least 13 years old to create an account</li>
                    <li>Users under 18 require verified parental consent</li>
                    <li>Parents or guardians must approve account creation for minors</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Account Information</h4>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining the security of your account</li>
                    <li>You must promptly update any changes to your information</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>3. Acceptable Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Permitted Uses</h4>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Educational networking and collaboration</li>
                    <li>Sharing academic achievements and projects</li>
                    <li>Seeking and providing mentorship</li>
                    <li>Connecting with educational institutions</li>
                    <li>Participating in educational discussions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Prohibited Activities</h4>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Harassment, bullying, or intimidation of other users</li>
                    <li>Sharing inappropriate, offensive, or harmful content</li>
                    <li>Impersonating others or creating fake accounts</li>
                    <li>Spamming or unsolicited promotional content</li>
                    <li>Attempting to hack or disrupt the platform</li>
                    <li>Sharing personal contact information publicly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>4. Content and Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Your Content</h4>
                  <p className="text-gray-600">
                    You retain ownership of content you post on PathPiper. By posting content, you grant us a license to display, distribute, and moderate your content as necessary to operate the platform.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Platform Content</h4>
                  <p className="text-gray-600">
                    PathPiper's design, features, and original content are protected by intellectual property laws. You may not copy, modify, or distribute our proprietary content without permission.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Content Moderation</h4>
                  <p className="text-gray-600">
                    We reserve the right to review, moderate, or remove content that violates these terms or our community guidelines. We use both automated systems and human review to maintain platform safety.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>5. Safety and Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Safety Measures</h4>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Enhanced protections for users under 18</li>
                    <li>Content filtering and moderation systems</li>
                    <li>Reporting tools for inappropriate behavior</li>
                    <li>Parental oversight and controls</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Privacy Controls</h4>
                  <p className="text-gray-600">
                    You control the visibility of your profile and content. We encourage all users to use privacy settings appropriately and never share personal information publicly.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>6. Parental Rights and Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parental Consent</h4>
                  <p className="text-gray-600">
                    Parents or guardians of users under 18 must provide verified consent for account creation and have the right to review and manage their child's account settings.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ongoing Oversight</h4>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Parents can access their child's account activity</li>
                    <li>Parents can modify privacy and safety settings</li>
                    <li>Parents can request account deletion at any time</li>
                    <li>Parents will be notified of any safety concerns</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>7. Account Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Voluntary Termination</h4>
                  <p className="text-gray-600">
                    You may delete your account at any time through your account settings. Upon deletion, your personal information will be removed within 30 days.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Termination for Violations</h4>
                  <p className="text-gray-600">
                    We may suspend or terminate accounts that violate these terms. Serious violations may result in immediate termination without warning.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>8. Disclaimers and Limitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  PathPiper is provided "as is" without warranties of any kind. We strive to maintain a safe and reliable platform but cannot guarantee uninterrupted service or complete security.
                </p>
                <p className="text-gray-600">
                  We are not responsible for content posted by users or for outcomes resulting from connections made on the platform. Users are responsible for their own interactions and decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>9. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We may modify these terms from time to time. Significant changes will be communicated through email or platform notifications. Your continued use of PathPiper constitutes acceptance of any changes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  If you have questions about these terms or need to report a violation, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@pathpiper.com</p>
                  <p><strong>Safety Reports:</strong> safety@pathpiper.com</p>
                  <p><strong>Address:</strong> 123 Innovation Street, Suite 456, San Francisco, CA 94102</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
