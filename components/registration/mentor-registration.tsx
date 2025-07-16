"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Plus, X } from "lucide-react"

interface MentorRegistrationProps {
  onComplete: () => void
}

// Required field indicator component
const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>

export default function MentorRegistration({ onComplete }: MentorRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [skills, setSkills] = useState<string[]>([])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    profession: "",
    organization: "",
    bio: "",
    agreeTerms: false,
    agreeGuidelines: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onComplete()
    }, 1500)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-center">Become a Mentor</h2>
      <p className="text-slate-600 mb-6 text-center">Share your knowledge and inspire the next generation</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name
              <RequiredIndicator />
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Enter your first name"
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
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="rounded-lg border-slate-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email
            <RequiredIndicator />
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-lg border-slate-300"
          />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profession">
              Profession
              <RequiredIndicator />
            </Label>
            <Input
              id="profession"
              name="profession"
              placeholder="e.g. Software Engineer"
              value={formData.profession}
              onChange={handleChange}
              required
              className="rounded-lg border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              name="organization"
              placeholder="e.g. Google, Stanford University"
              value={formData.organization}
              onChange={handleChange}
              className="rounded-lg border-slate-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">
            Areas of Expertise
            <RequiredIndicator />
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-orange-500 hover:text-orange-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <Input
              id="newSkill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill or area of expertise"
              className="rounded-l-lg border-slate-300"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddSkill()
                }
              }}
            />
            <Button type="button" onClick={handleAddSkill} className="rounded-r-lg bg-orange-500 hover:bg-orange-600">
              <Plus size={18} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">
            Short Bio
            <RequiredIndicator />
          </Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell students a bit about yourself and your experience"
            value={formData.bio}
            onChange={handleChange}
            required
            className="rounded-lg border-slate-300 min-h-[100px]"
          />
          <p className="text-xs text-slate-500">This will be visible on your mentor profile</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeGuidelines"
              name="agreeGuidelines"
              checked={formData.agreeGuidelines}
              onCheckedChange={(checked) => {
                setFormData({
                  ...formData,
                  agreeGuidelines: checked as boolean,
                })
              }}
              required
              className="mt-1 border-slate-300"
            />
            <div>
              <Label htmlFor="agreeGuidelines" className="text-sm text-slate-600">
                I agree to follow the{" "}
                <a href="/mentor-guidelines" className="text-orange-500 hover:text-orange-600">
                  Mentor Guidelines
                </a>
                <RequiredIndicator />
              </Label>
              <p className="text-xs text-slate-500">
                Including appropriate communication with students and maintaining a professional relationship
              </p>
            </div>
          </div>

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
                <a href="/terms" className="text-orange-500 hover:text-orange-600">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-orange-500 hover:text-orange-600">
                  Privacy Policy
                </a>
                <RequiredIndicator />
              </Label>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !formData.agreeTerms || !formData.agreeGuidelines}
          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-full py-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating Account...
            </div>
          ) : (
            "Become a Mentor"
          )}
        </Button>
      </form>
    </div>
  )
}
