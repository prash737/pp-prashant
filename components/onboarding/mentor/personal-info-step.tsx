"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera } from "lucide-react"

interface MentorPersonalInfo {
  firstName: string
  lastName: string
  bio: string
  location: string
  profession: string
  organization: string
  profileImage: any
}

interface MentorPersonalInfoStepProps {
  initialData: Partial<MentorPersonalInfo>
  onComplete: (data: MentorPersonalInfo) => void
  onNext: () => void
}

export default function MentorPersonalInfoStep({ initialData, onComplete, onNext }: MentorPersonalInfoStepProps) {
  // Define default values to handle undefined properties
  const defaultData: MentorPersonalInfo = {
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    profession: "",
    organization: "",
    profileImage: null,
  }

  // Merge initialData with defaultData to ensure all fields exist
  const mergedInitialData = { ...defaultData, ...initialData }

  const [formData, setFormData] = useState<MentorPersonalInfo>(mergedInitialData)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }))

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(formData)
    onNext()
  }

  const isFormValid =
    formData.firstName.trim() !== "" && formData.lastName.trim() !== "" && formData.profession.trim() !== ""

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Mentor Profile Information</h2>
      <p className="text-slate-600 mb-6">Let's set up your mentor profile to help students find and connect with you</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-2/3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                Professional Bio <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share your background, expertise, and mentoring philosophy"
                className="rounded-lg min-h-[120px]"
                required
              />
              <p className="text-xs text-slate-500">This will be displayed on your mentor profile</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profession">
                  Profession <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer, Teacher"
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="e.g., Google, Stanford University"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col items-center">
            <Label className="text-center mb-2">Profile Picture</Label>
            <div
              className="w-40 h-40 rounded-full bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-orange-400 transition-colors"
              onClick={triggerFileInput}
            >
              {previewImage ? (
                <Image
                  src={previewImage || "/placeholder.svg"}
                  alt="Profile preview"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Camera className="h-10 w-10 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500 text-center px-4">Click to upload a profile picture</span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              aria-label="Upload profile picture"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">Recommended: Square image, at least 400x400px</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={!isFormValid}
            className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-full px-8"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
