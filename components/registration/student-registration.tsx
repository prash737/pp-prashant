"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Info, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { registerStudent } from "@/lib/services/auth-service"

interface StudentRegistrationProps {
  onComplete: (isUnder16: boolean) => void
}

// Required field indicator component
const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>

export default function StudentRegistration({ onComplete }: StudentRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUnder16, setIsUnder16] = useState(true)
  const [ageDisplay, setAgeDisplay] = useState<{ years: number; months: number; totalMonths: number } | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthMonth: "",
    birthYear: "",
    parentEmail: "",
    parentName: "",
    agreeTerms: false,
  })
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null)

  // Email validation function
  const validateEmails = (studentEmail: string, parentEmail: string, isUnder16: boolean) => {
    if (isUnder16 && studentEmail && parentEmail) {
      if (studentEmail.toLowerCase() === parentEmail.toLowerCase()) {
        setEmailValidationError("Student and parent/guardian emails cannot be the same")
        return false
      }
    }
    setEmailValidationError(null)
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    }
    setFormData(newFormData)

    // Validate emails when either email field changes
    if (name === 'email' || name === 'parentEmail') {
      const studentEmail = name === 'email' ? value : newFormData.email
      const parentEmail = name === 'parentEmail' ? value : newFormData.parentEmail
      validateEmails(studentEmail, parentEmail, isUnder16)
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Calculate age in years and months whenever birth month or year changes
  useEffect(() => {
    if (formData.birthMonth && formData.birthYear) {
      // Get current date components
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1 // Convert to 1-based month for calculation

      // Get birth date components
      const birthYear = Number.parseInt(formData.birthYear, 10)
      const birthMonth = Number.parseInt(formData.birthMonth, 10) // Already 1-based from form

      // Calculate age
      let years = currentYear - birthYear
      let months = currentMonth - birthMonth

      // Adjust years and months if birth month hasn't occurred yet this year
      if (months < 0) {
        years--
        months += 12
      }

      // Calculate total months
      const totalMonths = years * 12 + months

      // Set state
      setAgeDisplay({ years, months, totalMonths })
      setIsUnder16(totalMonths < 192) // 192 months = 16 years
    } else {
      setAgeDisplay(null)
    }
  }, [formData.birthMonth, formData.birthYear])

  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate emails before proceeding
    if (!validateEmails(formData.email, formData.parentEmail, isUnder16)) {
      setIsLoading(false)
      return
    }

    try {
      const result = await registerStudent({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'student',
        birthMonth: formData.birthMonth,
        birthYear: formData.birthYear,
        parentEmail: isUnder16 ? formData.parentEmail : undefined,
        parentName: isUnder16 ? formData.parentName : undefined
      })

      if (result.success) {
        toast({
          title: "Account created successfully!",
          description: result.needsParentApproval 
            ? `A parent approval email has been sent to ${result.parentEmail}. Please ask your parent to check their email and approve your account before you can login.`
            : "A verification email has been sent to your email address",
        })
        onComplete(isUnder16)
      } else {
        if (result.error === 'Email already exists') {
          setError('This email is already registered. Please use a different email address.')
          const emailInput = document.getElementById('email')
          if (emailInput) emailInput.focus()
        } else if (result.error?.includes('RESEND_API_KEY')) {
          setError('Email service configuration error. Please try again later.')
        } else {
          console.error('Registration error:', result.error)
          setError(result.error || 'Failed to create account. Please try again.')
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error?.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate birth year options (3+ years old)
  const currentYear = new Date().getFullYear()
  const birthYearOptions = []
  for (let i = currentYear - 25; i <= currentYear - 3; i++) {
    birthYearOptions.push(i)
  }

  // Generate month options
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-center">Create Student Account</h2>
      <p className="text-slate-600 mb-6 text-center">Let's get you started on your journey</p>

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
          {error && (
            <div className="text-sm text-red-500 mb-2">
              {error}
            </div>
          )}
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
            <Label htmlFor="birthMonth">
              Birth Month
              <RequiredIndicator />
            </Label>
            <Select
              value={formData.birthMonth}
              onValueChange={(value) => handleSelectChange("birthMonth", value)}
              required
            >
              <SelectTrigger className="rounded-lg border-slate-300">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthYear">
              Birth Year
              <RequiredIndicator />
            </Label>
            <Select
              value={formData.birthYear}
              onValueChange={(value) => handleSelectChange("birthYear", value)}
              required
            >
              <SelectTrigger className="rounded-lg border-slate-300">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {birthYearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {ageDisplay && (
          <div
            className={`p-4 rounded-lg ${isUnder16 ? "bg-blue-50 border border-blue-100" : "bg-green-50 border border-green-100"}`}
          >
            <div className="flex items-start">
              <div className={`mr-3 mt-1 ${isUnder16 ? "text-blue-500" : "text-green-500"}`}>
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="font-semibold text-xl mb-1">
                  Age: <span className="text-2xl">{ageDisplay.years}</span> years and{" "}
                  <span className="text-2xl">{ageDisplay.months}</span> months
                </div>
                {isUnder16 ? (
                  <p className="text-sm text-slate-600">
                    As you are under 16 years old, you'll need parent/guardian consent to create an account. Please
                    provide their email below.
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">
                    You're 16 or older! You can create your account without parent/guardian consent.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {emailValidationError && isUnder16 && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 shadow-sm">
            <div className="flex items-start">
              <div className="mr-3 mt-1 text-red-500">
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="font-semibold text-red-800 mb-1">
                  Email Validation Error
                </div>
                <p className="text-sm text-red-600">
                  {emailValidationError}. Please use different email addresses for student and parent/guardian accounts.
                </p>
              </div>
            </div>
          </div>
        )}

        {isUnder16 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parentName">
                Parent/Guardian Name
                <RequiredIndicator />
              </Label>
              <Input
                id="parentName"
                name="parentName"
                type="text"
                placeholder="Enter parent/guardian full name"
                value={formData.parentName}
                onChange={handleChange}
                required={isUnder16}
                className="rounded-lg border-slate-300"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start">
                <Label htmlFor="parentEmail" className="flex-1">
                  Parent/Guardian Email
                  <RequiredIndicator />
                </Label>
                <div className="group relative">
                  <Info size={16} className="text-slate-400 cursor-help" />
                  <div className="absolute right-0 w-64 p-2 bg-white rounded-lg shadow-lg border border-slate-200 text-xs text-slate-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    We'll send a verification email to your parent/guardian for consent, as required for users under 16.
                  </div>
                </div>
              </div>
              <Input
                id="parentEmail"
                name="parentEmail"
                type="email"
                placeholder="Enter parent/guardian email"
                value={formData.parentEmail}
                onChange={handleChange}
                required={isUnder16}
                className={`rounded-lg ${emailValidationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'}`}
              />
              <p className="text-xs text-slate-500">Required for users under 16 years old</p>
            </div>
          </div>
        )}

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
          <div className="space-y-1">
            <Label htmlFor="agreeTerms" className="text-sm text-slate-600">
              I agree to the{" "}
              <a href="/terms" className="text-teal-500 hover:text-teal-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-teal-500 hover:text-teal-600">
                Privacy Policy
              </a>
              <RequiredIndicator />
            </Label>
            <p className="text-xs text-slate-500">
              By creating an account, you agree to receive emails from PathPiper about your account and updates.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !formData.agreeTerms || (isUnder16 && emailValidationError)}
          className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full py-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </div>
  )
}