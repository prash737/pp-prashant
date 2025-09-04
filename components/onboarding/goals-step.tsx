"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Calendar, Target } from "lucide-react"

interface Goal {
  id: number | string // Allow both for client-side temporary IDs
  title: string
  description: string
  category: string
  timeframe: string
}

interface GoalsStepProps {
  initialData: Goal[]
  onComplete: (data: Goal[]) => void
  onNext: () => void
  onSkip: () => void
  userId?: string
}

// Sample goal categories
const GOAL_CATEGORIES = ["Academic", "Career", "Skill Development", "Personal Growth", "Extracurricular", "Other"]

// Sample timeframes
const TIMEFRAMES = ["1 month", "3 months", "6 months", "1 year", "2+ years", "Ongoing"]

export default function GoalsStep({ initialData, onComplete, onNext, onSkip, userId }: GoalsStepProps) {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>(initialData)
  const [originalGoals, setOriginalGoals] = useState<Goal[]>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [newGoal, setNewGoal] = useState<Goal>({
    id: "",
    title: "",
    description: "",
    category: "",
    timeframe: "",
  })
  const [isAddingGoal, setIsAddingGoal] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewGoal((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewGoal((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddGoal = async () => {
    if (newGoal.title.trim() === "") return

    const goalToAdd = {
      ...newGoal,
      id: -Date.now(), // Use negative number for temporary client-side IDs
    }

    const updatedGoals = [...goals, goalToAdd]
    setGoals(updatedGoals)
    setNewGoal({
      id: "",
      title: "",
      description: "",
      category: "",
      timeframe: "",
    })
    setIsAddingGoal(false)

    // Save goals immediately when a new goal is added
    console.log('🎯 Goal added - saving to database immediately:', goalToAdd.title)
    onComplete(updatedGoals)
  }

  // Track dirty state
  useEffect(() => {
    // Compare current goals with original goals
    const goalsChanged = goals.length !== originalGoals.length ||
      goals.some(goal => {
        const originalGoal = originalGoals.find(orig =>
          (typeof orig.id === 'number' && typeof goal.id === 'number' && orig.id === goal.id) ||
          (orig.title === goal.title && orig.description === goal.description)
        )
        return !originalGoal ||
               originalGoal.title !== goal.title ||
               originalGoal.description !== goal.description ||
               originalGoal.category !== goal.category ||
               originalGoal.timeframe !== goal.timeframe
      })

    setIsDirty(goalsChanged)
    console.log("🔍 Goals dirty bit:", goalsChanged)
  }, [goals, originalGoals])

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Update original goals when initial data changes
  useEffect(() => {
    setOriginalGoals(initialData)
    setGoals(initialData)
  }, [initialData])

  const handleRemoveGoal = (id: number | string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("🔍 Goals dirty bit:", isDirty)

    if (isDirty) {
      console.log("💾 Goals have changes, will be saved by parent component...")
      setIsDirty(false)
      setOriginalGoals([...goals])
    } else {
      console.log("✅ Goals unchanged, skipping database save")
    }

    onComplete(goals)
    onNext()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Your Goals</h2>
      <p className="text-slate-600 mb-6">
        Setting clear goals helps us connect you with the right mentors and resources to achieve them
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goals list */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label>Your Goals ({goals.length})</Label>
            {!isAddingGoal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingGoal(true)}
                className="text-teal-500 border-teal-200 hover:bg-teal-50"
              >
                <Plus size={16} className="mr-1" /> Add Goal
              </Button>
            )}
          </div>

          {goals.length === 0 && !isAddingGoal ? (
            <div className="border border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No goals added yet</h3>
              <p className="text-slate-500 mb-4">
                Adding goals helps us personalize your experience and connect you with relevant mentors
              </p>
              <Button
                type="button"
                onClick={() => setIsAddingGoal(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Add Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-slate-800">{goal.title}</h4>
                      <div className="flex items-center text-sm text-slate-500 mt-1 space-x-4">
                        {goal.category && (
                          <span className="flex items-center">
                            <Target size={14} className="mr-1" />
                            {goal.category}
                          </span>
                        )}
                        {goal.timeframe && (
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {goal.timeframe}
                          </span>
                        )}
                      </div>
                      {goal.description && <p className="text-sm text-slate-600 mt-2">{goal.description}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new goal form */}
          {isAddingGoal && (
            <div className="border border-teal-200 rounded-lg p-4 bg-teal-50 mt-4">
              <h4 className="font-medium text-teal-700 mb-4">Add New Goal</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-700">
                    Goal Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={newGoal.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Learn Python Programming"
                    className="mt-1 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newGoal.description}
                    onChange={handleInputChange}
                    placeholder="Describe your goal in more detail"
                    className="mt-1 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-slate-700">
                      Category
                    </Label>
                    <Select value={newGoal.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger className="mt-1 rounded-lg">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeframe" className="text-slate-700">
                      Timeframe
                    </Label>
                    <Select value={newGoal.timeframe} onValueChange={(value) => handleSelectChange("timeframe", value)}>
                      <SelectTrigger className="mt-1 rounded-lg">
                        <SelectValue placeholder="Select a timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEFRAMES.map((timeframe) => (
                          <SelectItem key={timeframe} value={timeframe}>
                            {timeframe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingGoal(false)}
                    className="border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddGoal}
                    disabled={!newGoal.title.trim()}
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                  >
                    Add Goal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              console.log('🔄 Skipping goals step')
              
              // Get user ID from cookie - immediate redirect with no delays
              const cookies = document.cookie.split('; ');
              const userIdCookie = cookies.find(row => row.startsWith('current_user_id='));
              const userId = userIdCookie?.split('=')[1];
              
              if (userId) {
                console.log('🎯 Redirecting to user-specific profile:', `/student/profile/${userId}`)
                window.location.href = `/student/profile/${userId}`;
              } else {
                console.log('❌ No user ID found, redirecting to login')
                window.location.href = '/login';
              }
            }}
            className="flex-1"
          >
            Skip for now
          </Button>
          <Button
            type="button"
            onClick={() => {
              console.log('🎯 Goals step - Continue button clicked')
              
              // Get user ID from cookie - immediate redirect with no delays
              const cookies = document.cookie.split('; ');
              const userIdCookie = cookies.find(row => row.startsWith('current_user_id='));
              const userId = userIdCookie?.split('=')[1];
              
              if (userId) {
                console.log('🎯 Redirecting to user-specific profile:', `/student/profile/${userId}`)
                window.location.href = `/student/profile/${userId}`;
              } else {
                console.log('❌ No user ID found, redirecting to login')
                window.location.href = '/login';
              }
            }}
            className="bg-teal-500 hover:bg-teal-600 text-white flex-1"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}