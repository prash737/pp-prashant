"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, X, GraduationCap, Edit, Calendar, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getPlaceholdersForType } from "@/data/institution-placeholders"
import { MultiSelect } from "@/components/ui/multi-select"
import { getSubjectSuggestions } from "@/data/subject-suggestions"

interface InstitutionSearchResult {
  id: string
  name: string
  type: string
  typeId: string
  categoryId: string
  categoryName: string
  typeName: string
}

interface EducationEntry {
  id: number | string
  institutionName: string
  institutionCategory: string
  institutionType: string
  institutionTypeName?: string // Add the type name field
  degree?: string
  fieldOfStudy: string
  subjects?: string[]
  startDate: string
  endDate?: string
  isCurrent: boolean
  grade?: string
  description?: string
  institutionId?: string;
  institutionVerified: boolean | null;
}

interface EducationHistoryFormProps {
  data: any
  onChange: (sectionId: string, data: EducationEntry[]) => void
}

interface InstitutionType {
  id: string
  name: string
  slug: string
}

interface InstitutionCategory {
  id: string
  name: string
  slug: string
  types: InstitutionType[]
}

export default function EducationHistoryForm({ data, onChange }: EducationHistoryFormProps) {
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<EducationEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newEntry, setNewEntry] = useState<EducationEntry>({
    id: "",
    institutionName: "",
    institutionCategory: "",
    institutionType: "",
    institutionId: "",
    institutionVerified: null,
    degree: "",
    fieldOfStudy: "",
    subjects: [],
    startDate: "",
    endDate: "",
    isCurrent: true,
    grade: "",
    description: ""
  })
  const [institutionCategories, setInstitutionCategories] = useState<InstitutionCategory[]>([])
  const [institutionSearchResults, setInstitutionSearchResults] = useState<InstitutionSearchResult[]>([])
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false)
  const [institutionSearchLoading, setInstitutionSearchLoading] = useState(false)

  // Fetch existing education history from database
  useEffect(() => {
    const fetchEducationHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/education', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        })

        if (response.ok) {
          const data = await response.json()
          const existingEducation = data.education || []
          console.log('📚 Loaded existing education history:', existingEducation)
          setEducationHistory(existingEducation)
        } else {
          console.error('Failed to fetch education history:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching education history:', error)
        toast.error('Failed to load education history')
      } finally {
        setLoading(false)
      }
    }

    const fetchInstitutionTypes = async () => {
      try {
        const response = await fetch('/api/institution-types')
        const data = await response.json()

        if (data.success) {
          setInstitutionCategories(data.data)
        } else {
          console.error('Failed to fetch institution types:', data.error)
        }
      } catch (error) {
        console.error('Error fetching institution types:', error)
      }
    }

    fetchEducationHistory()
    fetchInstitutionTypes()
  }, [])

  // Debounced search function
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Pass education history data back to parent component whenever it changes
  useEffect(() => {
    onChange('education', educationHistory)
  }, [educationHistory, onChange])

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])
  
  // Search institutions function with debouncing
  const searchInstitutions = async (query: string) => {
    if (query.length < 2) {
      setInstitutionSearchResults([])
      setShowInstitutionDropdown(false)
      return
    }

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(async () => {
      try {
        setInstitutionSearchLoading(true)
        console.log('🔍 Searching institutions for:', query)
        
        const response = await fetch(`/api/institutions/search?q=${encodeURIComponent(query)}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Search results:', data.institutions?.length || 0, 'institutions')
          setInstitutionSearchResults(data.institutions || [])
          setShowInstitutionDropdown(true)
        } else {
          console.error('Failed to search institutions')
          setInstitutionSearchResults([])
          setShowInstitutionDropdown(false)
        }
      } catch (error) {
        console.error('Error searching institutions:', error)
        setInstitutionSearchResults([])
        setShowInstitutionDropdown(false)
      } finally {
        setInstitutionSearchLoading(false)
      }
    }, 300) // 300ms debounce

    setSearchTimeout(newTimeout)
  }

  // Handle institution selection from search results
  const handleInstitutionSelect = async (institution: InstitutionSearchResult) => {
    try {
      const updatedEntry = {
        institutionName: institution.name,
        institutionId: institution.id,
        institutionVerified: true
      }

      // Update state in a single batch
      if (editingEntry) {
        setEditingEntry(prev => prev ? { ...prev, ...updatedEntry } : null)
      } else {
        setNewEntry(prev => ({ ...prev, ...updatedEntry }))
      }

      // Close dropdown and clear results
      setShowInstitutionDropdown(false)
      setInstitutionSearchResults([])
      
      console.log('✅ Institution selected:', institution.name)
    } catch (error) {
      console.error('❌ Error selecting institution:', error)
      toast.error('Failed to select institution')
    }
  }

  const handleInputChange = (field: keyof EducationEntry, value: string | number | boolean | string[]) => {
    if (editingEntry) {
      setEditingEntry(prev => {
        if (!prev) return null
        const updated = { ...prev, [field]: value }
        // Reset institution type if category changes
        if (field === 'institutionCategory') {
          updated.institutionType = ""
        }
        return updated
      })
    } else {
      setNewEntry(prev => {
        const updated = { ...prev, [field]: value }
        // Reset institution type if category changes
        if (field === 'institutionCategory') {
          updated.institutionType = ""
        }
        return updated
      })
    }
  }

  const validateDates = (startDate: string, endDate: string, isCurrent: boolean) => {
    if (!startDate) return true; // If no start date, skip validation
    if (isCurrent || !endDate) return true; // If current or no end date, skip validation

    const start = new Date(startDate);
    const end = new Date(endDate);

    return start <= end;
  };

  const handleAddEntry = async () => {
    if (!newEntry.institutionName.trim() || !newEntry.subjects?.length) return

    // Validate dates
    if (!validateDates(newEntry.startDate, newEntry.endDate || '', newEntry.isCurrent)) {
      toast.error('Start date must be earlier than or equal to end date');
      return;
    }

    const entryToAdd = {
      ...newEntry,
      id: -Date.now(), // Use negative number for temporary client-side IDs
    }

    const updatedEducation = [...educationHistory, entryToAdd]
    setEducationHistory(updatedEducation)

    // Auto-save to database
    await saveEducationToDatabase(updatedEducation)

    // Fetch fresh data from database to ensure UI is in sync
    await fetchEducationFromDatabase()

    setNewEntry({
      id: "",
      institutionName: "",
      institutionCategory: "",
      institutionType: "",
      institutionId: "",
      institutionVerified: null,
      degree: "",
      fieldOfStudy: "",
      subjects: [],
      startDate: "",
      endDate: "",
      isCurrent: true,
      grade: "",
      description: ""
    })
    setIsAddingEntry(false)
  }

  const handleEditEntry = (entry: EducationEntry) => {
    // Find the category for this institution type
    let categoryId = ''

    // Convert institutionType to string for comparison
    const typeIdStr = String(entry.institutionType)

    for (const category of institutionCategories) {
      const type = category.types.find(t => String(t.id) === typeIdStr)
      if (type) {
        categoryId = String(category.id)
        break
      }
    }

    console.log('Editing entry:', entry)
    console.log('Found category ID:', categoryId, 'for type ID:', typeIdStr)
    console.log('Available categories:', institutionCategories.map(cat => ({ id: cat.id, name: cat.name, types: cat.types.map(t => ({ id: t.id, name: t.name })) })))

    setEditingEntry({ 
      ...entry, 
      institutionCategory: categoryId // Set the category so the type dropdown works
    })
    setIsAddingEntry(true)
  }

  const handleSaveEdit = async () => {
    if (!editingEntry?.institutionName.trim() || !editingEntry?.subjects?.length) return

    // Validate dates
    if (!validateDates(editingEntry.startDate, editingEntry.endDate || '', editingEntry.isCurrent)) {
      toast.error('Start date must be earlier than or equal to end date');
      return;
    }

    try {
      setIsSaving(true)
      console.log('📝 Updating education entry:', editingEntry.id, editingEntry)

      // Make PUT request to update specific education entry
      const response = await fetch(`/api/education/${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          institutionName: editingEntry.institutionName,
          institutionType: editingEntry.institutionType,
          institutionId: editingEntry.institutionId,
          institutionVerified: editingEntry.institutionVerified,
          degree: editingEntry.degree,
          fieldOfStudy: editingEntry.fieldOfStudy,
          subjects: editingEntry.subjects,
          startDate: editingEntry.startDate,
          endDate: editingEntry.endDate,
          isCurrent: editingEntry.isCurrent,
          grade: editingEntry.grade,
          description: editingEntry.description
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to update education entry:', errorData)
        throw new Error(errorData.error || 'Failed to update education entry')
      }

      const result = await response.json()
      console.log('✅ Education entry updated successfully:', result)

      toast.success('Education entry updated successfully!')

      // Update local state with the edited entry
      const updatedEducation = educationHistory.map(entry => 
        entry.id === editingEntry.id ? editingEntry : entry
      )
      setEducationHistory(updatedEducation)

      // Fetch fresh data from database to ensure UI is in sync
      await fetchEducationFromDatabase()

      setEditingEntry(null)
      setIsAddingEntry(false)
    } catch (error) {
      console.error('❌ Error updating education entry:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update education entry')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveEntry = async (id: number | string) => {
    try {
      // Only try to delete from database if it's a real ID (not negative temp ID)
      if (typeof id === 'number' && id > 0) {
        const response = await fetch(`/api/education/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete education entry')
        }

        console.log('✅ Education entry deleted from database')
        toast.success('Education entry deleted successfully!')
      } else if (typeof id === 'string' && !id.startsWith('-')) {
        // Handle string IDs (real database entries)
        const response = await fetch(`/api/education/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete education entry')
        }

        console.log('✅ Education entry deleted from database')
        toast.success('Education entry deleted successfully!')
      }

      // Update local state
      const updatedEducation = educationHistory.filter(entry => entry.id !== id)
      setEducationHistory(updatedEducation)

      // Fetch fresh data from database to ensure UI is in sync
      await fetchEducationFromDatabase()
    } catch (error) {
      console.error('❌ Error deleting education entry:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete education entry')
    }
  }

  const handleCancel = () => {
    setIsAddingEntry(false)
    setEditingEntry(null)
    setNewEntry({
      id: "",
      institutionName: "",
      institutionCategory: "",
      institutionType: "",
      institutionId: "",
      institutionVerified: null,
      degree: "",
      fieldOfStudy: "",
      subjects: [],
      startDate: "",
      endDate: "",
      isCurrent: true,
      grade: "",
      description: ""
    })
  }

  const saveEducationToDatabase = async (educationToSave: EducationEntry[]) => {
    try {
      setIsSaving(true)
      console.log('💾 Auto-saving education history:', educationToSave)

      const response = await fetch('/api/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ education: educationToSave }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to save education history:', errorData)
        throw new Error(errorData.error || 'Failed to save education history')
      }

      const result = await response.json()
      console.log('✅ Education history auto-saved successfully:', result)

      toast.success('Education entry saved successfully!')
    } catch (error) {
      console.error('Error saving education history:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save education entry')

      // Revert the education history state on error
      await fetchEducationFromDatabase()
    } finally {
      setIsSaving(false)
    }
  }

  const fetchEducationFromDatabase = async () => {
    try {
      const response = await fetch('/api/education', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        const existingEducation = data.education || []
        setEducationHistory(existingEducation)
      }
    } catch (error) {
      console.error('Error fetching education history:', error)
    }
  }

  const currentEntry = editingEntry || newEntry

  // Get available institution types based on selected category
  const getAvailableTypes = (categoryId: string) => {
    if (!categoryId) return []
    const category = institutionCategories.find(cat => String(cat.id) === String(categoryId))
    return category ? category.types : []
  }

  const getCategoryLabel = (categoryId: string) => {
    if (!categoryId) return ''
    const category = institutionCategories.find(cat => String(cat.id) === String(categoryId))
    return category ? category.name : ''
  }

  // Get type label for display
  const getTypeLabel = (categoryId: string, typeId: string) => {
    const category = institutionCategories.find(cat => cat.id === categoryId)
    if (!category) return typeId
    const type = category.types.find(t => t.id === typeId)
    return type ? type.name : typeId
  }

  // Get dynamic placeholders based on institution type
  const getDynamicPlaceholders = (typeId: string) => {
    if (!typeId) return getPlaceholdersForType('default')

    // Find the type slug from the institutionCategories
    for (const category of institutionCategories) {
      const type = category.types.find(t => t.id === typeId)
      if (type) {
        return getPlaceholdersForType(type.slug)
      }
    }
    return getPlaceholdersForType('default')
  }

  // Get institution type slug for subject suggestions
  const getInstitutionTypeSlug = (typeId: string): string => {
    if (!typeId) return 'default'

    // Find the type slug from the institutionCategories
    for (const category of institutionCategories) {
      const type = category.types.find(t => t.id === typeId)
      if (type) {
        return type.slug
      }
    }
    return 'default'
  }

  const getInstitutionTypeName = (typeId: string): string => {
    if (!typeId) return 'Institution Type'

    // Convert typeId to string if it's a number
    const typeIdStr = String(typeId)

    // Find the type name from the institutionCategories
    for (const category of institutionCategories) {
      const type = category.types.find(t => String(t.id) === typeIdStr)
      if (type) {
        return type.name
      }
    }

    console.log('Type not found for ID:', typeIdStr, 'Available types:', institutionCategories.flatMap(cat => cat.types))
    return 'Institution Type'
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Education History</h3>
          <p className="text-gray-600 dark:text-gray-400">Loading your education history...</p>
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
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Education History</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add your educational background from any type of institution - traditional schools, online platforms, bootcamps, vocational training, and more
        </p>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-pathpiper-teal mt-2">
            <Loader2 size={14} className="animate-spin" />
            Saving...
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Add/Edit Entry Form */}
        {isAddingEntry && (
          <div className="border border-pathpiper-teal/20 rounded-lg p-6 bg-pathpiper-teal/5">
            <h4 className="font-medium text-pathpiper-teal mb-4">
              {editingEntry ? 'Edit Education Entry' : 'Add Education Entry'}
            </h4>
            <div className="space-y-4">
              {/* Step 1: Institution Category and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Institution Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={currentEntry.institutionCategory}
                    onValueChange={(value) => handleInputChange('institutionCategory', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionCategories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the broad category that best describes your institution
                  </p>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Institution Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={String(currentEntry.institutionType)}
                    onValueChange={(value) => handleInputChange('institutionType', value)}
                    disabled={!currentEntry.institutionCategory}
                    key={`${currentEntry.institutionCategory}-${currentEntry.institutionType}`}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue 
                        placeholder={currentEntry.institutionCategory ? "Select specific type" : "Select category first"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTypes(currentEntry.institutionCategory).map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentEntry.institutionCategory 
                      ? `Select the specific type within ${getCategoryLabel(currentEntry.institutionCategory)}`
                      : "Select a category first to see available types"
                    }
                  </p>
                </div>
              </div>

              {/* Step 2: Institution Name */}
              <div className="relative">
                <Label className="text-gray-700 dark:text-gray-300">
                  Institution Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    value={currentEntry.institutionName}
                    onChange={(e) => {
                      const value = e.target.value
                      handleInputChange('institutionName', value)
                      searchInstitutions(value)
                    }}
                    onFocus={() => {
                      if (currentEntry.institutionName.length >= 2) {
                        searchInstitutions(currentEntry.institutionName)
                      }
                    }}
                    onBlur={(e) => {
                      // Only close dropdown if not clicking on a dropdown item
                      const relatedTarget = e.relatedTarget as HTMLElement
                      if (!relatedTarget || !relatedTarget.closest('.institution-dropdown')) {
                        setTimeout(() => setShowInstitutionDropdown(false), 150)
                      }
                    }}
                    placeholder="e.g., Delhi Public School, IIT Delhi, BYJU'S"
                    className="mt-1"
                  />
                  {institutionSearchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Institution Search Dropdown */}
                {showInstitutionDropdown && institutionSearchResults.length > 0 && (
                  <div className="institution-dropdown absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {institutionSearchResults.map((institution) => (
                      <div
                        key={institution.id}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleInstitutionSelect(institution)
                        }}
                        onMouseDown={(e) => {
                          // Prevent input blur when clicking on dropdown
                          e.preventDefault()
                        }}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {institution.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {institution.typeName} • {institution.categoryName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  Start typing to search for your institution or enter a custom name
                </p>
              </div>

              {/* Step 3: Subjects/Courses */}
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Subjects/Courses <span className="text-red-500">*</span>
                </Label>
                <MultiSelect
                  value={currentEntry.subjects || []}
                  onChange={(value) => handleInputChange('subjects', value)}
                  placeholder="Add subjects you studied..."
                  suggestions={getSubjectSuggestions(getInstitutionTypeSlug(currentEntry.institutionType))}
                  className="mt-1"
                  maxItems={20}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add the subjects or courses you studied at this institution
                </p>
              </div>

              {/* Step 4: Degree/Certificate and Grade/Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Degree/Certificate</Label>
                  <Input
                    value={currentEntry.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    placeholder={getDynamicPlaceholders(currentEntry.institutionType).degree}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Grade/Level</Label>
                  <Input
                    value={currentEntry.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    placeholder={getDynamicPlaceholders(currentEntry.institutionType).grade}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Start Date</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Select
                      value={currentEntry.startDate ? new Date(currentEntry.startDate).getMonth().toString() : ''}
                      onValueChange={(value) => {
                        const year = currentEntry.startDate ? new Date(currentEntry.startDate).getFullYear() : new Date().getFullYear()
                        const newDate = `${year}-${String(parseInt(value) + 1).padStart(2, '0')}-01`
                        handleInputChange('startDate', newDate)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"].map((month, index) => {
                          const currentDate = new Date();
                          const currentYear = currentDate.getFullYear();
                          const currentMonth = currentDate.getMonth();
                          const selectedYear = currentEntry.startDate ? new Date(currentEntry.startDate).getFullYear() : currentYear;

                          // Disable future months in current year
                          const isDisabled = selectedYear === currentYear && index > currentMonth;

                          return (
                            <SelectItem key={index} value={index.toString()} disabled={isDisabled}>
                              {month}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Select
                      value={currentEntry.startDate ? new Date(currentEntry.startDate).getFullYear().toString() : ''}
                      onValueChange={(value) => {
                        const month = currentEntry.startDate ? new Date(currentEntry.startDate).getMonth() : 0
                        const newDate = `${value}-${String(month + 1).padStart(2, '0')}-01`
                        handleInputChange('startDate', newDate)
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

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">End Date</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Select
                      value={currentEntry.endDate ? new Date(currentEntry.endDate).getMonth().toString() : ''}
                      onValueChange={(value) => {
                        const year = currentEntry.endDate ? new Date(currentEntry.endDate).getFullYear() : new Date().getFullYear()
                        const newDate = `${year}-${String(parseInt(value) + 1).padStart(2, '0')}-01`
                        handleInputChange('endDate', newDate)
                      }}
                      disabled={currentEntry.isCurrent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"].map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={currentEntry.endDate ? new Date(currentEntry.endDate).getFullYear().toString() : ''}
                      onValueChange={(value) => {
                        const month = currentEntry.endDate ? new Date(currentEntry.endDate).getMonth() : 0
                        const newDate = `${value}-${String(month + 1).padStart(2, '0')}-01`
                        handleInputChange('endDate', newDate)
                      }}
                      disabled={currentEntry.isCurrent}
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
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentEntry.isCurrent}
                  onCheckedChange={(checked) => handleInputChange('isCurrent', checked)}
                />
                <Label className="text-gray-700 dark:text-gray-300">
                  I currently attend this institution
                </Label>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-gray-300">Description (optional)</Label>
                <Textarea
                  value={currentEntry.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Awards, honors, notable achievements, projects completed..."
                  className="mt-1 h-20"
                />
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
                  onClick={editingEntry ? handleSaveEdit : handleAddEntry}
                  disabled={!currentEntry.institutionName.trim() || !currentEntry.subjects?.length}
                  className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                >
                  {editingEntry ? 'Save Changes' : 'Add Entry'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Education History List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-lg font-medium">Education History ({educationHistory.length})</Label>
            {!isAddingEntry && (
              <Button
                type="button"
                onClick={() => setIsAddingEntry(true)}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                <Plus size={16} className="mr-2" />
                Add Education
              </Button>
            )}
          </div>

          {educationHistory.length === 0 && !isAddingEntry ? (
            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No education history added</h3>
              <p className="text-gray-500 mb-4">
                Add your current and past educational experiences from any type of institution
              </p>
              <Button
                type="button"
                onClick={() => setIsAddingEntry(true)}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                Add Your First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {educationHistory.map((entry) => (
                <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">{entry.institutionName}</h4>
                        {entry.isCurrent && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span>{entry.institutionTypeName || getInstitutionTypeName(entry.institutionType)}</span>
                          {entry.degree && <span>• {entry.degree}</span>}
                          {entry.grade && <span>• {entry.grade}</span>}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entry.subjects && entry.subjects.length > 0 ? (
                            entry.subjects.map((subject, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-pathpiper-teal/10 text-pathpiper-teal rounded-full">
                                {subject}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 italic">No subjects specified</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} />
                          <span>
                            {entry.startDate ? new Date(entry.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''} - {entry.isCurrent ? 'Present' : entry.endDate ? new Date(entry.endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                          </span>
                        </div>
                        {entry.description && (
                          <div className="text-green-600 dark:text-green-400 text-sm">
                            {entry.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
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
                            <AlertDialogTitle>Delete Education Entry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{entry.institutionName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveEntry(entry.id)}
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