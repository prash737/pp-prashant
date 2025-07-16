"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, BookOpen, ChevronDown, ChevronUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Program type options
const PROGRAM_TYPES = [
  { value: "academic", label: "Academic (Grades/Classes)" },
  { value: "degree", label: "Degree/Diploma" },
  { value: "certificate", label: "Certificate" },
  { value: "course", label: "Course" },
  { value: "training", label: "Training" },
  { value: "workshop", label: "Workshop/Seminar" },
  { value: "other", label: "Other" },
]

// Level options
const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner/Introductory" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "multiple", label: "Multiple Levels" },
  { value: "custom", label: "Custom" },
]

// Duration type options
const DURATION_TYPES = [
  { value: "years", label: "Years" },
  { value: "months", label: "Months" },
  { value: "weeks", label: "Weeks" },
  { value: "days", label: "Days" },
  { value: "hours", label: "Hours" },
  { value: "custom", label: "Custom" },
]

interface Program {
  id: string
  name: string
  type: string
  typeCustom?: string
  level: string
  levelCustom?: string
  duration: string
  durationType: string
  durationCustom?: string
  description: string
  eligibility?: string
  outcomes?: string
  assessment?: string
  certification?: string
  schedule?: string
}

interface ProgramsStepProps {
  initialData: Program[]
  onComplete: (data: Program[]) => void
  onNext: () => void
  onSkip: () => void
}

