"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Upload, User } from "lucide-react"
import { toast } from "sonner"
import PipLoader from "@/components/loading/pip-loader"

// Reuse the same schema from onboarding for consistency
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  bio: z.string().max(300, { message: "Bio must be less than 300 characters" }).optional(),
  location: z.string().optional(),
  educationLevel: z.string().optional(),
  birthMonth: z.string(),
  birthYear: z.string(),
  ageGroup: z.string(),
  tagline: z.string().max(100, "Tagline must be less than 100 characters").optional(),
  profileImageUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
})

type PersonalInfoData = z.infer<typeof personalInfoSchema>

// Age group type definition - matches database enum with snake_case
export type AgeGroup = "early_childhood" | "elementary" | "middle_school" | "high_school" | "young_adult"

interface PersonalInfoFormProps {
  data: any
  onChange: (sectionId: string, data: PersonalInfoData) => void
  onSave?: (data: PersonalInfoData) => Promise<void>
}

// Function to calculate age group based on birth month and year (reused from onboarding)
const calculateAgeGroup = (birthMonth: string, birthYear: string): string => {
  if (!birthMonth || !birthYear) return ""

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const birthYearNum = parseInt(birthYear)
  const birthMonthNum = parseInt(birthMonth)

  let ageInMonths = (currentYear - birthYearNum) * 12 + (currentMonth - birthMonthNum)

  if (ageInMonths < 60) {
    return "early_childhood"
  } else if (ageInMonths < 132) {
    return "elementary"
  } else if (ageInMonths < 156) {
    return "middle_school"
  } else if (ageInMonths < 216) {
    return "high_school"
  } else {
    return "young_adult"
  }
}

