
"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  suggestions?: string[]
  className?: string
  maxItems?: number
  disabled?: boolean
}

export function MultiSelect({
  value = [],
  onChange,
  placeholder = "Type and press Enter to add...",
  suggestions = [],
  className,
  maxItems,
  disabled = false
}: MultiSelectProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Filter suggestions based on input value and exclude already selected items
  React.useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(suggestion)
        )
        .slice(0, 8) // Limit to 8 suggestions
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, suggestions, value])

  const addItem = (item: string) => {
    const trimmedItem = item.trim()
    if (trimmedItem && !value.includes(trimmedItem)) {
      if (!maxItems || value.length < maxItems) {
        onChange([...value, trimmedItem])
        setInputValue("")
        setShowSuggestions(false)
      }
    }
  }

  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index)
    onChange(newValue)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem(inputValue)
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeItem(value.length - 1)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    addItem(suggestion)
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative", className)}>
      <div className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1 mb-1">
          {value.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-pathpiper-teal/10 text-pathpiper-teal border-pathpiper-teal/20 hover:bg-pathpiper-teal/20"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-1 hover:text-pathpiper-teal/80"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled || (maxItems && value.length >= maxItems)}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-pathpiper-teal/10 hover:text-pathpiper-teal focus:bg-pathpiper-teal/10 focus:text-pathpiper-teal focus:outline-none"
            >
              <div className="flex items-center">
                <Plus className="h-3 w-3 mr-2 text-pathpiper-teal" />
                {suggestion}
              </div>
            </button>
          ))}
        </div>
      )}

      {maxItems && (
        <div className="text-xs text-gray-500 mt-1">
          {value.length} of {maxItems} selected
        </div>
      )}
    </div>
  )
}