export default function ProgramsStep({ initialData = [], onComplete, onNext, onSkip }: ProgramsStepProps) {
  const [programs, setPrograms] = useState<Program[]>(initialData.length > 0 ? initialData : [])
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Default empty program
  const emptyProgram: Partial<Program> = {
    name: "",
    type: "",
    typeCustom: "",
    level: "",
    levelCustom: "",
    duration: "",
    durationType: "years",
    durationCustom: "",
    description: "",
    eligibility: "",
    outcomes: "",
    assessment: "",
    certification: "",
    schedule: "",
  }

  const [currentProgram, setCurrentProgram] = useState<Partial<Program>>(emptyProgram)
  const [isEditing, setIsEditing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Initialize with one empty program if none exist
  useEffect(() => {
    if (programs.length === 0 && !isEditing) {
      setIsEditing(true)
    }
  }, [programs.length, isEditing])

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section))
    } else {
      setExpandedSections([...expandedSections, section])
    }
  }

  const toggleProgramExpansion = (id: string) => {
    if (expandedProgram === id) {
      setExpandedProgram(null)
    } else {
      setExpandedProgram(id)
    }
  }

  const validateProgram = () => {
    const newErrors: Record<string, string> = {}

    if (!currentProgram.name?.trim()) {
      newErrors.name = "Program name is required"
    }

    if (!currentProgram.type) {
      newErrors.type = "Program type is required"
    } else if (currentProgram.type === "other" && !currentProgram.typeCustom?.trim()) {
      newErrors.typeCustom = "Please specify the program type"
    }

    if (!currentProgram.level) {
      newErrors.level = "Level is required"
    } else if (currentProgram.level === "custom" && !currentProgram.levelCustom?.trim()) {
      newErrors.levelCustom = "Please specify the level"
    }

    if (!currentProgram.duration?.trim()) {
      newErrors.duration = "Duration is required"
    }

    if (!currentProgram.description?.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddProgram = () => {
    if (!validateProgram()) return

    const newProgram = {
      ...currentProgram,
      id: Date.now().toString(),
    } as Program

    setPrograms([...programs, newProgram])
    setCurrentProgram(emptyProgram)
    setIsEditing(false)
    setErrors({})
  }

  const handleRemoveProgram = (id: string) => {
    setPrograms(programs.filter((program) => program.id !== id))
    if (expandedProgram === id) {
      setExpandedProgram(null)
    }
  }

  const handleSave = () => {
    onComplete(programs)
    onNext()
  }

  const handleEditProgram = (program: Program) => {
    setCurrentProgram(program)
    setIsEditing(true)
    setExpandedProgram(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Programs</h2>
        <p className="text-slate-600">Add the programs your institution offers to help students find the right fit.</p>
      </div>

      {/* List of added programs */}
      {programs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-700">Your Programs</h3>
          <div className="space-y-3">
            {programs.map((program) => (
              <div key={program.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {/* Program header - always visible */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                  onClick={() => toggleProgramExpansion(program.id)}
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium text-slate-800">{program.name}</h4>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <span className="mr-2">
                          {program.type === "other"
                            ? program.typeCustom
                            : PROGRAM_TYPES.find((t) => t.value === program.type)?.label || program.type}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          {program.level === "custom"
                            ? program.levelCustom
                            : LEVEL_OPTIONS.find((l) => l.value === program.level)?.label || program.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditProgram(program)
                      }}
                      className="text-slate-500 hover:text-purple-500"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveProgram(program.id)
                      }}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {expandedProgram === program.id ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded program details */}
                {expandedProgram === program.id && (
                  <div className="p-4 pt-0 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Duration</h5>
                        <p className="text-sm text-slate-600">
                          {program.durationType === "custom"
                            ? program.durationCustom
                            : `${program.duration} ${program.durationType}`}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-slate-700 mb-1">Description</h5>
                      <p className="text-sm text-slate-600 whitespace-pre-line">{program.description}</p>
                    </div>

                    {program.eligibility && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Eligibility/Prerequisites</h5>
                        <p className="text-sm text-slate-600">{program.eligibility}</p>
                      </div>
                    )}

                    {program.outcomes && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Learning Outcomes</h5>
                        <p className="text-sm text-slate-600">{program.outcomes}</p>
                      </div>
                    )}

                    {program.assessment && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Assessment Methods</h5>
                        <p className="text-sm text-slate-600">{program.assessment}</p>
                      </div>
                    )}

                    {program.certification && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Certification/Qualification</h5>
                        <p className="text-sm text-slate-600">{program.certification}</p>
                      </div>
                    )}

                    {program.schedule && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Schedule Information</h5>
                        <p className="text-sm text-slate-600">{program.schedule}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add program form */}
      {isEditing ? (
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-5">
          <h3 className="text-lg font-medium text-slate-700">
            {currentProgram.id ? "Edit Program" : "Add New Program"}
          </h3>

          <div className="space-y-5">
            {/* Core Program Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-name" className="flex items-center">
                  Program Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="program-name"
                  placeholder="e.g., Bachelor of Science in Computer Science, Grade 5, GMAT Preparation"
                  value={currentProgram.name || ""}
                  onChange={(e) => setCurrentProgram({ ...currentProgram, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program-type" className="flex items-center">
                    Program Type <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={currentProgram.type || ""}
                    onValueChange={(value) => setCurrentProgram({ ...currentProgram, type: value })}
                  >
                    <SelectTrigger id="program-type" className={errors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select program type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>

                {currentProgram.type === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="program-type-custom" className="flex items-center">
                      Specify Program Type <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="program-type-custom"
                      placeholder="e.g., Bootcamp, Mentorship"
                      value={currentProgram.typeCustom || ""}
                      onChange={(e) => setCurrentProgram({ ...currentProgram, typeCustom: e.target.value })}
                      className={errors.typeCustom ? "border-red-500" : ""}
                    />
                    {errors.typeCustom && <p className="text-red-500 text-sm mt-1">{errors.typeCustom}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program-level" className="flex items-center">
                    Level <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={currentProgram.level || ""}
                    onValueChange={(value) => setCurrentProgram({ ...currentProgram, level: value })}
                  >
                    <SelectTrigger id="program-level" className={errors.level ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
                </div>

                {currentProgram.level === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="program-level-custom" className="flex items-center">
                      Specify Level <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="program-level-custom"
                      placeholder="e.g., Grades 1-5, Professional"
                      value={currentProgram.levelCustom || ""}
                      onChange={(e) => setCurrentProgram({ ...currentProgram, levelCustom: e.target.value })}
                      className={errors.levelCustom ? "border-red-500" : ""}
                    />
                    {errors.levelCustom && <p className="text-red-500 text-sm mt-1">{errors.levelCustom}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="program-duration" className="flex items-center">
                    Duration <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="program-duration"
                    type="text"
                    placeholder="e.g., 4, 12, 6"
                    value={currentProgram.duration || ""}
                    onChange={(e) => setCurrentProgram({ ...currentProgram, duration: e.target.value })}
                    className={errors.duration ? "border-red-500" : ""}
                  />
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="program-duration-type">Duration Type</Label>
                  <Select
                    value={currentProgram.durationType || "years"}
                    onValueChange={(value) => setCurrentProgram({ ...currentProgram, durationType: value })}
                  >
                    <SelectTrigger id="program-duration-type">
                      <SelectValue placeholder="Select duration type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentProgram.durationType === "custom" && (
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="program-duration-custom">Specify Duration</Label>
                    <Input
                      id="program-duration-custom"
                      placeholder="e.g., Self-paced, Varies by student"
                      value={currentProgram.durationCustom || ""}
                      onChange={(e) => setCurrentProgram({ ...currentProgram, durationCustom: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="program-description" className="flex items-center">
                  Description <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="program-description"
                  placeholder="Provide a detailed description of the program, including curriculum, teaching methods, and what students can expect to learn..."
                  value={currentProgram.description || ""}
                  onChange={(e) => setCurrentProgram({ ...currentProgram, description: e.target.value })}
                  className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Optional Expandable Sections */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-700 flex items-center">
                Optional Information
                <Info className="h-4 w-4 text-slate-400 ml-2" />
              </h4>

              <div className="border border-slate-200 rounded-md overflow-hidden">
                <Accordion type="multiple" value={expandedSections}>
                  <AccordionItem value="eligibility" className="border-b border-slate-200">
                    <AccordionTrigger
                      className="px-4 py-3 hover:bg-slate-50 text-sm font-medium"
                      onClick={() => toggleSection("eligibility")}
                    >
                      Eligibility/Prerequisites
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <Textarea
                        placeholder="Age range, prior education, skills needed, entrance requirements..."
                        value={currentProgram.eligibility || ""}
                        onChange={(e) => setCurrentProgram({ ...currentProgram, eligibility: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="outcomes" className="border-b border-slate-200">
                    <AccordionTrigger
                      className="px-4 py-3 hover:bg-slate-50 text-sm font-medium"
                      onClick={() => toggleSection("outcomes")}
                    >
                      Learning Outcomes
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <Textarea
                        placeholder="What students will learn or be able to do after completing the program..."
                        value={currentProgram.outcomes || ""}
                        onChange={(e) => setCurrentProgram({ ...currentProgram, outcomes: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="assessment" className="border-b border-slate-200">
                    <AccordionTrigger
                      className="px-4 py-3 hover:bg-slate-50 text-sm font-medium"
                      onClick={() => toggleSection("assessment")}
                    >
                      Assessment Methods
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <Textarea
                        placeholder="How progress and achievement are measured (exams, projects, etc.)..."
                        value={currentProgram.assessment || ""}
                        onChange={(e) => setCurrentProgram({ ...currentProgram, assessment: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="certification" className="border-b border-slate-200">
                    <AccordionTrigger
                      className="px-4 py-3 hover:bg-slate-50 text-sm font-medium"
                      onClick={() => toggleSection("certification")}
                    >
                      Certification/Qualification
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <Textarea
                        placeholder="What students receive upon completion (degree, certificate, etc.)..."
                        value={currentProgram.certification || ""}
                        onChange={(e) => setCurrentProgram({ ...currentProgram, certification: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="schedule" className="border-b-0">
                    <AccordionTrigger
                      className="px-4 py-3 hover:bg-slate-50 text-sm font-medium"
                      onClick={() => toggleSection("schedule")}
                    >
                      Schedule Information
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <Textarea
                        placeholder="When the program is offered (seasonal, year-round, specific dates)..."
                        value={currentProgram.schedule || ""}
                        onChange={(e) => setCurrentProgram({ ...currentProgram, schedule: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleAddProgram} className="bg-purple-600 hover:bg-purple-700 text-white">
              {currentProgram.id ? "Update Program" : "Add Program"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentProgram(emptyProgram)
                setIsEditing(false)
                setErrors({})
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Program
        </Button>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          disabled={programs.length === 0}
        >
          {programs.length > 0 ? "Save & Continue" : "Continue"}
        </Button>
      </div>
    </div>
  )
}