export default function PersonalInfoForm({ data, onChange, onSave }: PersonalInfoFormProps) {
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [coverImagePreview, setCoverImagePreview] = useState<string>("")
  const [isDirty, setIsDirty] = useState(false)
  const [originalData, setOriginalData] = useState<PersonalInfoData | null>(null)
  const [loading, setLoading] = useState(true); // State to manage loading status

  // Default data structure
  const defaultData: PersonalInfoData = {
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    educationLevel: "",
    birthMonth: "",
    birthYear: "",
    ageGroup: "",
    tagline: "",
    profileImageUrl: "",
    coverImageUrl: "",
  }

  const form = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: defaultData
  })

  // Update form when data changes (similar to onboarding logic)
  useEffect(() => {
    console.log("🔄 PersonalInfoForm useEffect triggered")
    console.log("📊 Data received:", data)

    if (data) {
      const formData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        location: data.location || "",
        educationLevel: data.educationLevel || "",
        birthMonth: data.birthMonth || "",
        birthYear: data.birthYear || "",
        ageGroup: data.ageGroup || "",
        tagline: data.tagline || "",
        profileImageUrl: data.profileImageUrl || "",
        coverImageUrl: data.coverImageUrl || "",
      }

      console.log("🎯 =================================")
      console.log("🎯 PROFILE EDIT - FIELD VALUES FROM DB:")
      console.log("🎯 =================================")
      console.log("🎯 First Name:", data.firstName)
      console.log("🎯 Last Name:", data.lastName)
      console.log("🎯 Bio:", data.bio)
      console.log("🎯 Location:", data.location)
      console.log("🎯 Education Level:", data.educationLevel)
      console.log("🎯 Birth Month:", data.birthMonth)
      console.log("🎯 Birth Year:", data.birthYear)
      console.log("🎯 Age Group:", data.ageGroup)
      console.log("🎯 Tagline:", data.tagline)
      console.log("🎯 Profile Image URL:", data.profileImageUrl)
      console.log("🎯 Cover Image URL:", data.coverImageUrl)
      console.log("🎯 =================================")

      form.reset(formData)
      setOriginalData(formData)
      setIsDirty(false)

      setProfileImagePreview(data.profileImageUrl || "")
      setCoverImagePreview(data.coverImageUrl || "")

      console.log("✅ Form reset completed")
      setLoading(false); // Set loading to false once data is loaded and form is reset
    }
  }, [data, form])

  // Handle form changes - only update parent state when saving
  const handleFormChange = useCallback((value: any, isDirtyState?: boolean) => {
    // Update parent state and pass dirty state
    onChange("personal", value, isDirtyState !== undefined ? isDirtyState : isDirty)
  }, [onChange, isDirty])

  // Watch for form changes to set dirty bit with better comparison
  const watchedValues = form.watch()
  useEffect(() => {
    if (!originalData) return

    // Add a small delay to ensure form has been properly reset
    const timeoutId = setTimeout(() => {
      const currentData = form.getValues()
      const hasChanges = Object.keys(currentData).some(key => {
        const currentValue = currentData[key as keyof PersonalInfoData]
        const originalValue = originalData[key as keyof PersonalInfoData]

        // Handle null/undefined/empty string comparison more carefully
        const normalizedCurrent = currentValue || ""
        const normalizedOriginal = originalValue || ""

        return normalizedCurrent !== normalizedOriginal
      })

      if (isDirty !== hasChanges) {
        setIsDirty(hasChanges)
        // Always notify parent component about dirty state changes
        handleFormChange(currentData, hasChanges)
      }
    }, 100) // Small delay to ensure form reset is complete

    return () => clearTimeout(timeoutId)
  }, [watchedValues, originalData, form, isDirty, handleFormChange])

  // Watch for changes in birth month and year to auto-calculate age group (reused from onboarding)
  const watchedBirthMonth = form.watch("birthMonth")
  const watchedBirthYear = form.watch("birthYear")

  useEffect(() => {
    if (watchedBirthMonth && watchedBirthYear) {
      const calculatedAgeGroup = calculateAgeGroup(watchedBirthMonth, watchedBirthYear)
      form.setValue("ageGroup", calculatedAgeGroup)
    }
  }, [watchedBirthMonth, watchedBirthYear, form])

  const handleImageUpload = (type: 'profile' | 'cover', file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (type === 'profile') {
        setProfileImagePreview(result)
        form.setValue('profileImageUrl', result)
      } else {
        setCoverImagePreview(result)
        form.setValue('coverImageUrl', result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Function to handle manual saving when save button is clicked
  const handleSave = async () => {
    try {
      console.log("💾 Personal info save triggered")
      console.log("🔍 Personal Info dirty bit:", isDirty)

      if (!isDirty) {
        console.log("✅ Personal info unchanged, skipping save")
        toast.success("No changes to save")
        return
      }

      const formData = form.getValues()
      console.log("📤 Saving personal info data:", formData)

      if (onSave) {
        await onSave(formData)
        // Reset dirty state and update original data after successful save
        setOriginalData(formData)
        setIsDirty(false)
        // Notify parent that changes have been saved
        handleFormChange(formData)
        console.log("✅ Personal info saved successfully")
      }
    } catch (error) {
      console.error("❌ Save failed:", error)
      throw error
    }
  }

  const onSubmit = async (formData: any) => {
    console.log("🚀 PersonalInfoForm onSubmit called")
    console.log("📝 Form data:", formData)
    console.log("🔍 Personal Info dirty bit:", isDirty)

    if (!isDirty) {
      console.log("✅ Personal info unchanged, skipping save")
      toast.success("No changes to save")
      return
    }

    try {
      console.log("💾 Personal info has changes, saving to database...")

      // Map form data to match API expectations (same as onboarding)
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        location: formData.location,
        tagline: formData.tagline,
        profileImageUrl: formData.profileImageUrl,
        coverImageUrl: formData.coverImageUrl,
        // Student-specific fields
        educationLevel: formData.educationLevel,
        ageGroup: formData.ageGroup, // This will be mapped to age_group in the API
        birthMonth: formData.birthMonth,
        birthYear: formData.birthYear,
      }

      console.log("📤 Saving personal info data:", apiData)

      const response = await fetch('/api/profile/personal-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Profile updated successfully:", result)
        toast.success("Personal information updated successfully!")

        // Reset dirty state after successful save (same as onboarding)
        setOriginalData(formData)
        setIsDirty(false)

        // Call parent onSave callback if provided
        if (onSave) {
          await onSave(formData)
        }

        console.log("✅ Personal info saved successfully")
      } else {
        const error = await response.json()
        console.error("❌ Failed to update profile:", error)
        toast.error("Failed to update profile: " + (error.message || "Unknown error"))
      }
    } catch (error) {
      console.error("💥 Error updating profile:", error)
      toast.error("An error occurred while updating your profile")
    }
  }

  if (loading) {
    return (
      <div className="relative">
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        <div className="absolute inset-0 flex items-center justify-center">
          <PipLoader 
            isVisible={true} 
            userType="student"
            currentStep="personal-info"
            onComplete={() => {}}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tell us about yourself to help others get to know you better
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Profile Image Upload */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload('profile', file)
                  }}
                  className="hidden"
                  id="profile-image"
                />
                <label htmlFor="profile-image">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </span>
                  </Button>
                </label>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-4">
            <Label>Cover Image</Label>
            <div className="space-y-4">
              <div className="w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {coverImagePreview ? (
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Upload a cover image</p>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload('cover', file)
                  }}
                  className="hidden"
                  id="cover-image"
                />
                <label htmlFor="cover-image">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Cover
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Basic Information - reusing onboarding structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Me</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little about yourself"
                    className="resize-none h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Share your interests, goals, or anything else you'd like others to know.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="birthMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Month</FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 border-slate-200 cursor-not-allowed">
                          <SelectValue placeholder="Month from registration">
                            {field.value && field.value !== "" ? 
                              ["", "January", "February", "March", "April", "May", "June", 
                               "July", "August", "September", "October", "November", "December"][parseInt(field.value)] || "Month from registration"
                              : "Month from registration"
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg">
                        <SelectGroup>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Year</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Year from registration"
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled
                      className="bg-slate-50 border-slate-200 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="ageGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Group</FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-teal-500">
                          <SelectValue placeholder="Choose your age group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg">
                        <SelectGroup>
                          <SelectItem value="early_childhood" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Early Childhood (Under 5)
                          </SelectItem>
                          <SelectItem value="elementary" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Elementary (5-10 years)
                          </SelectItem>
                          <SelectItem value="middle_school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Middle School (11-12 years)
                          </SelectItem>
                          <SelectItem value="high_school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            High School (13-17 years)
                          </SelectItem>
                          <SelectItem value="young_adult" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Young Adult (18+ years)
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="educationLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Level</FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-teal-500">
                          <SelectValue placeholder="Choose your education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-lg">
                        <SelectGroup>
                          <SelectItem value="pre_school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Pre-School
                          </SelectItem>
                          <SelectItem value="school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            School
                          </SelectItem>
                          <SelectItem value="high_school" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            High School
                          </SelectItem>
                          <SelectItem value="undergraduate" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Undergraduate
                          </SelectItem>
                          <SelectItem value="graduate" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Graduate
                          </SelectItem>
                          <SelectItem value="post_graduate" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            Post Graduate
                          </SelectItem>
                          <SelectItem value="phd" className="hover:bg-slate-50 focus:bg-teal-50 focus:text-teal-700">
                            PhD
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tagline</FormLabel>
                <FormControl>
                  <Input
                    placeholder="A short description of yourself (e.g., 'Aspiring Software Developer')"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dirty state indicator */}
          {isDirty && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-700">
                You have unsaved changes. Click the Save button below to save your changes.
              </p>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={!isDirty}
              className="min-w-[120px]"
            >
              {isDirty ? "Save Changes" : "All Saved"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}