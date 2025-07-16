"use client"

import { useState, useEffect } from "react"
import { Plus, X, Calendar, Link, ChevronDown, ChevronUp, Briefcase, GraduationCap, Heart, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the interface for experience data
interface Experience {
  title: string
  organization: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  type: string
  credentialId?: string
  credentialUrl?: string
}

interface ExperienceStepProps {
  initialData: Experience[]
  onComplete: (data: Experience[]) => void
  onNext: () => void
  onSkip: () => void
}

export default function MentorExperienceStep({ initialData, onComplete, onNext, onSkip }: ExperienceStepProps) {
  const [experiences, setExperiences] = useState<Experience[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            title: "",
            organization: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
            type: "work",
          },
        ],
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  // State to track which experience blocks are expanded
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>({})

  // Initialize the first experience as expanded, or if there are existing experiences, collapse them
  useEffect(() => {
    const initialExpandedState: Record<number, boolean> = {}

    // If we're starting with just one default experience, expand it
    if (experiences.length === 1 && !experiences[0].title && !experiences[0].organization) {
      initialExpandedState[0] = true
    } else {
      // For existing data, set the first one as expanded and others collapsed
      experiences.forEach((_, index) => {
        initialExpandedState[index] = index === 0
      })
    }

    setExpandedBlocks(initialExpandedState)
  }, [])

  const toggleExpand = (index: number) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleAddExperience = () => {
    const newExperience = {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      type: "work",
    }

    const newIndex = experiences.length
    setExperiences([...experiences, newExperience])

    // Collapse all other blocks and expand the new one
    const newExpandedState: Record<number, boolean> = {}
    experiences.forEach((_, index) => {
      newExpandedState[index] = false
    })
    newExpandedState[newIndex] = true
    setExpandedBlocks(newExpandedState)
  }

  const handleRemoveExperience = (index: number) => {
    const newExperiences = [...experiences]
    newExperiences.splice(index, 1)
    setExperiences(newExperiences)

    // Update expanded blocks state
    const newExpandedState = { ...expandedBlocks }
    delete newExpandedState[index]

    // Shift the expanded state for all blocks after the removed one
    for (let i = index + 1; i <= experiences.length; i++) {
      if (newExpandedState[i] !== undefined) {
        newExpandedState[i - 1] = newExpandedState[i]
        delete newExpandedState[i]
      }
    }

    setExpandedBlocks(newExpandedState)
  }

  const handleExperienceChange = (index: number, field: string, value: any) => {
    const newExperiences = [...experiences]
    newExperiences[index] = { ...newExperiences[index], [field]: value }

    // If setting current to true, clear the end date
    if (field === "current" && value === true) {
      newExperiences[index].endDate = ""
    }

    // If changing type to certification, initialize credential fields if they don't exist
    if (field === "type" && value === "certification") {
      if (!newExperiences[index].credentialId) {
        newExperiences[index].credentialId = ""
      }
      if (!newExperiences[index].credentialUrl) {
        newExperiences[index].credentialUrl = ""
      }
    }

    setExperiences(newExperiences)

    // Clear error for this field if it exists
    if (errors[`${field}-${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`${field}-${index}`]
      setErrors(newErrors)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    experiences.forEach((exp, index) => {
      if (!exp.title.trim()) {
        newErrors[`title-${index}`] =
          exp.type === "certification" ? "Certification name is required" : "Title is required"
        isValid = false
      }

      if (!exp.organization.trim()) {
        newErrors[`organization-${index}`] =
          exp.type === "certification" ? "Issuing organization is required" : "Organization is required"
        isValid = false
      }

      if (!exp.startDate.trim()) {
        newErrors[`startDate-${index}`] =
          exp.type === "certification" ? "Issue date is required" : "Start date is required"
        isValid = false
      }

      if (!exp.current && !exp.endDate.trim()) {
        newErrors[`endDate-${index}`] =
          exp.type === "certification" ? "Expiration date is required" : "End date is required"
        isValid = false
      }

      if (exp.startDate && exp.endDate && new Date(exp.startDate) > new Date(exp.endDate)) {
        newErrors[`endDate-${index}`] =
          exp.type === "certification"
            ? "Expiration date must be after issue date"
            : "End date must be after start date"
        isValid = false
      }

      // Validate credential URL format if provided
      if (exp.type === "certification" && exp.credentialUrl && !isValidUrl(exp.credentialUrl)) {
        newErrors[`credentialUrl-${index}`] = "Please enter a valid URL"
        isValid = false
      }
    })

    setErrors(newErrors)

    // If there are errors, expand the blocks with errors
    if (!isValid) {
      const newExpandedState = { ...expandedBlocks }
      Object.keys(newErrors).forEach((key) => {
        const index = Number.parseInt(key.split("-")[1])
        newExpandedState[index] = true
      })
      setExpandedBlocks(newExpandedState)
    }

    return isValid
  }

  const isValidUrl = (url: string) => {
    if (!url.trim()) return true // Empty URLs are allowed
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(experiences)
      onNext()
    }
  }

  // Function to get the appropriate icon for each experience type
  const getExperienceTypeIcon = (type: string) => {
    switch (type) {
      case "work":
        return <Briefcase className="h-4 w-4" />
      case "education":
        return <GraduationCap className="h-4 w-4" />
      case "volunteer":
        return <Heart className="h-4 w-4" />
      case "certification":
        return <Award className="h-4 w-4" />
      default:
        return <Briefcase className="h-4 w-4" />
    }
  }

  // Function to get a summary of the experience for the collapsed view
  const getExperienceSummary = (exp: Experience) => {
    if (!exp.title && !exp.organization) {
      return `New ${exp.type} experience`
    }

    if (exp.title && exp.organization) {
      return `${exp.title} at ${exp.organization}`
    }

    return exp.title || exp.organization || `${exp.type} experience`
  }

  // Function to get the experience type label
  const getExperienceTypeLabel = (type: string) => {
    switch (type) {
      case "work":
        return "Work Experience"
      case "education":
        return "Education"
      case "volunteer":
        return "Volunteer"
      case "certification":
        return "Certification"
      default:
        return "Experience"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Your Experience</h2>
        <p className="text-slate-600 mt-2">
          Share your professional and educational background to build trust with potential mentees.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Experience</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddExperience}
            className="text-orange-600 border-orange-200 hover:bg-orange-500 hover:text-white"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Experience
          </Button>
        </div>

        {experiences.map((exp, index) => (
          <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
            {/* Collapsible header */}
            <div
              className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center gap-2">
                {getExperienceTypeIcon(exp.type)}
                <span className="font-medium text-slate-700">{getExperienceSummary(exp)}</span>
                <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                  {getExperienceTypeLabel(exp.type)}
                </span>
              </div>
              <div className="flex items-center">
                {experiences.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveExperience(index)
                    }}
                    className="h-8 w-8 p-0 mr-1 text-slate-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {expandedBlocks[index] ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </div>
            </div>

            {/* Collapsible content */}
            {expandedBlocks[index] && (
              <div className="p-4 space-y-4 border-t border-slate-200 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-slate-700">Experience Type</Label>
                  <Select value={exp.type} onValueChange={(value) => handleExperienceChange(index, "type", value)}>
                    <SelectTrigger className="w-[140px] h-7 text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work Experience</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exp.type === "certification" ? (
                    <>
                      <div>
                        <Label htmlFor={`title-${index}`}>Certification Name</Label>
                        <Input
                          id={`title-${index}`}
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                          placeholder="e.g., AWS Certified Solutions Architect"
                          className={errors[`title-${index}`] ? "border-red-500" : ""}
                        />
                        {errors[`title-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`title-${index}`]}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`organization-${index}`}>Issuing Organization</Label>
                        <Input
                          id={`organization-${index}`}
                          value={exp.organization}
                          onChange={(e) => handleExperienceChange(index, "organization", e.target.value)}
                          placeholder="e.g., Amazon Web Services"
                          className={errors[`organization-${index}`] ? "border-red-500" : ""}
                        />
                        {errors[`organization-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`organization-${index}`]}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor={`title-${index}`}>
                          {exp.type === "education" ? "Degree/Course" : "Title/Position"}
                        </Label>
                        <Input
                          id={`title-${index}`}
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                          placeholder={
                            exp.type === "education" ? "e.g., Bachelor of Science" : "e.g., Senior Developer"
                          }
                          className={errors[`title-${index}`] ? "border-red-500" : ""}
                        />
                        {errors[`title-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`title-${index}`]}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`organization-${index}`}>
                          {exp.type === "education" ? "Institution" : "Organization"}
                        </Label>
                        <Input
                          id={`organization-${index}`}
                          value={exp.organization}
                          onChange={(e) => handleExperienceChange(index, "organization", e.target.value)}
                          placeholder={exp.type === "education" ? "e.g., Stanford University" : "e.g., Google"}
                          className={errors[`organization-${index}`] ? "border-red-500" : ""}
                        />
                        {errors[`organization-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`organization-${index}`]}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {exp.type === "certification" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`credentialId-${index}`}>Credential ID</Label>
                      <Input
                        id={`credentialId-${index}`}
                        value={exp.credentialId || ""}
                        onChange={(e) => handleExperienceChange(index, "credentialId", e.target.value)}
                        placeholder="e.g., AWS-ASA-123456"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`credentialUrl-${index}`}>Credential URL</Label>
                      <div className="relative w-full">
                        <Input
                          id={`credentialUrl-${index}`}
                          value={exp.credentialUrl || ""}
                          onChange={(e) => handleExperienceChange(index, "credentialUrl", e.target.value)}
                          placeholder="e.g., https://www.credly.com/badges/..."
                          type="url"
                          className={`w-full pl-8 ${errors[`credentialUrl-${index}`] ? "border-red-500" : ""}`}
                        />
                        <Link className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        {errors[`credentialUrl-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`credentialUrl-${index}`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`startDate-${index}`}>
                      {exp.type === "certification" ? "Issue Date" : "Start Date"}
                    </Label>
                    <div className="relative w-full">
                      <Input
                        id={`startDate-${index}`}
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                        className={`w-full ${errors[`startDate-${index}`] ? "border-red-500" : ""}`}
                      />
                      <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    {errors[`startDate-${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`startDate-${index}`]}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`endDate-${index}`}>
                        {exp.type === "certification" ? "Expiration Date" : "End Date"}
                      </Label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`current-${index}`}
                          checked={exp.current}
                          onChange={(e) => handleExperienceChange(index, "current", e.target.checked)}
                          className="mr-2"
                        />
                        <Label htmlFor={`current-${index}`} className="text-sm cursor-pointer">
                          {exp.type === "certification" ? "No Expiration" : "Current"}
                        </Label>
                      </div>
                    </div>
                    <div className="relative w-full">
                      <Input
                        id={`endDate-${index}`}
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                        disabled={exp.current}
                        className={`w-full ${errors[`endDate-${index}`] ? "border-red-500" : ""}`}
                      />
                      <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    {errors[`endDate-${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`endDate-${index}`]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                    placeholder={
                      exp.type === "certification"
                        ? "Describe what this certification covers and how it's relevant to your mentoring..."
                        : "Describe your responsibilities, achievements, or what you learned..."
                    }
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="ghost" onClick={onSkip} className="text-slate-600">
          Skip for now
        </Button>
        <Button type="button" onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white">
          Continue
        </Button>
      </div>
    </div>
  )
}
