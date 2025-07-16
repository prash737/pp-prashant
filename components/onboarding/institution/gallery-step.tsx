"use client"

import { useState } from "react"
import { Plus, Trash2, ImageIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GalleryImage {
  id: string
  url: string
  caption: string
}

interface GalleryStepProps {
  initialData: GalleryImage[]
  onComplete: (data: GalleryImage[]) => void
  onNext: () => void
  onSkip: () => void
}

export default function GalleryStep({ initialData = [], onComplete, onNext, onSkip }: GalleryStepProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialData.length > 0 ? initialData : [])
  const [currentImage, setCurrentImage] = useState<Partial<GalleryImage>>({
    url: "",
    caption: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  // For demo purposes, we'll use placeholder images
  const placeholderImages = [
    "/bustling-university-campus.png",
    "/college-library.png",
    "/university-classroom.png",
    "/college-sports-field.png",
    "/university-laboratory.png",
  ]

  const handleAddImage = () => {
    if (!currentImage.url && !currentImage.caption) return

    // For demo, if no URL is provided, use a random placeholder
    const url = currentImage.url || placeholderImages[Math.floor(Math.random() * placeholderImages.length)]

    const newImage = {
      id: Date.now().toString(),
      url,
      caption: currentImage.caption || "Campus image",
    }

    setImages([...images, newImage])
    setCurrentImage({
      url: "",
      caption: "",
    })
    setIsEditing(false)
  }

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((image) => image.id !== id))
  }

  const handleSave = () => {
    onComplete(images)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Institution Gallery</h2>
        <p className="text-slate-600">
          Add photos of your campus, facilities, and student life to showcase your institution.
        </p>
      </div>

      {/* Gallery grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-700">Your Gallery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative rounded-lg overflow-hidden border border-slate-200">
                <img src={image.url || "/placeholder.svg"} alt={image.caption} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2 bg-white">
                  <p className="text-sm text-slate-700 truncate">{image.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add image form */}
      {isEditing ? (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
          <h3 className="text-lg font-medium text-slate-700">Add New Image</h3>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center">
                <ImageIcon className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 mb-4">Drag and drop an image, or click to browse</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => {
                    // In a real app, you would handle file upload here
                    // For demo, we'll just use a placeholder
                    if (e.target.files && e.target.files[0]) {
                      const randomIndex = Math.floor(Math.random() * placeholderImages.length)
                      setCurrentImage({
                        ...currentImage,
                        url: placeholderImages[randomIndex],
                      })
                    }
                  }}
                />
                <Label htmlFor="image-upload">
                  <Button type="button" variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Browse Files
                  </Button>
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-caption">Caption</Label>
              <Input
                id="image-caption"
                placeholder="e.g., Main Campus Building"
                value={currentImage.caption || ""}
                onChange={(e) => setCurrentImage({ ...currentImage, caption: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleAddImage} className="bg-purple-600 hover:bg-purple-700 text-white">
              Add Image
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentImage({
                  url: "",
                  caption: "",
                })
                setIsEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
          {images.length > 0 ? "Save & Continue" : "Continue"}
        </Button>
      </div>
    </div>
  )
}
