"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, ImagePlus } from "lucide-react"
import { INSTITUTION_CATEGORIES } from "@/data/institution-types"

interface InstitutionInfo {
  name: string
  description: string
  location: string
  categoryId: string
  typeId: string
  customType?: string
  website: string
  logo: any
  coverImage: any
}

interface InstitutionInfoStepProps {
  initialData: Partial<InstitutionInfo>
  onComplete: (data: InstitutionInfo) => void
  onNext: () => void
}

export default function InstitutionInfoStep({ initialData, onComplete, onNext }: InstitutionInfoStepProps) {
  // Define default values to handle undefined properties
  const defaultData: InstitutionInfo = {
    name: "",
    description: "",
    location: "",
    categoryId: "",
    typeId: "",
    customType: "",
    website: "",
    logo: null,
    coverImage: null,
  }

  // Merge initialData with defaultData to ensure all fields exist
  const mergedInitialData = { ...defaultData, ...initialData }

  const [formData, setFormData] = useState<InstitutionInfo>(mergedInitialData)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [availableTypes, setAvailableTypes] = useState<{ id: string; label: string }[]>([])
  const [showCustomType, setShowCustomType] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Update available types when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const category = INSTITUTION_CATEGORIES.find((cat) => cat.id === formData.categoryId)
      if (category) {
        setAvailableTypes(category.types)
      } else {
        setAvailableTypes([])
      }
    } else {
      setAvailableTypes([])
    }
  }, [formData.categoryId])

  // Check if "Other" type is selected
  useEffect(() => {
    setShowCustomType(formData.typeId === "other_type")
  }, [formData.typeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
      typeId: "", // Reset type when category changes
      customType: "", // Reset custom type when category changes
    }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      typeId: value,
      customType: value === "other_type" ? prev.customType : "", // Keep custom type if "Other" is selected
    }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }))

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
      }))

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerLogoInput = () => {
    logoInputRef.current?.click()
  }

  const triggerCoverInput = () => {
    coverInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(formData)
    onNext()
  }

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.description.trim() !== "" &&
    formData.categoryId !== "" &&
    formData.typeId !== "" &&
    (formData.typeId !== "other_type" || (formData.customType && formData.customType.trim() !== ""))

  // Get category label for display
  const getCategoryLabel = (categoryId: string) => {
    const category = INSTITUTION_CATEGORIES.find((cat) => cat.id === categoryId)
    return category ? category.label : ""
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Institution Information</h2>
      <p className="text-slate-600 mb-6">
        Let's set up your institution profile to help students discover your programs and opportunities
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          <div
            className="w-full h-48 rounded-lg bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-purple-400 transition-colors"
            onClick={triggerCoverInput}
          >
            {coverPreview ? (
              <Image
                src={coverPreview || "/placeholder.svg"}
                alt="Cover preview"
                width={800}
                height={300}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <ImagePlus className="h-10 w-10 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500 text-center px-4">
                  Click to upload a cover image for your institution
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
            aria-label="Upload cover image"
          />
          <p className="text-xs text-slate-500">Recommended: 1200x400px image</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-2/3 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Institution Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your institution's name"
                className="rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your institution, its mission, and what makes it unique"
                className="rounded-lg min-h-[120px]"
                required
              />
              <p className="text-xs text-slate-500">This will be displayed on your institution profile</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="categoryId">
                  Institution Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.categoryId} onValueChange={handleCategoryChange} required>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select institution category" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Select the broad category that best describes your institution</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeId">
                  Institution Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.typeId}
                  onValueChange={handleTypeChange}
                  disabled={!formData.categoryId}
                  required
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue
                      placeholder={formData.categoryId ? "Select specific institution type" : "Select a category first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {formData.categoryId
                    ? `Select the specific type within ${getCategoryLabel(formData.categoryId)}`
                    : "Select a category first to see available types"}
                </p>
              </div>

              {/* Custom Type Field */}
              {showCustomType && (
                <div className="space-y-2">
                  <Label htmlFor="customType">
                    Specify Institution Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customType"
                    name="customType"
                    value={formData.customType}
                    onChange={handleChange}
                    placeholder="Please specify your institution type"
                    className="rounded-lg"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Please provide the specific type of educational institution you represent
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://your-institution.edu"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col items-center">
            <Label className="text-center mb-2">Institution Logo</Label>
            <div
              className="w-40 h-40 rounded-lg bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-purple-400 transition-colors"
              onClick={triggerLogoInput}
            >
              {logoPreview ? (
                <Image
                  src={logoPreview || "/placeholder.svg"}
                  alt="Logo preview"
                  width={160}
                  height={160}
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <Camera className="h-10 w-10 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500 text-center px-4">Click to upload your institution logo</span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
              aria-label="Upload institution logo"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">Recommended: Square image, at least 400x400px</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={!isFormValid}
            className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white rounded-full px-8"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
