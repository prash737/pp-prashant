"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AvailabilityStepProps {
  initialData: {
    hoursPerWeek: number
    preferredTimes: string[]
    menteeCount: number
  }
  onComplete: (data: any) => void
  onNext: () => void
  onSkip: () => void
}

const WEEKDAY_TIME_SLOTS = [
  { id: "morning-weekday", label: "Weekday Mornings (8:00 AM - 12:00 PM)" },
  { id: "afternoon-weekday", label: "Weekday Afternoons (12:00 PM - 5:00 PM)" },
  { id: "evening-weekday", label: "Weekday Evenings (5:00 PM - 10:00 PM)" },
]

const WEEKEND_TIME_SLOTS = [
  { id: "morning-weekend", label: "Weekend Mornings (8:00 AM - 12:00 PM)" },
  { id: "afternoon-weekend", label: "Weekend Afternoons (12:00 PM - 5:00 PM)" },
  { id: "evening-weekend", label: "Weekend Evenings (5:00 PM - 10:00 PM)" },
]

const MENTEE_OPTIONS = [
  { value: 1, label: "1 mentee at a time" },
  { value: 3, label: "Up to 3 mentees" },
  { value: 5, label: "Up to 5 mentees" },
  { value: 10, label: "Up to 10 mentees" },
  { value: 0, label: "No limit" },
]

export default function MentorAvailabilityStep({ initialData, onComplete, onNext, onSkip }: AvailabilityStepProps) {
  const [hoursPerWeek, setHoursPerWeek] = useState(initialData.hoursPerWeek || 5)
  const [preferredTimes, setPreferredTimes] = useState<string[]>(initialData.preferredTimes || [])
  const [menteeCount, setMenteeCount] = useState<number>(initialData.menteeCount || 1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleTimeSlotChange = (timeSlot: string) => {
    setPreferredTimes((prev) =>
      prev.includes(timeSlot) ? prev.filter((item) => item !== timeSlot) : [...prev, timeSlot],
    )

    // Clear error if at least one time slot is selected
    if (errors.preferredTimes) {
      const newErrors = { ...errors }
      delete newErrors.preferredTimes
      setErrors(newErrors)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    if (preferredTimes.length === 0) {
      newErrors.preferredTimes = "Please select at least one preferred time slot"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({
        hoursPerWeek,
        preferredTimes,
        menteeCount,
      })
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Your Availability</h2>
        <p className="text-slate-600 mt-2">
          Let students know when you're available to mentor and how many mentees you can take on.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <Label className="text-base font-medium">Hours per week</Label>
          <p className="text-sm text-slate-500">How many hours can you dedicate to mentoring each week?</p>

          <div className="space-y-6">
            <Slider
              value={[hoursPerWeek]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => setHoursPerWeek(value[0])}
              className="w-full max-w-md"
            />
            <div className="flex justify-between items-center max-w-md">
              <span className="text-sm text-slate-500">1 hour</span>
              <span className="text-lg font-medium text-orange-600">{hoursPerWeek} hours</span>
              <span className="text-sm text-slate-500">20 hours</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Preferred time slots</Label>
            <p className="text-sm text-slate-500 mb-4">When are you typically available for mentoring sessions?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekday Column */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-slate-700">Weekdays</h4>
                {WEEKDAY_TIME_SLOTS.map((slot) => (
                  <div key={slot.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={slot.id}
                      checked={preferredTimes.includes(slot.id)}
                      onCheckedChange={() => handleTimeSlotChange(slot.id)}
                      className="mt-1 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={slot.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {slot.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekend Column */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-slate-700">Weekends</h4>
                {WEEKEND_TIME_SLOTS.map((slot) => (
                  <div key={slot.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={slot.id}
                      checked={preferredTimes.includes(slot.id)}
                      onCheckedChange={() => handleTimeSlotChange(slot.id)}
                      className="mt-1 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={slot.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {slot.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {errors.preferredTimes && <p className="text-red-500 text-sm mt-2">{errors.preferredTimes}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Number of mentees</Label>
          <p className="text-sm text-slate-500 mb-4">How many mentees are you willing to work with simultaneously?</p>

          <RadioGroup
            value={menteeCount.toString()}
            onValueChange={(value) => setMenteeCount(Number.parseInt(value))}
            className="space-y-3"
          >
            {MENTEE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value.toString()}
                  id={`mentee-${option.value}`}
                  className="text-orange-500 border-slate-300"
                />
                <Label htmlFor={`mentee-${option.value}`} className="text-sm font-medium">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
