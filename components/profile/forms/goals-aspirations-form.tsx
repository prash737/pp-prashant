"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, X, Calendar, Target, Edit, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

interface Goal {
  id: number | string
  title: string
  description: string
  category: string
  timeframe: string
  isSuggested?: boolean
  createdAt?: string
  created_at?: string
}

interface GoalsAspirationsFormProps {
  data: any
  onChange: (sectionId: string, data: Goal[]) => void
}

const GOAL_CATEGORIES = ["Academic", "Career", "Skill Development", "Personal Growth", "Extracurricular", "Other"]
const TIMEFRAMES = ["1 month", "3 months", "6 months", "1 year", "2+ years", "Ongoing"]

export default function GoalsAspirationsForm({ data, onChange }: GoalsAspirationsFormProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [originalGoals, setOriginalGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const newGoal: Goal = {
    id: "",
    title: "",
    description: "",
    category: "",
    timeframe: "",
  }

  // Fetch existing goals from database
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Fetch both regular goals and suggested goals
        const [goalsResponse, suggestedGoalsResponse] = await Promise.all([
          fetch('/api/goals'),
          fetch('/api/suggested-goals')
        ])

        let allGoals = []

        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json()
          const regularGoals = (goalsData.goals || []).filter(goal => !goal.isSuggested)
          allGoals = [...allGoals, ...regularGoals]
        } else {
          console.error('Failed to fetch regular goals:', await goalsResponse.text())
        }

        if (suggestedGoalsResponse.ok) {
          const suggestedData = await suggestedGoalsResponse.json()
          const suggestedGoals = (suggestedData.suggestedGoals || [])
            .filter(goal => goal.isAdded === true) // Only show suggested goals that are added
            .map(goal => ({
              ...goal,
              isSuggested: true,
              id: goal.id || goal.created_at || String(Date.now() + Math.random()), // Ensure a unique ID
              // suggested goals don't have completed status or timeframe/category set initially
            }))
          allGoals = [...allGoals, ...suggestedGoals]
        } else {
          console.error('Failed to fetch suggested goals:', await suggestedGoalsResponse.text())
        }

        // Sort by creation date (newest first)
        allGoals.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0)
          const dateB = new Date(b.createdAt || b.created_at || 0)
          return dateB.getTime() - dateA.getTime()
        })

        setGoals(allGoals)
        setOriginalGoals([...allGoals])
      } catch (error) {
        console.error('Error fetching goals:', error)
        toast.error('Failed to load goals')
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [user?.id, toast])

  // Pass goals data back to parent component whenever goals change
  useEffect(() => {
    if (!loading) {
      onChange('goals', goals)
    }
  }, [goals, onChange, loading])

  const updateGoal = (index: number, field: keyof Goal, value: string) => {
    const updatedGoals = [...goals]
    updatedGoals[index] = { ...updatedGoals[index], [field]: value }
    setGoals(updatedGoals)
    setHasChanges(true)
  }

  const removeGoal = async (index: number) => {
    const goalToRemove = goals[index]
    const updatedGoals = goals.filter((_, i) => i !== index)
    setGoals(updatedGoals)
    setHasChanges(true)

    // Optimistic UI update, revert if API call fails
    try {
      let response
      if (goalToRemove.isSuggested) {
        if (typeof goalToRemove.id === 'number' && goalToRemove.id > 0) {
          response = await fetch(`/api/suggested-goals/${goalToRemove.id}`, { method: 'DELETE', credentials: 'include' })
        } else {
          // If it's a locally added suggested goal, just remove it from state
          toast.success('Suggested goal removed.')
          return
        }
      } else {
        if (typeof goalToRemove.id === 'number' && goalToRemove.id > 0) {
          response = await fetch(`/api/goals/${goalToRemove.id}`, { method: 'DELETE', credentials: 'include' })
        } else {
          // If it's a locally added regular goal, just remove it from state
          toast.success('Goal removed.')
          return
        }
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete ${goalToRemove.isSuggested ? 'suggested goal' : 'goal'}`)
      }
      toast.success(`${goalToRemove.isSuggested ? 'Suggested goal' : 'Goal'} removed successfully!`)
    } catch (error) {
      console.error('Error removing goal:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove goal')
      // Revert state if deletion failed
      setGoals([...goals, goalToRemove])
    }
  }

  const handleAddGoal = () => {
    const goalToAdd: Goal = {
      ...newGoal,
      id: `temp-${Date.now()}`, // Temporary ID for new goals
      isSuggested: false, // Default to not suggested
    }
    setGoals([goalToAdd, ...goals])
    setEditingGoal(goalToAdd)
    setIsAddingGoal(true)
    setHasChanges(true)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setIsAddingGoal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingGoal) return

    if (!editingGoal.title.trim()) {
      toast.error("Goal title cannot be empty.")
      return
    }

    const updatedGoals = goals.map(goal =>
      goal.id === editingGoal.id ? editingGoal : goal
    )
    setGoals(updatedGoals)
    setEditingGoal(null)
    setIsAddingGoal(false)
    setHasChanges(true)
  }

  const handleCancel = () => {
    setIsAddingGoal(false)
    setEditingGoal(null)
    // Optionally revert changes if cancel is clicked on an edit
    // setGoals(originalGoals)
    // setHasChanges(false)
  }

  const handleSave = async () => {
    if (!user?.id) return

    try {
      setIsSaving(true)

      // Separate regular goals and suggested goals
      const regularGoals = goals.filter(goal => !goal.isSuggested)
      const suggestedGoalsList = goals.filter(goal => goal.isSuggested)

      let regularGoalsResult = null
      let suggestedGoalsResult = null

      // Save regular goals if any
      if (regularGoals.length > 0) {
        const regularGoalsResponse = await fetch('/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ goals: regularGoals }),
        })

        if (regularGoalsResponse.ok) {
          regularGoalsResult = await regularGoalsResponse.json()
        } else {
          const error = await regularGoalsResponse.json()
          throw new Error(error.error || 'Failed to save regular goals')
        }
      }

      // Save suggested goals if any
      if (suggestedGoalsList.length > 0) {
        const suggestedGoalsResponse = await fetch('/api/suggested-goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ suggestedGoals: suggestedGoalsList }),
        })

        if (suggestedGoalsResponse.ok) {
          suggestedGoalsResult = await suggestedGoalsResponse.json()
        } else {
          const error = await suggestedGoalsResponse.json()
          throw new Error(error.error || 'Failed to save suggested goals')
        }
      }

      const totalOperations = (regularGoalsResult?.operations || 0) + (suggestedGoalsResult?.operations || 0)

      toast.success(`Goals updated successfully. ${totalOperations} changes made.`)

      setHasChanges(false)
      setOriginalGoals([...goals]) // Update original goals after successful save

    } catch (error) {
      console.error('Error saving goals:', error)
      toast.error(error instanceof Error ? error.message : "Failed to save goals")
    } finally {
      setIsSaving(false)
    }
  }

  const currentGoal = editingGoal || newGoal

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Goals & Aspirations</h3>
          <p className="text-gray-600 dark:text-gray-400">Loading your goals...</p>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-pathpiper-teal" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Goals & Aspirations</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Share your goals to help mentors understand what you're working towards and how they can support you
        </p>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-pathpiper-teal mt-2">
            <Loader2 size={14} className="animate-spin" />
            Saving...
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Add/Edit Goal Form */}
        {isAddingGoal && (
          <div className="border border-pathpiper-teal/20 rounded-lg p-6 bg-pathpiper-teal/5">
            <h4 className="font-medium text-pathpiper-teal mb-4">
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                  Goal Title <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="title"
                    value={currentGoal.title}
                    onChange={(e) => {
                      if (editingGoal) {
                        setEditingGoal({ ...editingGoal, title: e.target.value })
                      } else {
                        setNewGoal({ ...newGoal, title: e.target.value })
                      }
                    }}
                    placeholder="e.g., Learn Python Programming"
                    className="mt-1"
                  />
                  {editingGoal && editingGoal.isSuggested && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      AI Suggested
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={currentGoal.description}
                  onChange={(e) => {
                    if (editingGoal) {
                      setEditingGoal({ ...editingGoal, description: e.target.value })
                    } else {
                      setNewGoal({ ...newGoal, description: e.target.value })
                    }
                  }}
                  placeholder="Describe your goal in more detail..."
                  className="mt-1 h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Category</Label>
                  <Select
                    value={currentGoal.category}
                    onValueChange={(value) => {
                      if (editingGoal) {
                        setEditingGoal({ ...editingGoal, category: value })
                      } else {
                        setNewGoal({ ...newGoal, category: value })
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
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
                  <Label className="text-gray-700 dark:text-gray-300">Timeframe</Label>
                  <Select
                    value={currentGoal.timeframe}
                    onValueChange={(value) => {
                      if (editingGoal) {
                        setEditingGoal({ ...editingGoal, timeframe: value })
                      } else {
                        setNewGoal({ ...newGoal, timeframe: value })
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
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

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={editingGoal ? handleSaveEdit : handleAddGoal}
                  disabled={!currentGoal.title.trim() || isSaving}
                  className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                >
                  {editingGoal ? 'Save Changes' : 'Add Goal'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-lg font-medium">Your Goals ({goals.length})</Label>
            {!isAddingGoal && (
              <Button
                type="button"
                onClick={handleAddGoal}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                <Plus size={16} className="mr-2" />
                Add Goal
              </Button>
            )}
          </div>

          {goals.length === 0 && !isAddingGoal ? (
            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No goals added yet</h3>
              <p className="text-gray-500 mb-4">
                Adding goals helps mentors understand your aspirations and provide better guidance
              </p>
              <Button
                type="button"
                onClick={handleAddGoal}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                Add Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <Card key={goal.id || index} className={`p-4 ${goal.isSuggested ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : ''}`}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Goal title"
                            value={goal.title}
                            onChange={(e) => updateGoal(index, 'title', e.target.value)}
                            className="font-semibold"
                          />
                          {goal.isSuggested && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              AI Suggested
                            </Badge>
                          )}
                        </div>
                        <Textarea
                          placeholder="Describe your goal in detail..."
                          value={goal.description || ''}
                          onChange={(e) => updateGoal(index, 'description', e.target.value)}
                          className="resize-none"
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGoal(goal)}
                          className="text-gray-400 hover:text-pathpiper-teal"
                        >
                          <Edit size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeGoal(index)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {hasChanges && !isSaving && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={handleSave}
              className="bg-pathpiper-teal hover:bg-pathpiper-teal/90 shadow-lg"
            >
              Save All Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}