"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Github, Linkedin, Globe, Mail, Phone, MessageSquare, Shield, Instagram, Facebook, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const socialContactSchema = z.object({
  instagramUrl: z.string().optional().or(z.literal("")),
  facebookUrl: z.string().optional().or(z.literal("")),
  linkedinUrl: z.string().optional().or(z.literal("")),
  twitterUrl: z.string().optional().or(z.literal("")),
  behanceUrl: z.string().optional().or(z.literal("")),
  dribbbleUrl: z.string().optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
})

type SocialContactData = z.infer<typeof socialContactSchema>

interface SocialContactFormProps {
  data: any
  onChange: (sectionId: string, data: SocialContactData) => void
  userId: string
}

interface SocialLink {
  id: string
  platform: string
  url: string
  displayName?: string
}

export default function SocialContactForm({ data, onChange, userId }: SocialContactFormProps) {
  const [loading, setLoading] = useState(false)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  const form = useForm<SocialContactData>({
    resolver: zodResolver(socialContactSchema),
    defaultValues: {
      instagramUrl: "",
      facebookUrl: "",
      linkedinUrl: "",
      twitterUrl: "",
      behanceUrl: "",
      dribbbleUrl: "",
      portfolioUrl: "",
      website: "",
      email: "",
      phone: "",
    }
  })

  // Fetch existing data when component mounts or userId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        console.log('⚠️ SocialContactForm: No userId provided, cannot fetch data')
        return
      }

      try {
        setLoading(true)
        console.log('🔄 SocialContactForm: Fetching data for user:', userId)

        // Fetch social links from API
        const response = await fetch('/api/profile/social-contact', {
          method: 'GET',
          credentials: 'include',
        })

        console.log('📡 SocialContactForm: API response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.log('❌ SocialContactForm: API error response:', errorText)
          throw new Error(`Failed to fetch social contact data: ${response.status} - ${errorText}`)
        }

        const responseData = await response.json()
        console.log('📊 SocialContactForm: Raw API response:', responseData)

        const { profile, socialLinks: links } = responseData
        setSocialLinks(links || [])

        // Convert social links to form format
        const formData: Partial<SocialContactData> = {
          email: profile?.email || "",
          phone: profile?.phone || "",
          instagramUrl: "",
          facebookUrl: "",
          linkedinUrl: "",
          twitterUrl: "",
          behanceUrl: "",
          dribbbleUrl: "",
          portfolioUrl: "",
          website: "",
        }

        // Map social links to form fields - extract handles from URLs
        if (links && Array.isArray(links)) {
          links.forEach((link: SocialLink) => {
            const extractHandle = (url: string, baseUrl: string) => {
              if (!baseUrl) return url // For portfolio and website, return full URL
              return url.replace(baseUrl, '').replace(/\/$/, '') // Remove base URL and trailing slash
            }

            switch (link.platform.toLowerCase()) {
              case 'instagram':
                formData.instagramUrl = extractHandle(link.url, 'https://instagram.com/')
                break
              case 'facebook':
                formData.facebookUrl = extractHandle(link.url, 'https://facebook.com/')
                break
              case 'linkedin':
                formData.linkedinUrl = extractHandle(link.url, 'https://linkedin.com/in/')
                break
              case 'twitter':
              case 'x':
                formData.twitterUrl = extractHandle(link.url, 'https://x.com/')
                break
              case 'behance':
                formData.behanceUrl = extractHandle(link.url, 'https://behance.net/')
                break
              case 'dribbble':
                formData.dribbbleUrl = extractHandle(link.url, 'https://dribbble.com/')
                break
              case 'portfolio':
                formData.portfolioUrl = link.url
                break
              case 'website':
                formData.website = link.url
                break
            }
          })
        }

        console.log('🔄 SocialContactForm: Resetting form with data:', formData)
        form.reset(formData as SocialContactData)
        console.log('✅ SocialContactForm: Form reset completed')

      } catch (error) {
        console.error('❌ SocialContactForm: Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load existing data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    console.log('🎯 SocialContactForm: useEffect triggered with userId:', userId)
    if (userId) {
      fetchData()
    }
  }, [userId]) // Only depend on userId

  // Watch for form changes and call onChange when form data changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      onChange("social", value)
    })
    return () => subscription.unsubscribe()
  }, [onChange]) // Remove form from dependencies as it's stable

  const handleSave = async (formData: SocialContactData) => {
    try {
      setLoading(true)
      console.log('💾 Saving social contact data:', formData)

      // Prepare social links data - construct full URLs from handles
      const socialLinksData = []

      const constructUrl = (handle: string, baseUrl: string) => {
        if (!baseUrl) return handle // For portfolio and website, use as-is
        return baseUrl + handle.replace(/^\/+/, '') // Remove leading slashes and prepend base URL
      }

      if (formData.instagramUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'instagram', 
          url: constructUrl(formData.instagramUrl.trim(), 'https://instagram.com/') 
        })
      }
      if (formData.facebookUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'facebook', 
          url: constructUrl(formData.facebookUrl.trim(), 'https://facebook.com/') 
        })
      }
      if (formData.linkedinUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'linkedin', 
          url: constructUrl(formData.linkedinUrl.trim(), 'https://linkedin.com/in/') 
        })
      }
      if (formData.twitterUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'x', 
          url: constructUrl(formData.twitterUrl.trim(), 'https://x.com/') 
        })
      }
      if (formData.behanceUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'behance', 
          url: constructUrl(formData.behanceUrl.trim(), 'https://behance.net/') 
        })
      }
      if (formData.dribbbleUrl?.trim()) {
        socialLinksData.push({ 
          platform: 'dribbble', 
          url: constructUrl(formData.dribbbleUrl.trim(), 'https://dribbble.com/') 
        })
      }
      if (formData.portfolioUrl?.trim()) {
        socialLinksData.push({ platform: 'portfolio', url: formData.portfolioUrl.trim() })
      }
      if (formData.website?.trim()) {
        socialLinksData.push({ platform: 'website', url: formData.website.trim() })
      }

      // Save data via API
      const response = await fetch('/api/profile/social-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email || null,
          phone: formData.phone || null,
          socialLinks: socialLinksData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save social contact data')
      }

      const result = await response.json()
      console.log('✅ Save response:', result)

      // Update local state with returned data
      if (result.socialLinks) {
        setSocialLinks(result.socialLinks)
      }

      toast({
        title: "Success",
        description: "Social & contact information saved successfully",
      })

    } catch (error) {
      console.error('❌ Error saving social contact data:', error)
      toast({
        title: "Error",
        description: "Failed to save social & contact information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const contactMethods = [
    {
      id: "email",
      label: "Email Address",
      placeholder: "your.email@example.com",
      icon: <Mail className="h-5 w-5" />,
      description: "Your registered email address (cannot be changed here)",
      type: "email"
    },
    {
      id: "phone",
      label: "Phone Number",
      placeholder: "+1 (555) 123-4567",
      icon: <Phone className="h-5 w-5" />,
      description: "Optional phone contact (will be kept private)",
      type: "tel"
    }
  ]

  const socialPlatforms = [
    {
      id: "instagramUrl",
      label: "Instagram",
      placeholder: "yourusername",
      baseUrl: "https://instagram.com/",
      icon: <Instagram className="h-5 w-5" />,
      description: "Share your visual content and daily updates"
    },
    {
      id: "facebookUrl",
      label: "Facebook",
      placeholder: "yourprofile",
      baseUrl: "https://facebook.com/",
      icon: <Facebook className="h-5 w-5" />,
      description: "Connect with friends and communities"
    },
    {
      id: "linkedinUrl",
      label: "LinkedIn",
      placeholder: "yourprofile",
      baseUrl: "https://linkedin.com/in/",
      icon: <Linkedin className="h-5 w-5" />,
      description: "Connect professionally with mentors and peers"
    },
    {
      id: "twitterUrl",
      label: "X",
      placeholder: "yourusername",
      baseUrl: "https://x.com/",
      icon: <X className="h-5 w-5" />,
      description: "Share thoughts and engage in conversations"
    },
    {
      id: "behanceUrl",
      label: "Behance",
      placeholder: "yourprofile",
      baseUrl: "https://behance.net/",
      icon: <Globe className="h-5 w-5" />,
      description: "Showcase your creative projects and designs"
    },
    {
      id: "dribbbleUrl",
      label: "Dribbble",
      placeholder: "yourusername",
      baseUrl: "https://dribbble.com/",
      icon: <Globe className="h-5 w-5" />,
      description: "Display your design work and get inspiration"
    },
    {
      id: "portfolioUrl",
      label: "Portfolio Website",
      placeholder: "https://yourportfolio.com",
      baseUrl: "",
      icon: <Globe className="h-5 w-5" />,
      description: "Showcase your work and achievements"
    },
    {
      id: "website",
      label: "Personal Website",
      placeholder: "https://yourwebsite.com",
      baseUrl: "",
      icon: <Globe className="h-5 w-5" />,
      description: "Your personal blog or website"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Social & Contact</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add your social media profiles and contact information to help others connect with you
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactMethods.map((contact) => (
                <FormField
                  key={contact.id}
                  control={form.control}
                  name={contact.id as keyof SocialContactData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">{contact.icon}</span>
                        <span>{contact.label}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={contact.type}
                          placeholder={contact.placeholder}
                          readOnly={contact.id === "email"}
                          className={contact.id === "email" ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : ""}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">{contact.description}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Social Media Profiles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socialPlatforms.map((link) => (
                <FormField
                  key={link.id}
                  control={form.control}
                  name={link.id as keyof SocialContactData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">{link.icon}</span>
                        <span>{link.label}</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {link.baseUrl && (
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                              {link.baseUrl}
                            </div>
                          )}
                          <Input
                            placeholder={link.placeholder}
                            className={link.baseUrl ? "pl-[200px]" : ""}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <p className="text-sm text-gray-500">{link.description}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Quick Tips */}
            <div className="mt-8 bg-amber-50/30 dark:bg-amber-900/10 rounded-xl p-6 border border-amber-100 dark:border-amber-800/20">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mt-0.5">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h5 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Quick Tips</h5>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1.5">
                    <li>• Enter just your username/handle (we'll add the full URL automatically)</li>
                    <li>• Your profiles help mentors understand your interests and personality</li>
                    <li>• You can always update or remove these links later in privacy settings</li>
                  </ul>
                </div>
              </div>
            </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Privacy & Safety</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>• Your contact information will only be shared with verified mentors when you connect with them</li>
                  <li>• You can control who sees your social media profiles in Privacy Settings</li>
                  <li>• Phone numbers are kept private and only used for important notifications</li>
                  <li>• You can update or remove this information at any time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Social & Contact Info</span>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}