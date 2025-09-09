
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus, Trash2, Trophy, Upload, Image } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { getDefaultIcon, getDefaultIconData } from "@/lib/achievement-icons"

interface Achievement {
  id: number
  name: string
  description: string
  dateOfAchievement: string
  createdAt: string
  achievementTypeId?: number
  achievementImageIcon?: string
}

interface AchievementCategory {
  id: number
  name: string
}

interface AchievementType {
  id: number
  name: string
  categoryId: number
}

interface AchievementsFormProps {
  userId: string
}

export default function AchievementsForm({ userId }: AchievementsFormProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [categories, setCategories] = useState<AchievementCategory[]>([])
  const [types, setTypes] = useState<AchievementType[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dateOfAchievement: '',
    categoryId: '',
    achievementTypeId: '',
    achievementImageIcon: '',
    useDefaultIcon: true
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    dateOfAchievement: '',
    categoryId: '',
    achievementTypeId: '',
    achievementImageIcon: '',
    useDefaultIcon: true
  })

  useEffect(() => {
    fetchAchievements()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (formData.categoryId) {
      fetchTypes(formData.categoryId)
    } else {
      setTypes([])
      setFormData(prev => ({ ...prev, achievementTypeId: '', useDefaultIcon: true, achievementImageIcon: '' }))
    }
  }, [formData.categoryId])

  // Reset to default icon when achievement type changes
  useEffect(() => {
    if (formData.achievementTypeId) {
      setFormData(prev => ({ ...prev, useDefaultIcon: true, achievementImageIcon: '' }))
    }
  }, [formData.achievementTypeId])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAchievements(data.achievements || [])
      } else {
        console.error('Failed to fetch achievements')
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/achievement-categories', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else {
        console.error('Failed to fetch achievement categories')
      }
    } catch (error) {
      console.error('Error fetching achievement categories:', error)
    }
  }

  const fetchTypes = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/achievement-types?categoryId=${categoryId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTypes(data.types || [])
      } else {
        console.error('Failed to fetch achievement types')
      }
    } catch (error) {
      console.error('Error fetching achievement types:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/upload/achievement-icon', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, achievementImageIcon: data.url, useDefaultIcon: false }))
        toast.success('Image uploaded successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.dateOfAchievement || !formData.achievementTypeId) {
      toast.error('Name, description, date, and achievement type are required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          dateOfAchievement: formData.dateOfAchievement,
          achievementTypeId: formData.achievementTypeId,
          achievementImageIcon: formData.useDefaultIcon ? null : formData.achievementImageIcon
        })
      })

      if (response.ok) {
        toast.success('Achievement added successfully!')
        setFormData({ 
          name: '', 
          description: '', 
          dateOfAchievement: '', 
          categoryId: '', 
          achievementTypeId: '', 
          achievementImageIcon: '',
          useDefaultIcon: true
        })
        setShowAddForm(false)
        await fetchAchievements()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add achievement')
      }
    } catch (error) {
      console.error('Error adding achievement:', error)
      toast.error('Failed to add achievement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (achievementId: number) => {
    if (!confirm('Are you sure you want to delete this achievement?')) {
      return
    }

    try {
      const response = await fetch(`/api/achievements?id=${achievementId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Achievement deleted successfully!')
        await fetchAchievements()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete achievement')
      }
    } catch (error) {
      console.error('Error deleting achievement:', error)
      toast.error('Failed to delete achievement')
    }
  }

  const handleEdit = async (achievement: Achievement) => {
    setEditingId(achievement.id)
    
    // Format the date to ensure it has day as 01
    const originalDate = new Date(achievement.dateOfAchievement)
    const formattedDate = `${originalDate.getFullYear()}-${String(originalDate.getMonth() + 1).padStart(2, '0')}-01`
    
    // Set the edit form data immediately with available data
    setEditFormData({
      name: achievement.name,
      description: achievement.description,
      dateOfAchievement: formattedDate,
      categoryId: '', // Will be set after fetching
      achievementTypeId: achievement.achievementTypeId?.toString() || '',
      achievementImageIcon: achievement.achievementImageIcon || '',
      useDefaultIcon: !achievement.achievementImageIcon
    })
    
    // Get the category ID for this achievement type asynchronously
    const categoryId = await getCategoryIdFromTypeId(achievement.achievementTypeId)
    
    // Update the form data with the category ID
    setEditFormData(prev => ({
      ...prev,
      categoryId: categoryId
    }))
    
    // Fetch types for the category if we have one
    if (categoryId) {
      await fetchTypes(categoryId)
    }
  }

  const getCategoryIdFromTypeId = async (typeId?: number): Promise<string> => {
    if (!typeId) return ''
    
    // First check if we already have the type in our current types array
    const existingType = types.find(t => t.id === typeId)
    if (existingType) {
      return existingType.categoryId.toString()
    }
    
    // If not found, we need to fetch it from the API
    try {
      // Get all categories first to find which one contains this type
      for (const category of categories) {
        const response = await fetch(`/api/achievement-types?categoryId=${category.id}`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          const foundType = data.types?.find((t: AchievementType) => t.id === typeId)
          if (foundType) {
            return category.id.toString()
          }
        }
      }
    } catch (error) {
      console.error('Error finding category for type:', error)
    }
    
    return ''
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditFormData({
      name: '',
      description: '',
      dateOfAchievement: '',
      categoryId: '',
      achievementTypeId: '',
      achievementImageIcon: '',
      useDefaultIcon: true
    })
  }

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/upload/achievement-icon', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setEditFormData(prev => ({ ...prev, achievementImageIcon: data.url, useDefaultIcon: false }))
        toast.success('Image uploaded successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleUpdate = async () => {
    if (!editFormData.name.trim() || !editFormData.description.trim() || !editFormData.dateOfAchievement || !editFormData.achievementTypeId) {
      toast.error('Name, description, date, and achievement type are required')
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/achievements?id=${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editFormData.name,
          description: editFormData.description,
          dateOfAchievement: editFormData.dateOfAchievement,
          achievementTypeId: editFormData.achievementTypeId,
          achievementImageIcon: editFormData.useDefaultIcon ? null : editFormData.achievementImageIcon
        })
      })

      if (response.ok) {
        toast.success('Achievement updated successfully!')
        setEditingId(null)
        setEditFormData({ 
          name: '', 
          description: '', 
          dateOfAchievement: '', 
          categoryId: '', 
          achievementTypeId: '', 
          achievementImageIcon: '',
          useDefaultIcon: true
        })
        await fetchAchievements()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update achievement')
      }
    } catch (error) {
      console.error('Error updating achievement:', error)
      toast.error('Failed to update achievement')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Achievements</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Achievements</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showcase your accomplishments and milestones
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Achievement
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Achievement</CardTitle>
            <CardDescription>
              Add a new achievement to your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Achievement Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., First Place in Science Fair"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your achievement..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value, achievementTypeId: '' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Achievement Type *</Label>
                  <Select
                    value={formData.achievementTypeId}
                    onValueChange={(value) => setFormData({ ...formData, achievementTypeId: value })}
                    disabled={!formData.categoryId}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={formData.categoryId ? "Select achievement type" : "Select category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dateOfAchievement">Date of Achievement *</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Select
                    value={formData.dateOfAchievement ? new Date(formData.dateOfAchievement).getMonth().toString() : ''}
                    onValueChange={(value) => {
                      const currentDate = new Date()
                      const currentYear = currentDate.getFullYear()
                      const currentMonth = currentDate.getMonth()
                      const selectedYear = formData.dateOfAchievement ? new Date(formData.dateOfAchievement).getFullYear() : currentYear
                      
                      let selectedMonth = parseInt(value)
                      
                      // If current year and trying to select future month, reset to current month
                      if (selectedYear === currentYear && selectedMonth > currentMonth) {
                        selectedMonth = currentMonth
                      }
                      
                      const newDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
                      setFormData({ ...formData, dateOfAchievement: newDate })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"].map((month, index) => {
                        const currentDate = new Date()
                        const currentYear = currentDate.getFullYear()
                        const currentMonth = currentDate.getMonth()
                        const selectedYear = formData.dateOfAchievement ? new Date(formData.dateOfAchievement).getFullYear() : currentYear
                        
                        // Disable future months in current year
                        const isDisabled = selectedYear === currentYear && index > currentMonth
                        
                        return (
                          <SelectItem key={index} value={index.toString()} disabled={isDisabled}>
                            {month}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.dateOfAchievement ? new Date(formData.dateOfAchievement).getFullYear().toString() : ''}
                    onValueChange={(value) => {
                      const currentDate = new Date()
                      const currentMonth = currentDate.getMonth()
                      const selectedMonth = formData.dateOfAchievement ? new Date(formData.dateOfAchievement).getMonth() : currentMonth
                      
                      let finalMonth = selectedMonth
                      
                      // If switching to current year and selected month is in future, reset to current month
                      if (parseInt(value) === currentDate.getFullYear() && selectedMonth > currentMonth) {
                        finalMonth = currentMonth
                      }
                      
                      const newDate = `${value}-${String(finalMonth + 1).padStart(2, '0')}-01`
                      setFormData({ ...formData, dateOfAchievement: newDate })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Achievement Icon</Label>
                
                {/* Default Icon Preview */}
                {formData.achievementTypeId && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                         style={{
                           background: `linear-gradient(135deg, ${getDefaultIconData(parseInt(formData.achievementTypeId)).color}20, ${getDefaultIconData(parseInt(formData.achievementTypeId)).color}40)`,
                           border: `2px solid ${getDefaultIconData(parseInt(formData.achievementTypeId)).color}30`,
                           boxShadow: `0 2px 8px ${getDefaultIconData(parseInt(formData.achievementTypeId)).color}20`
                         }}>
                      {getDefaultIcon(parseInt(formData.achievementTypeId))}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Default Icon</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        If you don't upload any image, this icon will be used as the default icon for this achievement
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom Icon Upload */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Input
                      id="achievementImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('achievementImage')?.click()}
                      disabled={uploadingImage}
                      className="flex items-center gap-2"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pathpiper-teal"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Custom Icon
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {!formData.useDefaultIcon && formData.achievementImageIcon && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={formData.achievementImageIcon} 
                        alt="Achievement icon preview" 
                        className="h-8 w-8 object-cover rounded border"
                      />
                      <span className="text-sm text-green-600 font-medium">Custom Icon Uploaded</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.achievementTypeId 
                    ? "Upload your own custom icon (JPG, PNG up to 5MB) or leave blank to use the default icon" 
                    : "Select an achievement type first to see the default icon"}
                </p>
              </div>

              <div className="flex gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Achievement'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {achievements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No achievements added yet
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start showcasing your accomplishments by adding your first achievement.
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Achievement
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          achievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardContent className="pt-6">
                {editingId === achievement.id ? (
                  // Edit form
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor={`edit-name-${achievement.id}`}>Achievement Name *</Label>
                      <Input
                        id={`edit-name-${achievement.id}`}
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        placeholder="e.g., First Place in Science Fair"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor={`edit-description-${achievement.id}`}>Description *</Label>
                      <Textarea
                        id={`edit-description-${achievement.id}`}
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        placeholder="Describe your achievement..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-category-${achievement.id}`}>Category *</Label>
                        <Select
                          value={editFormData.categoryId}
                          onValueChange={(value) => {
                            setEditFormData({ ...editFormData, categoryId: value, achievementTypeId: '' })
                            fetchTypes(value)
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`edit-type-${achievement.id}`}>Achievement Type *</Label>
                        <Select
                          value={editFormData.achievementTypeId}
                          onValueChange={(value) => setEditFormData({ ...editFormData, achievementTypeId: value })}
                          disabled={!editFormData.categoryId}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={editFormData.categoryId ? "Select achievement type" : "Select category first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {types.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`edit-date-${achievement.id}`}>Date of Achievement *</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Select
                          value={editFormData.dateOfAchievement ? new Date(editFormData.dateOfAchievement).getMonth().toString() : ''}
                          onValueChange={(value) => {
                            const currentDate = new Date()
                            const currentYear = currentDate.getFullYear()
                            const currentMonth = currentDate.getMonth()
                            const selectedYear = editFormData.dateOfAchievement ? new Date(editFormData.dateOfAchievement).getFullYear() : currentYear
                            
                            let selectedMonth = parseInt(value)
                            
                            // If current year and trying to select future month, reset to current month
                            if (selectedYear === currentYear && selectedMonth > currentMonth) {
                              selectedMonth = currentMonth
                            }
                            
                            const newDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
                            setEditFormData({ ...editFormData, dateOfAchievement: newDate })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {["January", "February", "March", "April", "May", "June", 
                              "July", "August", "September", "October", "November", "December"].map((month, index) => {
                              const currentDate = new Date()
                              const currentYear = currentDate.getFullYear()
                              const currentMonth = currentDate.getMonth()
                              const selectedYear = editFormData.dateOfAchievement ? new Date(editFormData.dateOfAchievement).getFullYear() : currentYear
                              
                              // Disable future months in current year
                              const isDisabled = selectedYear === currentYear && index > currentMonth
                              
                              return (
                                <SelectItem key={index} value={index.toString()} disabled={isDisabled}>
                                  {month}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <Select
                          value={editFormData.dateOfAchievement ? new Date(editFormData.dateOfAchievement).getFullYear().toString() : ''}
                          onValueChange={(value) => {
                            const currentDate = new Date()
                            const currentMonth = currentDate.getMonth()
                            const selectedMonth = editFormData.dateOfAchievement ? new Date(editFormData.dateOfAchievement).getMonth() : currentMonth
                            
                            let finalMonth = selectedMonth
                            
                            // If switching to current year and selected month is in future, reset to current month
                            if (parseInt(value) === currentDate.getFullYear() && selectedMonth > currentMonth) {
                              finalMonth = currentMonth
                            }
                            
                            const newDate = `${value}-${String(finalMonth + 1).padStart(2, '0')}-01`
                            setEditFormData({ ...editFormData, dateOfAchievement: newDate })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Achievement Icon</Label>
                      
                      {/* Default Icon Preview */}
                      {editFormData.achievementTypeId && (
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                               style={{
                                 background: `linear-gradient(135deg, ${getDefaultIconData(parseInt(editFormData.achievementTypeId)).color}20, ${getDefaultIconData(parseInt(editFormData.achievementTypeId)).color}40)`,
                                 border: `2px solid ${getDefaultIconData(parseInt(editFormData.achievementTypeId)).color}30`,
                                 boxShadow: `0 2px 8px ${getDefaultIconData(parseInt(editFormData.achievementTypeId)).color}20`
                               }}>
                            {getDefaultIcon(parseInt(editFormData.achievementTypeId))}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Default Icon</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              If you don't upload any image, this icon will be used as the default icon for this achievement
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Custom Icon Upload */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Input
                            id={`edit-image-${achievement.id}`}
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById(`edit-image-${achievement.id}`)?.click()}
                            disabled={uploadingImage}
                            className="flex items-center gap-2"
                          >
                            {uploadingImage ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pathpiper-teal"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                Upload Custom Icon
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {!editFormData.useDefaultIcon && editFormData.achievementImageIcon && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={editFormData.achievementImageIcon} 
                              alt="Achievement icon preview" 
                              className="h-8 w-8 object-cover rounded border"
                            />
                            <span className="text-sm text-green-600 font-medium">Custom Icon Uploaded</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Upload your own custom icon (JPG, PNG up to 5MB) or leave blank to use the default icon</p>
                    </div>

                    <div className="flex gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button onClick={handleUpdate} disabled={isUpdating}>
                        {isUpdating ? 'Updating...' : 'Confirm Update'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Display view
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {achievement.achievementImageIcon ? (
                          <img 
                            src={achievement.achievementImageIcon} 
                            alt={achievement.name}
                            className="h-6 w-6 object-cover rounded-full"
                          />
                        ) : achievement.achievementTypeId ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                               style={{
                                 background: `linear-gradient(135deg, ${getDefaultIconData(achievement.achievementTypeId).color}20, ${getDefaultIconData(achievement.achievementTypeId).color}40)`,
                                 border: `1px solid ${getDefaultIconData(achievement.achievementTypeId).color}30`,
                                 boxShadow: `0 1px 4px ${getDefaultIconData(achievement.achievementTypeId).color}20`
                               }}>
                            {getDefaultIcon(achievement.achievementTypeId)}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-pathpiper-teal/20 border border-pathpiper-teal/30 flex items-center justify-center">
                            <Trophy className="h-3 w-3 text-pathpiper-teal" />
                          </div>
                        )}
                        <h4 className="text-lg font-semibold">{achievement.name}</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {format(new Date(achievement.dateOfAchievement), 'MMMM yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(achievement)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(achievement.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
