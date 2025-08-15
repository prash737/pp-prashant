"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, X, Calendar, Target, Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"
import PipLoader from "@/components/loading/pip-loader"

interface Goal {
  id: number | string
  title: string
  description: string
  category: string
  timeframe: string
}

interface GoalsAspirationsFormProps {
  data: any
  onChange: (sectionId: string, data: Goal[]) => void
}

const GOAL_CATEGORIES = ["Academic", "Career", "Skill Development", "Personal Growth", "Extracurricular", "Other"]
const TIMEFRAMES = ["1 month", "3 months", "6 months", "1 year", "2+ years", "Ongoing"]

export default function GoalsAspirationsForm({ data, onChange }: GoalsAspirationsFormProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newGoal, setNewGoal] = useState<Goal>({
    id: "",
    title: "",
    description: "",
    category: "",
    timeframe: "",
  })

  // Fetch existing goals from database
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/goals', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        })

        if (response.ok) {
          const data = await response.json()
          const existingGoals = data.goals || []
          console.log('📊 Loaded existing goals:', existingGoals)
          setGoals(existingGoals)
        } else {
          console.error('Failed to fetch goals:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching goals:', error)
        toast.error('Failed to load goals')
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [])

  // Pass goals data back to parent component whenever goals change
  useEffect(() => {
    onChange('goals', goals)
  }, [goals, onChange])

  const handleInputChange = (field: keyof Goal, value: string) => {
    if (editingGoal) {
      setEditingGoal(prev => prev ? { ...prev, [field]: value } : null)
    } else {
      setNewGoal(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return

    const goalToAdd = {
      ...newGoal,
      id: -Date.now(), // Use negative number for temporary client-side IDs
    }

    const updatedGoals = [...goals, goalToAdd]
    setGoals(updatedGoals)

    // Auto-save to database
    await saveGoalsToDatabase(updatedGoals)

    setNewGoal({
      id: "",
      title: "",
      description: "",
      category: "",
      timeframe: "",
    })
    setIsAddingGoal(false)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal({ ...goal })
    setIsAddingGoal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingGoal?.title.trim()) return

    const updatedGoals = goals.map(goal => 
      goal.id === editingGoal.id ? editingGoal : goal
    )
    setGoals(updatedGoals)

    // Auto-save to database
    await saveGoalsToDatabase(updatedGoals)

    setEditingGoal(null)
    setIsAddingGoal(false)
  }

  const handleRemoveGoal = async (id: number | string) => {
    const updatedGoals = goals.filter(goal => goal.id !== id)
    setGoals(updatedGoals)

    // Auto-save to database
    await saveGoalsToDatabase(updatedGoals)
  }

  const handleCancel = () => {
    setIsAddingGoal(false)
    setEditingGoal(null)
    setNewGoal({
      id: "",
      title: "",
      description: "",
      category: "",
      timeframe: "",
    })
  }

  const saveGoalsToDatabase = async (goalsToSave: Goal[]) => {
    try {
      setIsSaving(true)
      console.log('💾 Auto-saving goals:', goalsToSave)

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ goals: goalsToSave }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to save goals:', errorData)
        throw new Error(errorData.error || 'Failed to save goals')
      }

      const result = await response.json()
      console.log('✅ Goals auto-saved successfully:', result)

      toast.success('Goal saved successfully!')
    } catch (error) {
      console.error('Error saving goals:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save goal')

      // Revert the goals state on error
      await fetchGoalsFromDatabase()
    } finally {
      setIsSaving(false)
    }
  }

  const fetchGoalsFromDatabase = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        const existingGoals = data.goals || []
        setGoals(existingGoals)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
  }

  const currentGoal = editingGoal || newGoal

  if (loading) {
    return (
      <div className="relative">
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Goals & Aspirations</h3>
            <p className="text-gray-600 dark:text-gray-400">Loading your goals...</p>
          </div>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pathpiper-teal" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <PipLoader 
            isVisible={true} 
            userType="student"
            currentStep="goals"
            onComplete={() => {}}
          />
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
                <Input
                  id="title"
                  value={currentGoal.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Learn Python Programming"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={currentGoal.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your goal in more detail..."
                  className="mt-1 h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Category</Label>
                  <Select
                    value={currentGoal.category}
                    onValueChange={(value) => handleInputChange('category', value)}
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
                    onValueChange={(value) => handleInputChange('timeframe', value)}
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
                  disabled={!currentGoal.title.trim()}
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
                onClick={() => setIsAddingGoal(true)}
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
                onClick={() => setIsAddingGoal(true)}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                Add Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{goal.title}</h4>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
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
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
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
                            <X size={16} />
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
                              onClick={() => handleRemoveGoal(goal.id)}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}