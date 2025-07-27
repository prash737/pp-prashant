"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, ImagePlus, Plus, Trash2, Save, Calendar, MapPin, Users, Book, Building, Image as ImageIcon, Edit, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InstitutionData {
  id: string
  name: string
  type: string
  category?: string
  location: string
  bio: string
  logo: string
  coverImage: string
  website: string
  verified: boolean
  founded?: number | null
  tagline: string
  overview?: string
  mission?: string
  coreValues?: string[]
  gallery?: Array<{
    id: string
    url: string
    caption: string
  }>
}

interface InstitutionEditFormProps {
  institutionData: InstitutionData
}

export default function InstitutionEditForm({ institutionData }: InstitutionEditFormProps) {
  // CSS to hide scrollbar for webkit browsers
  const hideScrollbarStyle = `
    #form-container::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `
  const router = useRouter()
  const { toast } = useToast()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const facilityImageRefs = useRef<(HTMLInputElement | null)[]>([])

  const [activeSection, setActiveSection] = useState("about")
  const [formData, setFormData] = useState({
    // About section
    overview: institutionData.overview || "",
    mission: institutionData.mission || "",
    coreValues: Array.isArray(institutionData.coreValues) ? institutionData.coreValues : [""],

    // Quick Facts section
    undergraduateStudents: "",
    graduateStudents: "",
    facultyMembers: "",
    campusSize: "",
    campusSizeUnit: "acres",
    internationalStudents: "",
    ranking: "",
    rankingLevel: "globally",

    // Faculty Stats section
    totalFaculty: "",
    studentFacultyRatioStudent: "",
    studentFacultyRatioFaculty: "",
    facultyWithPhds: "",
    internationalFacultyPercentage: "",

    // Contact Information section
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    email: "",
    website: "",

    // Programs section
    programs: [
      {
        id: "",
        name: "",
        type: "",
        level: "",
        duration: "",
        durationType: "",
        description: "",
        eligibility: "",
        outcomes: "",
        assessment: "",
        certification: "",
        schedule: ""
      }
    ],

    // Faculty section
    faculty: [
      {
        id: "",
        name: "",
        title: "",
        department: "",
        image: "",
        expertise: [],
        email: "",
        featured: false,
        bio: "",
        qualifications: "",
        experience: "",
        specialization: ""
      }
    ],

    // Events section
    events: [
      {
        id: "",
        title: "",
        description: "",
        eventType: "",
        startDate: "",
        endDate: "",
        location: "",
        imageUrl: "",
        registrationUrl: ""
      }
    ],

    // Gallery section
    gallery: [
      {
        id: "",
        imageUrl: "",
        caption: ""
      }
    ]
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(institutionData.logo)
  const [coverPreview, setCoverPreview] = useState<string | null>(institutionData.coverImage)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingQuickFacts, setIsLoadingQuickFacts] = useState(false)
  const [isLoadingContactInfo, setIsLoadingContactInfo] = useState(false)
  const [isLoadingFacultyStats, setIsLoadingFacultyStats] = useState(false)

  // Refs for scroll-to-section functionality
  const sectionRefs = {
    about: useRef<HTMLDivElement>(null),
    "quick-facts": useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
    programs: useRef<HTMLDivElement>(null),
    faculty: useRef<HTMLDivElement>(null),
    "faculty-stats": useRef<HTMLDivElement>(null),
    facilities: useRef<HTMLDivElement>(null),
    events: useRef<HTMLDivElement>(null),
    gallery: useRef<HTMLDivElement>(null)
  }

  const sections = [
    { id: "about", label: "About", icon: Building },
    { id: "quick-facts", label: "Quick Facts", icon: Users },
    { id: "contact", label: "Contact Info", icon: MapPin },
    { id: "programs", label: "Programs", icon: Book },
    { id: "faculty", label: "Faculty", icon: Users },
    { id: "faculty-stats", label: "Faculty Stats", icon: Award },
    { id: "facilities", label: "Facilities", icon: Building },
    { id: "events", label: "Events", icon: Calendar },
    { id: "gallery", label: "Gallery", icon: ImageIcon }
  ]

  // Auto-scroll detection for form container
  useEffect(() => {
    const formContainer = document.getElementById('form-container')
    if (!formContainer) return

    const handleScroll = () => {
      const scrollPosition = formContainer.scrollTop + 50 // Small offset

      let currentSection = "about"
      let closestDistance = Infinity

      // Check each section to find which one is currently most visible
      sections.forEach(({ id }) => {
        const element = sectionRefs[id as keyof typeof sectionRefs]?.current
        if (!element) return

        const rect = element.getBoundingClientRect()
        const containerRect = formContainer.getBoundingClientRect()

        // Calculate position relative to the scrollable container
        const elementTop = element.offsetTop
        const elementBottom = elementTop + rect.height

        // Check if element is in viewport of the scrollable container
        const viewportTop = formContainer.scrollTop + 50
        const viewportBottom = formContainer.scrollTop + formContainer.clientHeight

        if (elementBottom > viewportTop && elementTop < viewportBottom) {
          const distanceFromTop = Math.abs(elementTop - viewportTop)
          if (distanceFromTop < closestDistance) {
            closestDistance = distanceFromTop
            currentSection = id
          }
        }
      })

      setActiveSection(currentSection)
    }

    // Throttle scroll events for better performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    formContainer.addEventListener('scroll', throttledScroll, { passive: true })
    // Call initially to set correct active section
    handleScroll()

    return () => formContainer.removeEventListener('scroll', throttledScroll)
  }, [])

  // Scroll to section when clicking navigation
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs[sectionId as keyof typeof sectionRefs]?.current
    const formContainer = document.getElementById('form-container')

    if (element && formContainer) {
      const offsetTop = element.offsetTop - 20 // Small offset from top

      formContainer.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })

      // Update active section immediately for better UX
      setActiveSection(sectionId)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCoreValueChange = (index: number, value: string) => {
    const newCoreValues = [...formData.coreValues]
    newCoreValues[index] = value
    setFormData(prev => ({
      ...prev,
      coreValues: newCoreValues
    }))
  }

  const addCoreValue = () => {
    setFormData(prev => ({
      ...prev,
      coreValues: [...prev.coreValues, ""]
    }))
  }

  const removeCoreValue = (index: number) => {
    if (formData.coreValues.length > 1) {
      const newCoreValues = formData.coreValues.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        coreValues: newCoreValues
      }))
    }
  }

  // program functionality
  const [programs, setPrograms] = useState([
    {
      id: 1,
      name: '',
      type: '',
      level: '',
      duration: '',
      durationType: 'years',
      description: '',
      eligibility: '',
      outcomes: '',
    },
  ])
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false)

  const initialDataLoaded = useRef(false)

  useEffect(() => {
    if (institutionData && !initialDataLoaded.current) {
      setFormData(prev => ({
        ...prev,
        overview: institutionData.overview || '',
        mission: institutionData.mission || '',
        coreValues: Array.isArray(institutionData.coreValues) ? institutionData.coreValues : [''],
      }))

      // Fetch existing data only once
      fetchPrograms()
      fetchQuickFacts()
      fetchContactInfo()
      fetchFacultyStats()
      initialDataLoaded.current = true
    }
  }, [institutionData.id])

  const fetchQuickFacts = async () => {
    try {
      setIsLoadingQuickFacts(true)
      const response = await fetch('/api/institution/quick-facts')
      if (response.ok) {
        const data = await response.json()
        if (data.quickFacts) {
          const qf = data.quickFacts
          setFormData(prev => ({
            ...prev,
            undergraduateStudents: qf.undergraduate_students?.toString() || '',
            graduateStudents: qf.graduate_students?.toString() || '',
            facultyMembers: qf.faculty_members?.toString() || '',
            campusSize: qf.campus_size_acres?.toString() || qf.campus_size_km2?.toString() || '',
            campusSizeUnit: qf.campus_size_acres ? 'acres' : qf.campus_size_km2 ? 'sq-km' : 'acres',
            internationalStudents: qf.international_students_countries?.toString() || '',
            ranking: qf.global_ranking || ''
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching quick facts:', error)
    } finally {
      setIsLoadingQuickFacts(false)
    }
  }

  const fetchContactInfo = async () => {
    try {
      setIsLoadingContactInfo(true)
      const response = await fetch('/api/institution/contact-info')
      if (response.ok) {
        const data = await response.json()
        if (data.contactInfo) {
          const ci = data.contactInfo
          setFormData(prev => ({
            ...prev,
            address: ci.address || '',
            city: ci.city || '',
            state: ci.state || '',
            postalCode: ci.postal_code || '',
            country: ci.country || '',
            phone: ci.phone || '',
            email: ci.email || '',
            website: ci.website || ''
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    } finally {
      setIsLoadingContactInfo(false)
    }
  }

  const fetchFacultyStats = async () => {
    try {
      setIsLoadingFacultyStats(true)
      const response = await fetch('/api/institution/faculty-stats')
      if (response.ok) {
        const data = await response.json()
        if (data.facultyStats) {
          const fs = data.facultyStats
          setFormData(prev => ({
            ...prev,
            totalFaculty: fs.totalFaculty?.toString() || '',
            studentFacultyRatioStudent: fs.studentFacultyRatioStudents?.toString() || '',
            studentFacultyRatioFaculty: fs.studentFacultyRatioFaculty?.toString() || '',
            facultyWithPhds: fs.facultyWithPhdsPercentage?.toString() || '',
            internationalFacultyPercentage: fs.internationalFacultyPercentage?.toString() || ''
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching faculty stats:', error)
    } finally {
      setIsLoadingFacultyStats(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      setIsLoadingPrograms(true)
      const response = await fetch('/api/institution/programs')
      if (response.ok) {
        const data = await response.json()
        if (data.programs && data.programs.length > 0) {
          const formattedPrograms = data.programs.map((program: any, index: number) => ({
            id: index + 1,
            name: program.name || '',
            type: program.type || '',
            level: program.level || '',
            duration: program.durationValue?.toString() || '',
            durationType: program.durationType || '',
            description: program.description || '',
            eligibility: program.eligibility || '',
            outcomes: program.learningOutcomes || '',
          }))
          setPrograms(formattedPrograms)
        }
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setIsLoadingPrograms(false)
    }
  }

  const addProgram = () => {
    setPrograms([
      ...programs,
      {
        id: programs.length + 1,
        name: '',
        type: '',
        level: '',
        duration: '',
        durationType: 'years',
        description: '',
        eligibility: '',
        outcomes: '',
      },
    ])
  }

  const removeProgram = (index: number) => {
    const updatedPrograms = [...programs]
    updatedPrograms.splice(index, 1)
    setPrograms(updatedPrograms)
  }

  const updateProgram = (index: number, field: string, value: string) => {
    const updatedPrograms = [...programs]
    updatedPrograms[index] = { ...updatedPrograms[index], [field]: value }
    setPrograms(updatedPrograms)
  }

  // Faculty state management - Simplified for separate state
  const [existingFaculty, setExistingFaculty] = useState<any[]>([])
  const [newFaculty, setNewFaculty] = useState<any[]>([])
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false)
  const facultyLoaded = useRef(false)

  useEffect(() => {
    if (institutionData && !facultyLoaded.current) {
      // Fetch existing faculty only once
      fetchFaculty()
    }
  }, [institutionData.id]) // Only depend on institution ID

  const fetchFaculty = async () => {
    if (isLoadingFaculty || facultyLoaded.current) return

    try {
      setIsLoadingFaculty(true)
      facultyLoaded.current = true
      const response = await fetch('/api/institution/faculty')
      if (response.ok) {
        const data = await response.json()
        if (data.faculty && data.faculty.length > 0) {
          setExistingFaculty(data.faculty)
        }
      }
    } catch (error) {
      console.error('Error fetching faculty:', error)
    } finally {
      setIsLoadingFaculty(false)
    }
  }

  // Faculty handlers - Simplified for separate state
  const addFaculty = () => {
    const newMember = {
      tempId: Date.now(), // Use temporary ID for tracking
      name: '',
      title: '',
      department: '',
      image: '',
      expertise: [],
      email: '',
      featured: false,
      bio: '',
      qualifications: '',
      experience: '',
      specialization: ''
    }
    setNewFaculty(prev => [...prev, newMember])
  }

  const removeNewFaculty = (tempId: number) => {
    setNewFaculty(prev => prev.filter(member => member.tempId !== tempId))
  }

  const updateNewFaculty = (tempId: number, field: string, value: string | string[] | boolean) => {
    setNewFaculty(prev => prev.map(member => 
      member.tempId === tempId 
        ? { ...member, [field]: value }
        : member
    ))
  }

  // Facility functionality - Simplified state management
  const [existingFacilities, setExistingFacilities] = useState<any[]>([])
  const [newFacilities, setNewFacilities] = useState<any[]>([])
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false)
  const facilitiesLoaded = useRef(false)

  useEffect(() => {
    if (institutionData && !facilitiesLoaded.current) {
      // Fetch existing facilities only once
      fetchFacilities()
    }
  }, [institutionData.id]) // Only depend on institution ID

  const fetchFacilities = async () => {
    if (isLoadingFacilities || facilitiesLoaded.current) return

    try {
      setIsLoadingFacilities(true)
      facilitiesLoaded.current = true
      const response = await fetch('/api/institution/facilities')
      if (response.ok) {
        const data = await response.json()
        if (data.facilities && data.facilities.length > 0) {
          setExistingFacilities(data.facilities)
        }
      }
    } catch (error) {
      console.error('Error fetching facilities:', error)
    } finally {
      setIsLoadingFacilities(false)
    }
  }

  // Facility handlers - Simplified for separate state
  const addFacility = () => {
    const newFacility = {
      tempId: Date.now(), // Use temporary ID for tracking
      name: '',
      description: '',
      features: [''],
      images: [''],
      learnMoreLink: ''
    }
    setNewFacilities(prev => [...prev, newFacility])
  }

  const removeNewFacility = (tempId: number) => {
    setNewFacilities(prev => prev.filter(facility => facility.tempId !== tempId))
  }

  const updateNewFacility = (tempId: number, field: string, value: string | string[]) => {
    setNewFacilities(prev => prev.map(facility => 
      facility.tempId === tempId 
        ? { ...facility, [field]: value }
        : facility
    ))
  }

  // Event handlers
  const [existingEvents, setExistingEvents] = useState<any[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const eventsLoaded = useRef(false)

  useEffect(() => {
    if (institutionData && !eventsLoaded.current) {
      // Fetch existing events only once
      fetchEvents()
    }
  }, [institutionData.id]) // Only depend on institution ID

  const fetchEvents = useCallback(async () => {
    if (isLoadingEvents || eventsLoaded.current) return // Prevent multiple simultaneous calls

    try {
      setIsLoadingEvents(true)
      eventsLoaded.current = true
      const response = await fetch('/api/institution/events')
      if (response.ok) {
        const data = await response.json()
        if (data.events && data.events.length > 0) {
          setExistingEvents(data.events)
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoadingEvents(false)
    }
  }, [])

  const addEvent = () => {
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, {
        id: "",
        title: "",
        description: "",
        eventType: "",
        startDate: "",
        endDate: "",
        location: "",
        imageUrl: "",
        registrationUrl: ""
      }]
    }))
  }

  const removeEvent = async (index: number) => {
    const eventToRemove = formData.events[index]

    // If it's an existing event (has an ID), delete it from database
    if (eventToRemove.id && eventToRemove.id !== '') {
      try {
        const response = await fetch(`/api/institution/events?id=${eventToRemove.id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Failed to delete event')
        }

        toast({
          title: "Success",
          description: "Event deleted successfully!",
        })
      } catch (error) {
        console.error('Error deleting event:', error)
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive",
        })
        return // Don't remove from UI if database deletion failed
      }
    }

    // Remove from UI
    const newEvents = formData.events.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      events: newEvents
    }))
  }

  const updateEvent = (index: number, field: string, value: string) => {
    const newEvents = [...formData.events]
    newEvents[index] = { ...newEvents[index], [field]: value }
    setFormData(prev => ({
      ...prev,
      events: newEvents
    }))
  }

  // Gallery handlers
  const [existingGallery, setExistingGallery] = useState<any[]>([])
  const [newGalleryItems, setNewGalleryItems] = useState<any[]>([])
  const [isLoadingGallery, setIsLoadingGallery] = useState(false)
  const galleryLoaded = useRef(false)

  useEffect(() => {
    if (institutionData && !galleryLoaded.current) {
      // Fetch existing gallery only once
      fetchGallery()
    }
  }, [institutionData.id])

  const fetchGallery = async () => {
    if (isLoadingGallery || galleryLoaded.current) return

    try {
      setIsLoadingGallery(true)
      galleryLoaded.current = true
      const response = await fetch(`/api/institution/gallery?institutionId=${institutionData.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.images && data.images.length > 0) {
          setExistingGallery(data.images)
        }
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setIsLoadingGallery(false)
    }
  }

  const addGalleryItem = () => {
    const newItem = {
      tempId: Date.now(),
      imageUrl: '',
      caption: ''
    }
    setNewGalleryItems(prev => [...prev, newItem])
  }

  const removeNewGalleryItem = (tempId: number) => {
    setNewGalleryItems(prev => prev.filter(item => item.tempId !== tempId))
  }

  const updateNewGalleryItem = (tempId: number, field: string, value: string) => {
    setNewGalleryItems(prev => prev.map(item => 
      item.tempId === tempId 
        ? { ...item, [field]: value }
        : item
    ))
  }

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tempId: number) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Create immediate preview URL
        const previewUrl = URL.createObjectURL(file)
        updateNewGalleryItem(tempId, 'imageUrl', previewUrl)

        // Upload to server
        const uploadData = new FormData()
        uploadData.append('file', file)

        const response = await fetch('/api/upload/institution-gallery', {
          method: 'POST',
          body: uploadData
        })

        if (response.ok) {
          const data = await response.json()
          // Clean up the preview URL
          URL.revokeObjectURL(previewUrl)

          // Update with server URL
          updateNewGalleryItem(tempId, 'imageUrl', data.url)

          toast({
            title: "Success",
            description: "Image uploaded successfully!",
          })
        } else {
          console.error('Failed to upload gallery image')
          // Clean up the preview URL on error
          URL.revokeObjectURL(previewUrl)
          // Reset to empty
          updateNewGalleryItem(tempId, 'imageUrl', '')

          toast({
            title: "Error",
            description: "Failed to upload gallery image. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error uploading gallery image:', error)
        toast({
          title: "Error",
          description: "Failed to upload gallery image. Please try again.",
          variant: "destructive",
        })
      }
    }

    // Clear the input value to allow re-uploading the same file
    e.target.value = ''
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFacilityImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tempId: number) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Create immediate preview URL
        const previewUrl = URL.createObjectURL(file)
        updateNewFacility(tempId, 'images', [previewUrl])

        // Upload to server
        const uploadData = new FormData()
        uploadData.append('file', file)

        const response = await fetch('/api/upload/institution-facility', {
          method: 'POST',
          body: uploadData
        })

        if (response.ok) {
          const data = await response.json()
          // Clean up the preview URL
          URL.revokeObjectURL(previewUrl)

          // Update with server URL
          updateNewFacility(tempId, 'images', [data.url])

          toast({
            title: "Success",
            description: "Image uploaded successfully!",
          })
        } else {
          console.error('Failed to upload facility image')
          // Clean up the preview URL on error
          URL.revokeObjectURL(previewUrl)
          // Reset to empty
          updateNewFacility(tempId, 'images', [''])

          toast({
            title: "Error",
            description: "Failed to upload facility image. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error uploading facility image:', error)
        toast({
          title: "Error",
          description: "Failed to upload facility image. Please try again.",
          variant: "destructive",
        })
      }
    }

    // Clear the input value to allow re-uploading the same file
    e.target.value = ''
  }

  const uploadFile = async (file: File, type: 'logo' | 'cover'): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/upload/institution-${type}`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`)
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      return null
    }
  }

  // Save functions for each section
  const saveAboutSection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/institution/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overview: formData.overview,
          mission: formData.mission,
          coreValues: formData.coreValues.filter(value => value.trim() !== ''),
          logoUrl: logoPreview,
          coverImageUrl: coverPreview,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update about section')
      }

      toast({
        title: "Success",
        description: "About section updated successfully!",
      })
    } catch (error) {
      console.error('Error updating about section:', error)
      toast({
        title: "Error",
        description: "Failed to update about section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveQuickFactsSection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/institution/quick-facts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          undergraduateStudents: formData.undergraduateStudents,
          graduateStudents: formData.graduateStudents,
          facultyMembers: formData.facultyMembers,
          campusSize: formData.campusSize,
          campusSizeUnit: formData.campusSizeUnit,
          internationalStudents: formData.internationalStudents,
          ranking: formData.ranking
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update quick facts')
      }

      toast({
        title: "Success",
        description: "Quick facts updated successfully!",
      })
    } catch (error) {
      console.error('Error updating quick facts:', error)
      toast({
        title: "Error",
        description: "Failed to update quick facts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveContactInfoSection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/institution/contact-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email,
          website: formData.website
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update contact info')
      }

      toast({
        title: "Success",
        description: "Contact information updated successfully!",
      })
    } catch (error) {
      console.error('Error updating contact info:', error)
      toast({
        title: "Error",
        description: "Failed to update contact info. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveProgramsSection = async () => {
    setIsLoading(true)
    try {
      const validPrograms = programs.filter(program =>
        program.name.trim() !== '' &&
        program.type.trim() !== '' &&
        program.level.trim() !== '' &&
        program.duration.trim() !== '' &&
        program.description.trim() !== ''
      )

      const response = await fetch('/api/institution/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programs: validPrograms.map(program => ({
            name: program.name,
            type: program.type,
            level: program.level,
            duration: program.duration,
            durationType: program.durationType || 'years',
            description: program.description,
            eligibility: program.eligibility,
            outcomes: program.outcomes,
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save programs')
      }

      toast({
        title: "Success",
        description: "Programs updated successfully!",
      })
    } catch (error) {
      console.error('Error updating programs:', error)
      toast({
        title: "Error",
        description: "Failed to update programs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveEventsSection = async () => {
    setIsLoading(true)
    try {
      const validEvents = formData.events.filter(event =>
        event.title.trim() !== '' &&
        event.description.trim() !== '' &&
        event.eventType.trim() !== '' &&
        event.startDate.trim() !== ''
      )

      const response = await fetch('/api/institution/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: validEvents,
          preserveExisting: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save events')
      }

      toast({
        title: "Success",
        description: "Events updated successfully!",
      })
    } catch (error) {
      console.error('Error updating events:', error)
      toast({
        title: "Error",
        description: "Failed to update events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update basic profile information
      const profileResponse = await fetch('/api/institution/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overview: formData.overview,
          mission: formData.mission,
          coreValues: formData.coreValues.filter(value => value.trim() !== ''),
          logoUrl: logoPreview,
          coverImageUrl: coverPreview,
        }),
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to update profile')
      }

      // Save programs with proper formatting
      const validPrograms = programs.filter(program =>
        program.name.trim() !== '' &&
        program.type.trim() !== '' &&
        program.level.trim() !== '' &&
        program.duration.trim() !== '' &&
        program.description.trim() !== ''
      )

      const programsResponse = await fetch('/api/institution/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programs: validPrograms.map(program => ({
            name: program.name,
            type: program.type,
            level: program.level,
            duration: program.duration,
            durationType: program.durationType || 'years',
            description: program.description,
            eligibility: program.eligibility,
            outcomes: program.outcomes,
          }))
        }),
      })

      if (!programsResponse.ok) {
        throw new Error('Failed to save programs')
      }

      // Save events - only send new events without IDs or existing events that were modified
      const validEvents = formData.events.filter(event =>
        event.title.trim() !== '' &&
        event.description.trim() !== '' &&
        event.eventType.trim() !== '' &&
        event.startDate.trim() !== ''
      )

      const eventsResponse = await fetch('/api/institution/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: validEvents,
          preserveExisting: true
        }),
      })

      if (!eventsResponse.ok) {
        throw new Error('Failed to save events')
      }

      toast({
        title: "Success",
        description: "Profile, programs, and events updated successfully!",
      })
      router.push('/institution/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderAboutSection = () => (
    <Card ref={sectionRefs.about}>
      <CardHeader>
        <CardTitle>About Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Institution Logo</Label>
          <div
            className="w-32 h-32 rounded-lg bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors"
            onClick={() => logoInputRef.current?.click()}
          >
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo preview"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Camera className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-xs text-slate-500 text-center px-2">
                  Upload Logo
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />
          <p className="text-xs text-slate-500">Recommended: Square image (200x200px)</p>
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          <div
            className="w-full h-48 rounded-lg bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverPreview ? (
              <Image
                src={coverPreview}
                alt="Cover preview"
                width={800}
                height={300}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <ImagePlus className="h-10 w-10 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500 text-center px-4">
                  Click to upload a cover image for your institution
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
          />
          <p className="text-xs text-slate-500">Recommended: 1200x400px image</p>
        </div>

        {/* Overview */}
        <div className="space-y-2">
          <Label htmlFor="overview">Overview</Label>
          <Textarea
            id="overview"
            value={formData.overview}
            onChange={(e) => handleInputChange('overview', e.target.value)}
            placeholder="Provide an overview of your institution, its history, and what makes it unique"
            className="min-h-[120px]"
          />
        </div>

        {/* Mission */}
        <div className="space-y-2">
          <Label htmlFor="mission">Mission</Label>
          <Textarea
            id="mission"
            value={formData.mission}
            onChange={(e) => handleInputChange('mission', e.target.value)}
            placeholder="Describe your institution's mission and purpose"
            className="min-h-[100px]"
          />
        </div>

        {/* Core Values */}
        <div className="space-y-2">
          <Label>Core Values</Label>
          {formData.coreValues.map((value, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={value}
                onChange={(e) => handleCoreValueChange(index, e.target.value)}
                placeholder={`Core value ${index + 1}`}
                className="flex-1"
              />
              {formData.coreValues.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCoreValue(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCoreValue}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Core Value
          </Button>
        </div>

        {/* Save Button for About Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={saveAboutSection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save About Section'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderQuickFactsSection = () => (
    <Card ref={sectionRefs["quick-facts"]}>
      <CardHeader>
        <CardTitle>Quick Facts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Student Body */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Body</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="undergraduateStudents">Undergraduate Students</Label>
              <Input
                id="undergraduateStudents"
                value={formData.undergraduateStudents}
                onChange={(e) => handleInputChange('undergraduateStudents', e.target.value)}
                placeholder="e.g., 7,645"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduateStudents">Graduate Students</Label>
              <Input
                id="graduateStudents"
                value={formData.graduateStudents}
                onChange={(e) => handleInputChange('graduateStudents', e.target.value)}
                placeholder="e.g., 9,292"
                type="number"
              />
            </div>
          </div>
        </div>

        {/* Faculty */}
        <div className="space-y-2">
          <Label htmlFor="facultyMembers">Faculty Members</Label>
          <Input
            id="facultyMembers"
            value={formData.facultyMembers}
            onChange={(e) => handleInputChange('facultyMembers', e.target.value)}
            placeholder="e.g., 2,288"
            type="number"
          />
        </div>

        {/* Campus Size */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Campus Size</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campusSize">Size</Label>
              <Input
                id="campusSize"
                value={formData.campusSize}
                onChange={(e) => handleInputChange('campusSize', e.target.value)}
                placeholder="e.g., 8,180"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campusSizeUnit">Unit</Label>
              <Select
                value={formData.campusSizeUnit}
                onValueChange={(value) => handleInputChange('campusSizeUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acres">Acres</SelectItem>
                  <SelectItem value="hectares">Hectares</SelectItem>
                  <SelectItem value="sq-km">Square Kilometers</SelectItem>
                  <SelectItem value="sq-miles">Square Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* International Students */}
        <div className="space-y-2">
          <Label htmlFor="internationalStudents">International Students (Number of Countries)</Label>
          <Input
            id="internationalStudents"
            value={formData.internationalStudents}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              handleInputChange('internationalStudents', value)
            }}
            placeholder="e.g., 90"
            type="number"
            min="0"
          />
        </div>

        {/* Rankings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Rankings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ranking">Ranking Position</Label>
              <Input
                id="ranking"
                value={formData.ranking}
                onChange={(e) => handleInputChange('ranking', e.target.value)}
                placeholder="e.g., Top 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rankingLevel">Ranking Level</Label>
              <Select
                value={formData.rankingLevel}
                onValueChange={(value) => handleInputChange('rankingLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="globally">Globally</SelectItem>
                  <SelectItem value="nationally">Nationally</SelectItem>
                  <SelectItem value="regionally">Regionally</SelectItem>
                  <SelectItem value="in-category">In Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save Button for Quick Facts Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={saveQuickFactsSection}
            disabled={isLoading || isLoadingQuickFacts}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Quick Facts'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderContactInfoSection = () => (
    <Card ref={sectionRefs.contact}>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="e.g., 450 Serra Mall"
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="e.g., Stanford"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="e.g., CA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder="e.g., 94305"
            />
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="e.g., United States"
          />
        </div>

        {/* Phone, Email, and Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="e.g., (650) 723-2300"
              type="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="e.g., admission@stanford.edu"
              type="email"
            />
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="e.g., https://www.stanford.edu"
            type="url"
          />
        </div>

        {/* Save Button for Contact Information Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={saveContactInfoSection}
            disabled={isLoading || isLoadingContactInfo}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Contact Information'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderProgramsSection = () => (
    <Card ref={sectionRefs.programs}>
      <CardHeader>
        <CardTitle>Programs & Courses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {programs.map((program, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Program {index + 1}</h4>
              {programs.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeProgram(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program Name</Label>
                <Input
                  value={program.name}
                  onChange={(e) => updateProgram(index, 'name', e.target.value)}
                  placeholder="e.g., Bachelor of Computer Science"
                />
              </div>

              <div className="space-y-2">                <Label>Program Type</Label>
                <Select
                  value={program.type}
                  onValueChange={(value) => updateProgram(index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="degree">Degree</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={program.level}
                  onValueChange={(value) => updateProgram(index, 'level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                  </SelectContent>                </Select>
                            </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={program.duration}
                    onChange={(e) => updateProgram(index, 'duration', e.target.value)}
                    placeholder="e.g., 4, 6, 12"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration Type</Label>
                  <Select value={program.durationType} onValueChange={(value) => updateProgram(index, 'durationType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="years">Years</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={program.description}
                onChange={(e) => updateProgram(index, 'description', e.target.value)}
                placeholder="Describe the program curriculum and objectives"
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Eligibility</Label>
                <Textarea
                  value={program.eligibility}
                  onChange={(e) => updateProgram(index, 'eligibility', e.target.value)}
                  placeholder="Entry requirements and prerequisites"
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Learning Outcomes</Label>
                <Textarea
                  value={program.outcomes}
                  onChange={(e) => updateProgram(index, 'outcomes', e.target.value)}
                  placeholder="What students will achieve"
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addProgram}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>

        {/* Save Button for Programs Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={saveProgramsSection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Programs Section'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Component for existing faculty cards with edit functionality
  const ExistingFacultyCard = ({ member, onUpdate }: { member: any, onUpdate: () => void }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState(member)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
      setIsSaving(true)
      try {
        // Validate required fields
        if (!editData.name.trim() || !editData.title.trim() || !editData.department.trim() || !editData.email.trim()) {
          toast({
            title: "Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }

        const response = await fetch('/api/institution/faculty', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            faculty: [editData]
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update faculty')
        }

        toast({
          title: "Success",
          description: "Faculty member updated successfully!",
        })

        setIsEditing(false)
        onUpdate() // Refresh the faculty list
      } catch (error) {
        console.error('Error updating faculty:', error)
        toast({
          title: "Error",
          description: "Failed to update faculty member. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    }

    const handleCancel = () => {
      setEditData(member) // Reset to original data
      setIsEditing(false)
    }

    const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this faculty member? This action cannot be undone.')) {
        return
      }

      try {
        const response = await fetch(`/api/institution/faculty?id=${member.id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Failed to delete faculty member')
        }

        toast({
          title: "Success",
          description: "Faculty member deleted successfully!",
        })

        onUpdate() // Refresh the faculty list
      } catch (error) {
        console.error('Error deleting faculty member:', error)
        toast({
          title: "Error",
          description: "Failed to delete faculty member. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (isEditing) {
      return (
        <div className="p-6 border rounded-lg bg-blue-50 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-blue-900">Editing: {member.name}</h4>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name <span className="text-red-500">*</span></Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Dr. Sarah Johnson"
              />
            </div>

            <div className="space-y-2">
              <Label>Academic Title <span className="text-red-500">*</span></Label>
              <Input
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Professor of Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label>Department <span className="text-red-500">*</span></Label>
              <Input
                value={editData.department}
                onChange={(e) => setEditData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Computer Science, School of Engineering"
              />
            </div>

            <div className="space-y-2">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g., sjohnson@institution.edu"
              />
            </div>

            <div className="space-y-2">
              <Label>Qualifications</Label>
              <Input
                value={editData.qualifications || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, qualifications: e.target.value }))}
                placeholder="e.g., PhD in Computer Science, MIT"
              />
            </div>

            <div className="space-y-2">
              <Label>Experience</Label>
              <Input
                value={editData.experience || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="e.g., 15 years"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Specialization</Label>
            <Input
              value={editData.specialization || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, specialization: e.target.value }))}
              placeholder="e.g., Machine Learning, Data Science"
            />
          </div>

          <div className="space-y-2">
            <Label>Areas of Expertise (comma-separated)</Label>
            <Input
              value={Array.isArray(editData.expertise) ? editData.expertise.join(', ') : editData.expertise || ''}
              onChange={(e) => {
                const expertiseArray = e.target.value.split(',').map(item => item.trim()).filter(item => item)
                setEditData(prev => ({ ...prev, expertise: expertiseArray }))
              }}
              placeholder="e.g., Artificial Intelligence, Machine Learning, Computer Vision"
            />
          </div>

          <div className="space-y-2">
            <Label>Biography</Label>
            <Textarea
              value={editData.bio || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Brief biography, achievements, research interests, and background"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`featured-edit-${editData.id}`}
              checked={editData.featured || false}
              onChange={(e) => setEditData(prev => ({ ...prev, featured: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor={`featured-edit-${editData.id}`} className="text-sm font-medium">
              Feature this faculty member (display prominently)
            </Label>
          </div>
        </div>
      )
    }

    return (
      <div className="p-6 border rounded-lg bg-gray-50 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {member.image && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <p className="text-gray-600">{member.title}</p>
                <p className="text-gray-500 text-sm">{member.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-sm text-gray-700">{member.email}</p>
              </div>
              {member.qualifications && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Qualifications:</span>
                  <p className="text-sm text-gray-700">{member.qualifications}</p>
                </div>
              )}
              {member.experience && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Experience:</span>
                  <p className="text-sm text-gray-700">{member.experience}</p>
                </div>
              )}
              {member.specialization && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Specialization:</span>
                  <p className="text-sm text-gray-700">{member.specialization}</p>
                </div>
              )}
            </div>

            {member.expertise && member.expertise.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-500">Expertise:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {member.expertise.map((area: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {member.featured && (
              <div className="mt-3">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  Featured Faculty
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderFacultyStatsSection = () => (
    <Card ref={sectionRefs["faculty-stats"]}>
      <CardHeader>
        <CardTitle>Faculty Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Faculty */}
        <div className="space-y-2">
          <Label htmlFor="totalFaculty">Total Faculty</Label>
          <Input
            id="totalFaculty"
            value={formData.totalFaculty}
            onChange={(e) => handleInputChange('totalFaculty', e.target.value)}
            placeholder="e.g., 2288"
            type="number"
          />
        </div>

        {/* Student-Faculty Ratio */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Student-Faculty Ratio</h3>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="studentFacultyRatioStudent">Students</Label>
              <Input
                id="studentFacultyRatioStudent"
                value={formData.studentFacultyRatioStudent}
                onChange={(e) => handleInputChange('studentFacultyRatioStudent', e.target.value)}
                placeholder="e.g., 5"
                type="number"
              />
            </div>
            <div className="flex justify-center items-center pt-6">
              <span className="text-2xl font-bold text-gray-500">:</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentFacultyRatioFaculty">Faculty</Label>
              <Input
                id="studentFacultyRatioFaculty"
                value={formData.studentFacultyRatioFaculty}
                onChange={(e) => handleInputChange('studentFacultyRatioFaculty', e.target.value)}
                placeholder="e.g., 1"
                type="number"
              />
            </div>
          </div>
        </div>

        {/* Faculty with PhDs */}
        <div className="space-y-2">
          <Label htmlFor="facultyWithPhds">Faculty with PhDs</Label>
          <div className="relative">
            <Input
              id="facultyWithPhds"
              value={formData.facultyWithPhds}
              onChange={(e) => handleInputChange('facultyWithPhds', e.target.value)}
              placeholder="e.g., 97"
              type="number"
              min="0"
              max="100"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
          </div>
        </div>

        {/* International Faculty */}
        <div className="space-y-2">
          <Label htmlFor="internationalFacultyPercentage">International Faculty</Label>
          <div className="relative">
            <Input
              id="internationalFacultyPercentage"
              value={formData.internationalFacultyPercentage}
              onChange={(e) => handleInputChange('internationalFacultyPercentage', e.target.value)}
              placeholder="e.g., 30"
              type="number"
              min="0"
              max="100"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
          </div>
        </div>

        {/* Save Button for Faculty Stats Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={async () => {
              setIsLoading(true)
              try {
                const response = await fetch('/api/institution/faculty-stats', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    totalFaculty: formData.totalFaculty,
                    studentFacultyRatioStudent: formData.studentFacultyRatioStudent,
                    studentFacultyRatioFaculty: formData.studentFacultyRatioFaculty,
                    facultyWithPhds: formData.facultyWithPhds,
                    internationalFacultyPercentage: formData.internationalFacultyPercentage
                  }),
                })

                if (!response.ok) {
                  throw new Error('Failed to save faculty stats')
                }

                toast({
                  title: "Success",
                  description: "Faculty statistics updated successfully!",
                })
              } catch (error) {
                console.error('Error saving faculty stats:', error)
                toast({
                  title: "Error",
                  description: "Failed to save faculty statistics. Please try again.",
                  variant: "destructive",
                })
              } finally {
                setIsLoading(false)
              }
            }}
            disabled={isLoading || isLoadingFacultyStats}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Faculty Statistics'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderFacultySection = () => {
    return (
      <Card ref={sectionRefs.faculty}>
        <CardHeader>
          <CardTitle>Faculty & Staff</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingFaculty ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading faculty...</p>
            </div>
          ) : (
            <>
              {/* Existing Faculty */}
              {existingFaculty.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Existing Faculty</h3>
                  {existingFaculty.map((member) => (
                    <ExistingFacultyCard 
                      key={member.id} 
                      member={member} 
                      onUpdate={fetchFaculty}
                    />
                  ))}
                </div>
              )}

              {/* New Faculty */}
              {newFaculty.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">New Faculty Members</h3>
                  {newFaculty.map((member, index) => (
                    <div key={member.tempId} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">New Faculty Member {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeNewFaculty(member.tempId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Profile Image Upload */}
                      <div className="space-y-2">
                        <Label>Profile Image</Label>
                        <div
                          className="w-32 h-32 rounded-lg bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors"
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                try {
                                  // Create immediate preview URL
                                  const previewUrl = URL.createObjectURL(file)
                                  updateNewFaculty(member.tempId, 'image', previewUrl)

                                  // Upload to server
                                  const uploadData = new FormData()
                                  uploadData.append('file', file)

                                  const response = await fetch('/api/upload/institution-faculty', {
                                    method: 'POST',
                                    body: uploadData
                                  })

                                  if (response.ok) {
                                    const data = await response.json()
                                    // Clean up the preview URL
                                    URL.revokeObjectURL(previewUrl)

                                    // Update with server URL
                                    updateNewFaculty(member.tempId, 'image', data.url)

                                    toast({
                                      title: "Success",
                                      description: "Faculty image uploaded successfully!",
                                    })
                                  } else {
                                    console.error('Failed to upload faculty image')
                                    // Clean up the preview URL on error
                                    URL.revokeObjectURL(previewUrl)
                                    // Reset to empty
                                    updateNewFaculty(member.tempId, 'image', '')

                                    toast({
                                      title: "Error",
                                      description: "Failed to upload faculty image. Please try again.",
                                      variant: "destructive",
                                    })
                                  }
                                } catch (error) {
                                  console.error('Error uploading faculty image:', error)
                                  toast({
                                    title: "Error",
                                    description: "Failed to upload faculty image. Please try again.",
                                    variant: "destructive",
                                  })
                                }
                              }
                            }
                            input.click()
                          }}
                        >
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt="Faculty preview"
                              width={128}
                              height={128}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <Camera className="h-8 w-8 text-slate-400 mb-2" />
                              <span className="text-xs text-slate-500 text-center px-2">
                                Upload Photo
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">Recommended: Square image (300x300px)</p>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name <span className="text-red-500">*</span></Label>
                          <Input
                            value={member.name}
                            onChange={(e) => updateNewFaculty(member.tempId, 'name', e.target.value)}
                            placeholder="e.g., Dr. Sarah Johnson"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Academic Title <span className="text-red-500">*</span></Label>
                          <Input
                            value={member.title}
                            onChange={(e) => updateNewFaculty(member.tempId, 'title', e.target.value)}
                            placeholder="e.g., Professor of Computer Science"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Department <span className="text-red-500">*</span></Label>
                          <Input
                            value={member.department}
                            onChange={(e) => updateNewFaculty(member.tempId, 'department', e.target.value)}
                            placeholder="e.g., Computer Science, School of Engineering"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Email <span className="text-red-500">*</span></Label>
                          <Input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateNewFaculty(member.tempId, 'email', e.target.value)}
                            placeholder="e.g., sjohnson@institution.edu"
                            required
                          />
                        </div>
                      </div>

                      {/* Professional Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Academic Qualifications</Label>
                          <Input
                            value={member.qualifications}
                            onChange={(e) => updateNewFaculty(member.tempId, 'qualifications', e.target.value)}
                            placeholder="e.g., PhD in Computer Science, MIT"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Years of Experience</Label>
                          <Input
                            value={member.experience}
                            onChange={(e) => updateNewFaculty(member.tempId, 'experience', e.target.value)}
                            placeholder="e.g., 15 years"
                          />
                        </div>
                      </div>

                      {/* Specialization and Expertise */}
                      <div className="space-y-2">
                        <Label>Specialization/Primary Area</Label>
                        <Input
                          value={member.specialization}
                          onChange={(e) => updateNewFaculty(member.tempId, 'specialization', e.target.value)}
                          placeholder="e.g., Machine Learning, Data Science"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Areas of Expertise (comma-separated)</Label>
                        <Input
                          value={Array.isArray(member.expertise) ? member.expertise.join(', ') : member.expertise || ''}
                          onChange={(e) => {
                            const expertiseArray = e.target.value.split(',').map(item => item.trim()).filter(item => item)
                            updateNewFaculty(member.tempId, 'expertise', expertiseArray)
                          }}
                          placeholder="e.g., Artificial Intelligence, Machine Learning, Computer Vision"
                        />
                        <p className="text-xs text-slate-500">Enter multiple areas separated by commas</p>
                      </div>

                      {/* Biography */}
                      <div className="space-y-2">
                        <Label>Biography</Label>
                        <Textarea
                          value={member.bio}
                          onChange={(e) => updateNewFaculty(member.tempId, 'bio', e.target.value)}
                          placeholder="Brief biography, achievements, research interests, and background"
                          className="min-h-[100px]"
                        />
                      </div>

                      {/* Featured Toggle */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`featured-${member.tempId}`}
                          checked={member.featured || false}
                          onChange={(e) => updateNewFaculty(member.tempId, 'featured', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`featured-${member.tempId}`} className="text-sm font-medium">
                          Feature this faculty member (display prominently)
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Faculty Button */}
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFaculty}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Faculty Member
                </Button>
              </div>

              {/* Save New Faculty Button */}
              {newFaculty.length > 0 && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={async () => {
                      setIsLoading(true)
                      try {
                        const validNewFaculty = newFaculty.filter(member =>
                          member.name.trim() !== '' &&
                          member.title.trim() !== '' &&
                          member.department.trim() !== '' &&
                          member.email.trim() !== ''
                        )

                        if (validNewFaculty.length === 0) {
                          toast({
                            title: "Info",
                            description: "Please fill in all required fields before saving.",
                          })
                          setIsLoading(false)
                          return
                        }

                        const response = await fetch('/api/institution/faculty', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            faculty: validNewFaculty.map(member => ({
                              name: member.name,
                              title: member.title,
                              department: member.department,
                              image: member.image,
                              expertise: member.expertise,
                              email: member.email,
                              bio: member.bio,
                              qualifications: member.qualifications,
                              experience: member.experience,
                              specialization: member.specialization,
                              featured: member.featured
                            }))
                          }),
                        })

                        if (!response.ok) {
                          throw new Error('Failed to save faculty')
                        }

                        toast({
                          title: "Success",
                          description: "New faculty members saved successfully!",
                        })

                        // Clear new faculty and refresh existing
                        setNewFaculty([])
                        await fetchFaculty()
                      } catch (error) {
                        console.error('Error saving new faculty:', error)
                        toast({
                          title: "Error",
                          description: "Failed to save new faculty members. Please try again.",
                          variant: "destructive",
                        })
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    disabled={isLoading || newFaculty.some(member => !member.name.trim() || !member.title.trim() || !member.department.trim() || !member.email.trim())}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Faculty Section'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  // Component for existing facility cards with edit functionality
  const ExistingFacilityCard = ({ facility, onUpdate }: { facility: any, onUpdate: () => void }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState(facility)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
      setIsSaving(true)
      try {
        // Validate required fields
        if (!editData.name.trim() || !editData.description.trim()) {
          toast({
            title: "Error",
            description: "Please fill in facility name and description.",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }

        const response = await fetch('/api/institution/facilities', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            facilities: [editData]
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update facility')
        }

        toast({
          title: "Success",
          description: "Facility updated successfully!",
        })

        setIsEditing(false)
        onUpdate() // Refresh the facilities list
      } catch (error) {
        console.error('Error updating facility:', error)
        toast({
          title: "Error",
          description: "Failed to update facility. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    }

    const handleCancel = () => {
      setEditData(facility) // Reset to original data
      setIsEditing(false)
    }

    if (isEditing) {
      return (
        <div className="p-6 border rounded-lg bg-blue-50 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-blue-900">Editing: {facility.name}</h4>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Facility Name</Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Main Library"
              />
            </div>

            <div className="space-y-2">
              <Label>Current Image</Label>
              {editData.images?.[0] && (
                <div className="mt-2">
                  <img 
                    src={editData.images[0]} 
                    alt="Facility" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Facility Description</Label>
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the facility"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Features</Label>
            {editData.features.map((feature: string, featureIndex: number) => (
              <div key={featureIndex} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...editData.features]
                    newFeatures[featureIndex] = e.target.value
                    setEditData(prev => ({ ...prev, features: newFeatures }))
                  }}
                  placeholder={`Feature ${featureIndex + 1}`}
                  className="flex-1"
                />
                {editData.features.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFeatures = editData.features.filter((_: any, i: number) => i !== featureIndex)
                      setEditData(prev => ({ ...prev, features: newFeatures }))
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newFeatures = [...editData.features, ""]
                setEditData(prev => ({ ...prev, features: newFeatures }))
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Learn More Link</Label>
            <Input
              value={editData.learnMoreLink || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, learnMoreLink: e.target.value }))}
              placeholder={`Learn more about ${editData.name || 'this facility'}`}
            />
          </div>
        </div>
      )
    }

    return (
      <div className="p-6 border rounded-lg bg-gray-50 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h4 className="font-semibold text-gray-900">{facility.name}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
            </div>

            <p className="text-gray-600 mb-3">{facility.description}</p>

            {facility.features && facility.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {facility.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {facility.learnMoreLink && (
              <a 
                href={facility.learnMoreLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn more about {facility.name}
              </a>
            )}
          </div>

          {facility.images?.[0] && (
            <div className="ml-4">
              <img 
                src={facility.images[0]} 
                alt={facility.name} 
                className="w-24 h-24 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderFacilitiesSection = () => {
    return (
      <Card ref={sectionRefs.facilities}>
        <CardHeader>
          <CardTitle>Facilities & Infrastructure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingFacilities ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading facilities...</p>
            </div>
          ) : (
            <>
              {/* Existing Facilities */}
              {existingFacilities.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Existing Facilities</h3>
                  {existingFacilities.map((facility) => (
                    <ExistingFacilityCard 
                      key={facility.id} 
                      facility={facility} 
                      onUpdate={fetchFacilities}
                    />
                  ))}
                </div>
              )}

              {/* New Facilities */}
              {newFacilities.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">New Facilities</h3>
                  {newFacilities.map((facility, index) => (
                    <div key={facility.tempId} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">New Facility {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeNewFacility(facility.tempId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Facility Name</Label>
                          <Input
                            value={facility.name}
                            onChange={(e) => updateNewFacility(facility.tempId, 'name', e.target.value)}
                            placeholder="e.g., Main Library"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Facility Image</Label>
                          <div className="space-y-2">
                            <div
                              className="w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.onchange = (e) => handleFacilityImageUpload(e as any, facility.tempId)
                                input.click()
                              }}
                            >
                              {facility.images?.[0] ? (
                                <img
                                  src={facility.images[0]}
                                  alt="Facility preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center">
                                  <Camera className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                  <p className="text-xs text-gray-500">Click to upload</p>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">Recommended: JPG, PNG up to 5MB</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Facility Description</Label>
                        <Textarea
                          value={facility.description}
                          onChange={(e) => updateNewFacility(facility.tempId, 'description', e.target.value)}
                          placeholder="Describe this facility"
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Features</Label>
                        {facility.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex gap-2">
                            <Input
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...facility.features]
                                newFeatures[featureIndex] = e.target.value
                                updateNewFacility(facility.tempId, 'features', newFeatures)
                              }}
                              placeholder={`Feature ${featureIndex + 1}`}
                              className="flex-1"
                            />
                            {facility.features.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newFeatures = facility.features.filter((_, i) => i !== featureIndex)
                                  updateNewFacility(facility.tempId, 'features', newFeatures)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newFeatures = [...facility.features, ""]
                            updateNewFacility(facility.tempId, 'features', newFeatures)
                          }}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Feature
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Learn More Link</Label>
                        <Input
                          value={facility.learnMoreLink || ''}
                          onChange={(e) => updateNewFacility(facility.tempId, 'learnMoreLink', e.target.value)}
                          placeholder="Optional link for more information"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Facility Button */}
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFacility}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Facility
                </Button>
              </div>

              {/* Save New Facilities Button */}
              {newFacilities.length > 0 && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={async () => {
                      setIsLoading(true)
                      try {
                        const validNewFacilities = newFacilities.filter(facility =>
                          facility.name.trim() !== '' &&
                          facility.description.trim() !== ''
                        )

                        if (validNewFacilities.length === 0) {
                          toast({
                            title: "Info",
                            description: "Please fill in facility name and description before saving.",
                          })
                          setIsLoading(false)
                          return
                        }

                        const response = await fetch('/api/institution/facilities', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            facilities: validNewFacilities.map(f => ({
                              name: f.name,
                              description: f.description,
                              features: f.features.filter(feature => feature.trim() !== ''),
                              images: f.images.filter(image => image.trim() !== ''),
                              learnMoreLink: f.learnMoreLink
                            }))
                          }),
                        })

                        if (!response.ok) {
                          throw new Error('Failed to save facilities')
                        }

                        toast({
                          title: "Success",
                          description: "New facilities saved successfully!",
                        })

                        // Clear new facilities and refresh existing
                        setNewFacilities([])
                        await fetchFacilities()
                      } catch (error) {
                        console.error('Error saving new facilities:', error)
                        toast({
                          title: "Error",
                          description: "Failed to save new facilities. Please try again.",
                          variant: "destructive",
                        })
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    disabled={isLoading || newFacilities.some(f => !f.name.trim() || !f.description.trim())}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save New Facilities'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderEventsSection = () => (
    <Card ref={sectionRefs.events}>
      <CardHeader>
        <CardTitle>Events & Programs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingEvents ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading events...</p>
          </div>
        ) : (
          formData.events.map((event, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Event {index + 1}</h4>
                {formData.events.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEvent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input
                    value={event.title}
                    onChange={(e) => updateEvent(index, 'title', e.target.value)}
                    placeholder="e.g., Annual Tech Conference"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select
                    value={event.eventType}
                    onValueChange={(value) => updateEvent(index, 'eventType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="exhibition">Exhibition</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="social">Social Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={event.startDate}
                    onChange={(e) => updateEvent(index, 'startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={event.endDate}
                    onChange={(e) => updateEvent(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={event.description}
                  onChange={(e) => updateEvent(index, 'description', e.target.value)}
                  placeholder="Describe the event and what participants can expect"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={event.location}
                    onChange={(e) => updateEvent(index, 'location', e.target.value)}
                    placeholder="e.g., Main Auditorium, Online"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Registration URL (Optional)</Label>
                  <Input
                    value={event.registrationUrl}
                    onChange={(e) => updateEvent(index, 'registrationUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Event Image</Label>
                <div
                  className="w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        try {
                          // Create immediate preview URL
                          const previewUrl = URL.createObjectURL(file)
                          updateEvent(index, 'imageUrl', previewUrl)

                          // Upload to server
                          const uploadData = new FormData()
                          uploadData.append('file', file)

                          const response = await fetch('/api/upload/institution-event', {
                            method: 'POST',
                            body: uploadData
                          })

                          if (response.ok) {
                            const data = await response.json()
                            // Clean up the preview URL
                            URL.revokeObjectURL(previewUrl)

                            // Update with server URL
                            updateEvent(index, 'imageUrl', data.url)

                            toast({
                              title: "Success",
                              description: "Event image uploaded successfully!",
                            })
                          } else {
                            console.error('Failed to upload event image')
                            // Clean up the preview URL on error
                            URL.revokeObjectURL(previewUrl)
                            // Reset to empty
                            updateEvent(index, 'imageUrl', '')

                            toast({
                              title: "Error",
                              description: "Failed to upload event image. Please try again.",
                              variant: "destructive",
                            })
                          }
                        } catch (error) {
                          console.error('Error uploading event image:', error)
                          toast({
                            title: "Error",
                            description: "Failed to upload event image. Please try again.",
                            variant: "destructive",
                          })
                        }
                      }
                    }
                    input.click()
                  }}
                >
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt="Event preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Click to upload event image</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Recommended: JPG, PNG up to 5MB</p>
              </div>
            </div>
          ))
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addEvent}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>

        {/* Save Button for Events Section */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={saveEventsSection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Events Section'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderGallerySection = () => (
    <Card ref={sectionRefs.gallery}>
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingGallery ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading gallery...</p>
          </div>
        ) : (
          <>
            {/* Existing Gallery Images */}
            {existingGallery.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Existing Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {existingGallery.map((item) => (
                    <div key={item.id} className="group relative rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={item.imageUrl} 
                        alt={item.caption || "Gallery image"} 
                        className="w-full h-48 object-cover" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/institution/gallery?imageId=${item.id}`, {
                                method: 'DELETE'
                              })
                              if (response.ok) {
                                toast({
                                  title: "Success",
                                  description: "Image deleted successfully!",
                                })
                                fetchGallery() // Refresh gallery
                              }
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to delete image.",
                                variant: "destructive",
                              })
                            }
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-sm text-gray-700 truncate">{item.caption || "No caption"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Gallery Items */}
            {newGalleryItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">New Gallery Items</h3>
                {newGalleryItems.map((item, index) => (
                  <div key={item.tempId} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">New Gallery Item {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeNewGalleryItem(item.tempId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Gallery Image</Label>
                        <div
                          className="w-full h-48 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = (e) => handleGalleryImageUpload(e as any, item.tempId)
                            input.click()
                          }}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt="Gallery preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Click to upload image</p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Recommended: JPG, PNG up to 5MB</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Caption</Label>
                        <Textarea
                          value={item.caption}
                          onChange={(e) => updateNewGalleryItem(item.tempId, 'caption', e.target.value)}
                          placeholder="Describe this image"
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Gallery Item Button */}
            <div className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={addGalleryItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Gallery Item
              </Button>
            </div>

            {/* Save New Gallery Items Button */}
            {newGalleryItems.length > 0 && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      const validGalleryItems = newGalleryItems.filter(item =>
                        item.imageUrl.trim() !== '' &&
                        item.caption.trim() !== ''
                      )

                      if (validGalleryItems.length === 0) {
                        toast({
                          title: "Info",
                          description: "Please upload images and add captions before saving.",
                        })
                        setIsLoading(false)
                        return
                      }

                      const response = await fetch('/api/institution/gallery', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          images: validGalleryItems.map(item => ({
                            url: item.imageUrl,
                            caption: item.caption
                          }))
                        }),
                      })

                      if (!response.ok) {
                        throw new Error('Failed to save gallery items')
                      }

                      toast({
                        title: "Success",
                        description: "Gallery items saved successfully!",
                      })

                      // Clear new items and refresh existing
                      setNewGalleryItems([])
                      await fetchGallery()
                    } catch (error) {
                      console.error('Error saving gallery items:', error)
                      toast({
                        title: "Error",
                        description: "Failed to save gallery items. Please try again.",
                        variant: "destructive",
                      })
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  disabled={isLoading || newGalleryItems.some(item => !item.imageUrl.trim() || !item.caption.trim())}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Gallery Items'}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarStyle }} />
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="sticky top-24">
            <nav className="space-y-2">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeSection === id
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div 
              id="form-container" 
              className="space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto pr-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {renderAboutSection()}
              {renderQuickFactsSection()}
              {renderContactInfoSection()}
              {renderProgramsSection()}
              {renderFacultySection()}
              {renderFacultyStatsSection()}
              {renderFacilitiesSection()}
              {renderEventsSection()}
              {renderGallerySection()}


            </div>
          </form>
        </div>
      </div>
    </>
  )
}