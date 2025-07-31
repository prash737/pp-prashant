
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Shield, 
  Eye, 
  Users, 
  MessageSquare, 
  Bell, 
  Lock,
  Globe,
  UserCheck,
  Settings,
  Save,
  Clock,
  Wrench,
  Mail
} from "lucide-react"
import { toast } from "sonner"

interface PrivacySettings {
  profileVisibility: 'public' | 'connections' | 'private'
  showEmail: boolean
  showPhone: boolean
  showSocialLinks: boolean
  allowMentorRequests: boolean
  allowStudentConnections: boolean
  showOnlineStatus: boolean
  allowProfileViews: boolean
  emailNotifications: boolean
  mentorshipNotifications: boolean
  projectInvites: boolean
}

interface PrivacySettingsFormProps {
  data: any
  onChange: (sectionId: string, data: PrivacySettings) => void
}

export default function PrivacySettingsForm({ data, onChange }: PrivacySettingsFormProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showSocialLinks: true,
    allowMentorRequests: true,
    allowStudentConnections: true,
    showOnlineStatus: true,
    allowProfileViews: true,
    emailNotifications: true,
    mentorshipNotifications: true,
    projectInvites: true,
  })

  // Update settings when data changes
  useEffect(() => {
    if (data?.privacySettings) {
      setSettings(data.privacySettings)
    }
  }, [data])

  // Notify parent of changes
  useEffect(() => {
    onChange("privacy", settings)
  }, [settings, onChange])

  const updateSetting = (key: keyof PrivacySettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const privacyLevels = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can see your profile'
    },
    {
      value: 'connections',
      label: 'Connections Only',
      description: 'Only your mentors and student connections can see your profile'
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only you can see your profile'
    }
  ]

  return (
    <div className="relative space-y-6">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-10 rounded-lg border-2 border-dashed border-pathpiper-teal/30">
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="bg-gradient-to-br from-pathpiper-teal/10 to-pathpiper-blue/10 p-6 rounded-full mb-6">
            <div className="bg-gradient-to-br from-pathpiper-teal to-pathpiper-blue p-4 rounded-full">
              <Wrench className="h-12 w-12 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy & Settings
          </h3>

          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-pathpiper-teal" />
            <span className="text-lg font-semibold text-pathpiper-teal">Coming Soon</span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
            We're working hard to bring you comprehensive privacy and security settings. 
            Soon you'll be able to control your profile visibility, manage connections, 
            and customize your experience exactly how you want it.
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Enhanced Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Privacy Controls</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Customization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blurred Background Content */}
      <div className="filter blur-sm pointer-events-none opacity-50">
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Privacy & Settings</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Control who can see your information and how others can interact with you on the platform
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Profile Visibility</span>
                </CardTitle>
                <CardDescription>
                  Choose who can see your profile and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Who can see your profile?</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) => updateSetting('profileVisibility', value as 'public' | 'connections' | 'private')}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {privacyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-gray-500">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Show profile views</Label>
                      <p className="text-sm text-gray-500">Let others see that you've viewed their profile</p>
                    </div>
                    <Switch
                      checked={settings.allowProfileViews}
                      onCheckedChange={(checked) => updateSetting('allowProfileViews', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Show online status</Label>
                      <p className="text-sm text-gray-500">Let others see when you're online</p>
                    </div>
                    <Switch
                      checked={settings.showOnlineStatus}
                      onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
                <CardDescription>
                  Control who can see your contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Show email address</Label>
                    <p className="text-sm text-gray-500">Let connections see your email</p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => updateSetting('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Show phone number</Label>
                    <p className="text-sm text-gray-500">Let connections see your phone</p>
                  </div>
                  <Switch
                    checked={settings.showPhone}
                    onCheckedChange={(checked) => updateSetting('showPhone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Show social media links</Label>
                    <p className="text-sm text-gray-500">Display your social media profiles</p>
                  </div>
                  <Switch
                    checked={settings.showSocialLinks}
                    onCheckedChange={(checked) => updateSetting('showSocialLinks', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Connection Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Connection Settings</span>
                </CardTitle>
                <CardDescription>
                  Control who can connect with you and send requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Allow mentor requests</Label>
                    <p className="text-sm text-gray-500">Let mentors send you connection requests</p>
                  </div>
                  <Switch
                    checked={settings.allowMentorRequests}
                    onCheckedChange={(checked) => updateSetting('allowMentorRequests', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Allow student connections</Label>
                    <p className="text-sm text-gray-500">Let other students connect with you</p>
                  </div>
                  <Switch
                    checked={settings.allowStudentConnections}
                    onCheckedChange={(checked) => updateSetting('allowStudentConnections', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Allow project invitations</Label>
                    <p className="text-sm text-gray-500">Let others invite you to collaborate on projects</p>
                  </div>
                  <Switch
                    checked={settings.projectInvites}
                    onCheckedChange={(checked) => updateSetting('projectInvites', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Email notifications</Label>
                    <p className="text-sm text-gray-500">Receive important updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Mentorship notifications</Label>
                    <p className="text-sm text-gray-500">Get notified about mentorship opportunities</p>
                  </div>
                  <Switch
                    checked={settings.mentorshipNotifications}
                    onCheckedChange={(checked) => updateSetting('mentorshipNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Safety Notice */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Your Safety is Our Priority</h5>
                  <ul className="text-sm text-green-700 dark:text-green-200 space-y-1">
                    <li>• All mentors are verified before joining the platform</li>
                    <li>• You can block or report any user who makes you uncomfortable</li>
                    <li>• Your personal information is never shared without your permission</li>
                    <li>• You can change these settings at any time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
