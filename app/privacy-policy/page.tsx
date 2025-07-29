
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Users } from "lucide-react"
import Footer from "@/components/footer"
import InternalNavbar from "@/components/internal-navbar"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Your privacy is our priority. Learn how we protect and handle your personal information.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: January 15, 2024
            </p>
          </div>

          {/* Quick Overview */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy at a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-teal-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Data Protection</h3>
                  <p className="text-sm text-gray-600">We use industry-standard encryption to protect your data</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Transparency</h3>
                  <p className="text-sm text-gray-600">Clear policies on what data we collect and why</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Your Control</h3>
                  <p className="text-sm text-gray-600">You decide what information to share and with whom</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Minor Protection</h3>
                  <p className="text-sm text-gray-600">Enhanced privacy protections for users under 18</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Privacy Policy Content */}
          <div className="prose prose-lg max-w-none">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Information</h4>
                  <p className="text-gray-600">
                    When you create an account, we collect your name, email address, and other basic profile information. For students under 18, we require parental consent before account creation.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Profile Content</h4>
                  <p className="text-gray-600">
                    Information you choose to share in your profile, including educational history, interests, achievements, and goals. You control the visibility of this information.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Usage Data</h4>
                  <p className="text-gray-600">
                    We collect information about how you use PathPiper, including pages visited, features used, and interactions with content to improve our services.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Platform Operation</h4>
                  <p className="text-gray-600">
                    We use your information to provide, maintain, and improve PathPiper's features, including connecting you with relevant peers, mentors, and institutions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Safety and Security</h4>
                  <p className="text-gray-600">
                    We use your information to protect the platform and our users, including content moderation, spam prevention, and safety monitoring.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Communication</h4>
                  <p className="text-gray-600">
                    We may send you important updates about your account, platform changes, and educational opportunities that match your interests.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>3. Information Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">With Your Consent</h4>
                  <p className="text-gray-600">
                    We only share your personal information when you give us explicit permission, such as when connecting with other users or sharing your profile publicly.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Service Providers</h4>
                  <p className="text-gray-600">
                    We work with trusted third-party services to help operate PathPiper. These partners are contractually bound to protect your information.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Legal Requirements</h4>
                  <p className="text-gray-600">
                    We may share information when required by law or to protect the safety of our users, including reporting safety concerns to appropriate authorities.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>4. Privacy Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Profile Visibility</h4>
                  <p className="text-gray-600">
                    You can control who sees your profile information, from completely private to public visibility. Default settings prioritize privacy.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Access</h4>
                  <p className="text-gray-600">
                    You can request a copy of your data at any time through your account settings or by contacting our support team.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Account Deletion</h4>
                  <p className="text-gray-600">
                    You can delete your account at any time. We will remove your personal information within 30 days, except where required by law.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>5. Special Protections for Minors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parental Consent</h4>
                  <p className="text-gray-600">
                    Students under 18 require verified parental consent before creating an account. Parents can review and manage their child's privacy settings.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Enhanced Moderation</h4>
                  <p className="text-gray-600">
                    We provide additional content filtering and monitoring for accounts belonging to users under 18 to ensure a safe environment.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Limited Data Collection</h4>
                  <p className="text-gray-600">
                    We collect minimal information from users under 13 and do not use their data for advertising or marketing purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>6. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We implement robust security measures including encryption, secure servers, and regular security audits. However, no internet transmission is 100% secure, and we encourage users to protect their account credentials.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>7. International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  PathPiper is a global platform. Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>8. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We may update this privacy policy from time to time. We will notify users of significant changes through email or prominent platform notices. Your continued use of PathPiper constitutes acceptance of any changes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  If you have questions about this privacy policy or how we handle your information, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> privacy@pathpiper.com</p>
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
