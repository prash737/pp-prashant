
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, Building } from "lucide-react"
import Image from "next/image"

interface CreateAcademicCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommunityCreated: () => void
}

const colorOptions = [
  { name: 'Blue', value: '#3B82F6', gradient: 'from-blue-400 to-cyan-500' },
  { name: 'Purple', value: '#8B5CF6', gradient: 'from-purple-400 to-indigo-500' },
  { name: 'Green', value: '#10B981', gradient: 'from-green-400 to-emerald-500' },
  { name: 'Orange', value: '#F59E0B', gradient: 'from-amber-400 to-orange-500' },
  { name: 'Red', value: '#EF4444', gradient: 'from-red-400 to-rose-500' },
  { name: 'Teal', value: '#14B8A6', gradient: 'from-teal-400 to-emerald-500' }
]

export default function CreateAcademicCommunityDialog({
  open,
  onOpenChange,
  onCommunityCreated
}: CreateAcademicCommunityDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colorOptions[0].value
  })
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: colorOptions[0].value
    })
    setIconFile(null)
    setIconPreview('')
  }

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setIconFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setIconPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Please select an image file')
      }
    }
  }

  const uploadIcon = async (): Promise<string> => {
    if (!iconFile) return ''

    setUploadingIcon(true)
    try {
      const formData = new FormData()
      formData.append('file', iconFile)

      const response = await fetch('/api/upload/academic-community-icon', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      } else {
        throw new Error('Failed to upload icon')
      }
    } catch (error) {
      console.error('Error uploading icon:', error)
      throw error
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a community name')
      return
    }

    setLoading(true)
    try {
      // Upload icon if provided
      let iconUrl = ''
      if (iconFile) {
        iconUrl = await uploadIcon()
      }

      // Create community
      const response = await fetch('/api/institution/academic-communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          iconUrl: iconUrl
        })
      })

      if (response.ok) {
        onCommunityCreated()
        onOpenChange(false)
        resetForm()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating community:', error)
      alert('Failed to create community. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedColorOption = colorOptions.find(c => c.value === formData.color) || colorOptions[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Academic Community</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Community Name */}
          <div>
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Computer Science Research"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the community"
              rows={3}
            />
          </div>

          {/* Icon Upload */}
          <div>
            <Label>Community Icon</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                {iconPreview ? (
                  <Image
                    src={iconPreview}
                    alt="Community icon preview"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                  id="icon-upload"
                />
                <Label htmlFor="icon-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Icon
                    </span>
                  </Button>
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Color Theme */}
          <div>
            <Label>Color Theme</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${color.gradient} border-2 ${
                    formData.color === color.value ? 'border-gray-800' : 'border-gray-200'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label>Preview</Label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mt-2">
              <div 
                className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedColorOption.gradient} p-[2px]`}
              >
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {iconPreview ? (
                      <Image
                        src={iconPreview}
                        alt="Preview"
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">
                  {formData.name || 'Community Name'}
                </p>
                <p className="text-xs text-gray-500">
                  0 members
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading || uploadingIcon}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Create & Confirm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
