
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Upload } from "lucide-react"
import { registerInstitution } from "@/lib/services/auth-service"
import { toast } from "sonner"

interface InstitutionRegistrationProps {
  onComplete: () => void
}

interface InstitutionCategory {
  id: number
  name: string
  slug: string
  description?: string
}

interface InstitutionType {
  id: number
  categoryId: number
  name: string
  slug: string
  description?: string
}

// Required field indicator component
const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>

export default function InstitutionRegistration({ onComplete }: InstitutionRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<InstitutionCategory[]>([])
  const [availableTypes, setAvailableTypes] = useState<InstitutionType[]>([])
  const [allTypes, setAllTypes] = useState<InstitutionType[]>([])

  const [formData, setFormData] = useState({
    // Personal contact information
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    
    // Institution details matching schema
    institutionName: "",
    categoryId: "", // For selecting category first
    institutionTypeId: "", // This will be the foreign key to institution_types
    website: "",
    logoUrl: "",
    coverImageUrl: "",
    description: "",
    
    // Agreement
    agreeTerms: false,
  })

  // Fetch institution categories and types on component mount
  useEffect(() => {
    const fetchInstitutionData = async () => {
      try {
        const response = await fetch('/api/institution-types')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.data)
          // Flatten all types for easier filtering
          const flatTypes = data.data.flatMap((category: any) => 
            category.types.map((type: any) => ({
              ...type,
              categoryId: category.id
            }))
          )
          setAllTypes(flatTypes)
        }
      } catch (error) {
        console.error('Failed to fetch institution data:', error)
        toast.error('Failed to load institution categories')
      }
    }

    fetchInstitutionData()
  }, [])

  // Update available types when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const categoryTypes = allTypes.filter(type => type.categoryId === parseInt(formData.categoryId))
      setAvailableTypes(categoryTypes)
      // Reset type selection when category changes
      setFormData(prev => ({ ...prev, institutionTypeId: "" }))
    } else {
      setAvailableTypes([])
    }
  }, [formData.categoryId, allTypes])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || 
          !formData.institutionName || !formData.institutionTypeId || !formData.description) {
        toast.error('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      if (!formData.agreeTerms) {
        toast.error('Please agree to the terms and conditions')
        setIsLoading(false)
        return
      }

      // Prepare data for registration
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: "institution" as const,
        institutionData: {
          institutionName: formData.institutionName,
          institutionTypeId: parseInt(formData.institutionTypeId),
          category: categories.find(cat => cat.id === parseInt(formData.categoryId))?.name || "",
          website: formData.website,
          logoUrl: formData.logoUrl,
          coverImageUrl: formData.coverImageUrl,
          description: formData.description,
        }
      }

      console.log('Submitting registration data:', registrationData)

      const result = await registerInstitution(registrationData)

      if (result.success) {
        toast.success('Institution registered successfully!')
        onComplete()
      } else {
        toast.error(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-center">Register Your Institution</h2>
      <p className="text-slate-600 mb-6 text-center">Connect your organization with students and mentors</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Person Information */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Contact Person Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name
                <RequiredIndicator />
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="rounded-lg border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name
                <RequiredIndicator />
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="rounded-lg border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
                <RequiredIndicator />
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter institutional email"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-lg border-slate-300"
              />
              <p className="text-xs text-slate-500">Preferably an institutional email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
                <RequiredIndicator />
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="rounded-lg border-slate-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-500">Password must be at least 8 characters long</p>
            </div>
          </div>
        </div>

        {/* Institution Information */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Institution Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">
                Institution Name
                <RequiredIndicator />
              </Label>
              <Input
                id="institutionName"
                name="institutionName"
                placeholder="Enter institution name"
                value={formData.institutionName}
                onChange={handleChange}
                required
                className="rounded-lg border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">
                  Institution Category
                  <RequiredIndicator />
                </Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => handleSelectChange("categoryId", value)}
                  required
                >
                  <SelectTrigger className="rounded-lg border-slate-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Select the broad category that describes your institution</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionTypeId">
                  Institution Type
                  <RequiredIndicator />
                </Label>
                <Select 
                  value={formData.institutionTypeId} 
                  onValueChange={(value) => handleSelectChange("institutionTypeId", value)}
                  disabled={!formData.categoryId}
                  required
                >
                  <SelectTrigger className="rounded-lg border-slate-300">
                    <SelectValue 
                      placeholder={formData.categoryId ? "Select specific type" : "Select category first"} 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {formData.categoryId 
                    ? "Select the specific type within the selected category"
                    : "Select a category first to see available types"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Institution Description
                <RequiredIndicator />
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your institution, its mission, and what makes it unique"
                value={formData.description}
                onChange={handleChange}
                required
                className="rounded-lg border-slate-300 min-h-[100px]"
              />
              <p className="text-xs text-slate-500">This will be visible on your institution profile</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://your-institution.edu"
                value={formData.website}
                onChange={handleChange}
                className="rounded-lg border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Institution Media (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Institution Logo</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                <div className="flex flex-col items-center">
                  <Upload className="h-6 w-6 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Upload logo</p>
                  <p className="text-xs text-slate-500">PNG, JPG or SVG (max. 2MB)</p>
                  <Input
                    type="url"
                    name="logoUrl"
                    placeholder="Or paste logo URL"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    className="mt-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                <div className="flex flex-col items-center">
                  <Upload className="h-6 w-6 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Upload cover image</p>
                  <p className="text-xs text-slate-500">PNG, JPG (max. 5MB)</p>
                  <Input
                    type="url"
                    name="coverImageUrl"
                    placeholder="Or paste cover image URL"
                    value={formData.coverImageUrl}
                    onChange={handleChange}
                    className="mt-2 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeTerms"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onCheckedChange={(checked) => {
              setFormData({
                ...formData,
                agreeTerms: checked as boolean,
              })
            }}
            required
            className="mt-1 border-slate-300"
          />
          <div>
            <Label htmlFor="agreeTerms" className="text-sm text-slate-600">
              I agree to the{" "}
              <a href="/terms" className="text-purple-500 hover:text-purple-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-purple-500 hover:text-purple-600">
                Privacy Policy
              </a>
              <RequiredIndicator />
            </Label>
            <p className="text-xs text-slate-500">
              By registering, you confirm that you are authorized to represent this institution on PathPiper.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !formData.agreeTerms}
          className="w-full bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white rounded-full py-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Registering Institution...
            </div>
          ) : (
            "Register Institution"
          )}
        </Button>
      </form>
    </div>
  )
}
