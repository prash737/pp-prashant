"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

// Predefined subject areas for mentors to select from
const SUBJECT_AREAS = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Literature",
  "History",
  "Geography",
  "Economics",
  "Business",
  "Art",
  "Music",
  "Languages",
  "Psychology",
  "Philosophy",
  "Political Science",
  "Sociology",
  "Environmental Science",
  "Medicine",
]

interface ExpertiseStepProps {
  initialData: any[]
  onComplete: (data: any) => void
  onNext: () => void
  onSkip: () => void
}

export default function MentorExpertiseStep({ initialData, onComplete, onNext, onSkip }: ExpertiseStepProps) {
  const [expertise, setExpertise] = useState<Array<{ subject: string; description: string; yearsExperience: string }>>(
    initialData.length > 0 ? initialData : [{ subject: "", description: "", yearsExperience: "" }],
  )
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [customSubject, setCustomSubject] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddExpertise = () => {
    setExpertise([...expertise, { subject: "", description: "", yearsExperience: "" }])
  }

  const handleRemoveExpertise = (index: number) => {
    const newExpertise = [...expertise]
    newExpertise.splice(index, 1)
    setExpertise(newExpertise)
  }

  const handleExpertiseChange = (index: number, field: string, value: string) => {
    const newExpertise = [...expertise]
    newExpertise[index] = { ...newExpertise[index], [field]: value }
    setExpertise(newExpertise)

    // Clear error for this field if it exists
    if (errors[`${field}-${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`${field}-${index}`]
      setErrors(newErrors)
    }
  }

  const handleSelectSubject = (subject: string) => {
    if (!selectedSubjects.includes(subject)) {
      setSelectedSubjects([...selectedSubjects, subject])
    }
  }

  const handleRemoveSubject = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter((s) => s !== subject))
  }

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects([...selectedSubjects, customSubject.trim()])
      setCustomSubject("")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    expertise.forEach((exp, index) => {
      if (!exp.subject.trim()) {
        newErrors[`subject-${index}`] = "Subject is required"
        isValid = false
      }
      if (!exp.description.trim()) {
        newErrors[`description-${index}`] = "Description is required"
        isValid = false
      }
      if (!exp.yearsExperience.trim()) {
        newErrors[`yearsExperience-${index}`] = "Years of experience is required"
        isValid = false
      } else if (isNaN(Number(exp.yearsExperience)) || Number(exp.yearsExperience) < 0) {
        newErrors[`yearsExperience-${index}`] = "Please enter a valid number"
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(expertise)
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Your Areas of Expertise</h2>
        <p className="text-slate-600 mt-2">
          Share your knowledge areas to help students find the right mentor for their needs.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Subject Areas</Label>
          <p className="text-sm text-slate-500 mb-2">Select or add subjects you can mentor in</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSubjects.map((subject) => (
              <Badge
                key={subject}
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              >
                {subject}
                <button onClick={() => handleRemoveSubject(subject)} className="ml-1 hover:text-orange-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            {SUBJECT_AREAS.filter((subject) => !selectedSubjects.includes(subject)).map((subject) => (
              <Button
                key={subject}
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-slate-700 hover:text-white hover:bg-orange-500 hover:border-orange-500"
                onClick={() => handleSelectSubject(subject)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {subject}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add a custom subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="max-w-xs"
            />
            <Button type="button" variant="outline" onClick={handleAddCustomSubject} disabled={!customSubject.trim()}>
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Expertise Details</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddExpertise}
              className="text-orange-600 border-orange-200 hover:bg-orange-500 hover:text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Another Area
            </Button>
          </div>

          {expertise.map((exp, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <Label className="text-sm font-medium text-slate-700">Expertise Area {index + 1}</Label>
                {expertise.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExpertise(index)}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`subject-${index}`}>Subject</Label>
                  <Input
                    id={`subject-${index}`}
                    value={exp.subject}
                    onChange={(e) => handleExpertiseChange(index, "subject", e.target.value)}
                    placeholder="e.g., Advanced Mathematics"
                    className={errors[`subject-${index}`] ? "border-red-500" : ""}
                  />
                  {errors[`subject-${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`subject-${index}`]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={exp.description}
                    onChange={(e) => handleExpertiseChange(index, "description", e.target.value)}
                    placeholder="Describe your expertise in this area..."
                    className={errors[`description-${index}`] ? "border-red-500" : ""}
                    rows={3}
                  />
                  {errors[`description-${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`description-${index}`]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`years-${index}`}>Years of Experience</Label>
                  <Input
                    id={`years-${index}`}
                    type="number"
                    min="0"
                    value={exp.yearsExperience}
                    onChange={(e) => handleExpertiseChange(index, "yearsExperience", e.target.value)}
                    placeholder="e.g., 5"
                    className={`w-24 ${errors[`yearsExperience-${index}`] ? "border-red-500" : ""}`}
                  />
                  {errors[`yearsExperience-${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`yearsExperience-${index}`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
