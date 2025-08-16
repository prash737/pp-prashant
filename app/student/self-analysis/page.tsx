"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Send, Loader2, User, Target, BookOpen, Award, Lightbulb, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { 
  Award, 
  BookOpen, 
  Users, 
  TrendingUp,
  Brain,
  Sparkles,
  Loader2,
  Search,
  UserPlus,
  ExternalLink
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentData {
  profile: any
  interests: any[]
  skills: any[]
  educationHistory: any[]
  achievements: any[]
  goals: any[]
}

export default function SelfAnalysisPage() {
  const { user, loading, profileData, profileDataLoading } = useAuth()
  const router = useRouter()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [query, setQuery] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  // isLoading state variable is missing from original code, defining it here to prevent runtime errors.
  const [isLoading, setIsLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false)
  const [showConnectionSearch, setShowConnectionSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)


  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'student') {
      router.push('/feed')
      return
    }

    // Use cached data if available, otherwise fetch
    if (profileData) {
      console.log('🚀 Using cached profile data for self-analysis')
      setStudentData(profileData)
    } else if (!profileDataLoading) {
      fetchStudentData()
    }
  }, [user, loading, router, profileData, profileDataLoading])

  // Parse analysis into sections and consolidate short content
  const parseAnalysisIntoSections = (text: string) => {
    const sections = [];

    // Split by major headers (## pattern)
    const majorSections = text.split(/## (.*?)$/gm);

    for (let i = 1; i < majorSections.length; i += 2) {
      const title = majorSections[i].trim();
      const content = majorSections[i + 1] || '';

      if (title && content.trim()) {
        sections.push({
          title: title,
          content: content.trim()
        });
      }
    }

    // If no major sections found, try to split by other patterns
    if (sections.length === 0) {
      const fallbackSections = text.split(/### (.*?)$/gm);
      for (let i = 1; i < fallbackSections.length; i += 2) {
        const title = fallbackSections[i].trim();
        const content = fallbackSections[i + 1] || '';

        if (title && content.trim()) {
          sections.push({
            title: title,
            content: content.trim()
          });
        }
      }
    }

    // If still no sections, create a single section
    if (sections.length === 0) {
      sections.push({
        title: 'Analysis Results',
        content: text
      });
    }

    // Consolidate sections with less than 10 words
    const consolidatedSections = [];
    let i = 0;

    while (i < sections.length) {
      const currentSection = sections[i];
      const wordCount = currentSection.content.split(/\s+/).length;

      if (wordCount < 10 && i < sections.length - 1) {
        // Merge with next section
        const nextSection = sections[i + 1];
        consolidatedSections.push({
          title: currentSection.title,
          content: currentSection.content + '\n\n' + nextSection.content
        });
        i += 2; // Skip the next section as it's been merged
      } else {
        consolidatedSections.push(currentSection);
        i++;
      }
    }

    return consolidatedSections;
  };

  // Get icon for section based on title
  const getSectionIcon = (title: string) => {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('insight') || titleLower.includes('overview')) {
      return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    } else if (titleLower.includes('strength') || titleLower.includes('skills')) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (titleLower.includes('improvement') || titleLower.includes('gap') || titleLower.includes('weakness')) {
      return <Target className="h-5 w-5 text-orange-500" />;
    } else if (titleLower.includes('career') || titleLower.includes('path') || titleLower.includes('recommendation')) {
      return <Award className="h-5 w-5 text-blue-500" />;
    } else if (titleLower.includes('goal') || titleLower.includes('future')) {
      return <Target className="h-5 w-5 text-purple-500" />;
    } else if (titleLower.includes('education') || titleLower.includes('learning')) {
      return <BookOpen className="h-5 w-5 text-indigo-500" />;
    } else {
      return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  // Format analysis text with proper HTML formatting
  // Toggle expanded state for sections
  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const formatAnalysisText = (text: string) => {
    return text
      // Convert markdown-style headers to HTML
      .replace(/#### (.*?)$/gm, '<h4 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-3 flex items-center"><span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>$1</h4>')
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-bold text-purple-600 dark:text-purple-400 mt-8 mb-4 flex items-center"><span class="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-10 mb-6 border-l-4 border-purple-500 pl-4">$1</h2>')

      // Convert bullet points to styled lists
      .replace(/- \*\*(.*?)\*\*: (.*?)$/gm, '<div class="flex items-start space-x-3 mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400"><div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div><div><span class="font-semibold text-blue-700 dark:text-blue-300">$1:</span> <span class="text-gray-700 dark:text-gray-300">$2</span></div></div>')
      .replace(/- (.*?)$/gm, '<div class="flex items-start space-x-3 mb-3"><div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div><span class="text-gray-700 dark:text-gray-300">$1</span></div>')

      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')

      // Convert numbered lists
      .replace(/(\d+)\. (.*?)$/gm, '<div class="flex items-start space-x-3 mb-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"><div class="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full flex-shrink-0">$1</div><span class="text-gray-700 dark:text-gray-300">$2</span></div>')

      // Convert line breaks to proper spacing
      .replace(/\n\n/g, '<div class="my-4"></div>')
      .replace(/\n/g, '<br/>')
  }

  // Helper function to get cookies, assumed to be available in the context.
  // If getCookie is not defined, it needs to be imported or defined.
  // For this example, assuming getCookie is defined elsewhere and accessible.
  const getCookie = async (name: string): Promise<string | undefined> => {
    if (typeof document === 'undefined') return undefined; // Avoid running in server-side rendering
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return undefined;
  }

  const fetchStudentData = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Fetching student data for self-analysis...')

      // Get current user ID first
      const userResponse = await fetch('/api/auth/user', {
        credentials: 'include'
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data')
      }

      const userData = await userResponse.json()
      const userId = userData.user?.id

      if (!userId) {
        throw new Error('User ID not found')
      }

      console.log('👤 User ID:', userId)

      // Fetch all data in parallel
      const [interestsRes, skillsRes, educationRes, achievementsRes, goalsRes] = await Promise.all([
        fetch('/api/user/interests', { credentials: 'include' }),
        fetch('/api/user/skills', { credentials: 'include' }),
        fetch('/api/education', { credentials: 'include' }),
        fetch(`/api/student/profile/${userId}/achievements`, { credentials: 'include' }),
        fetch(`/api/student/profile/${userId}/goals`, { credentials: 'include' })
      ])

      // Parse responses
      const [interests, skills, educationHistory, achievementsData, goalsData] = await Promise.all([
        interestsRes.ok ? interestsRes.json() : { interests: [] },
        skillsRes.ok ? skillsRes.json() : { skills: [] },
        educationRes.ok ? educationRes.json() : { educationHistory: [] },
        achievementsRes.ok ? achievementsRes.json() : { achievements: [] },
        goalsRes.ok ? goalsRes.json() : { goals: [] }
      ])

      console.log('🎯 Raw goals response:', goalsData)
      console.log('🏆 Raw achievements response:', achievementsData)

      // Extract goals and achievements with detailed logging
      const extractedGoals = goalsData.goals || goalsData || []
      const extractedAchievements = achievementsData.achievements || achievementsData || []

      console.log('📊 Extracted goals:', extractedGoals, 'Length:', extractedGoals.length)
      console.log('📊 Extracted achievements:', extractedAchievements, 'Length:', extractedAchievements.length)

      const compiledData = {
        profile: userData.profile || userData.user,
        interests: interests.interests || [],
        skills: skills.skills || [],
        educationHistory: educationHistory.educationHistory || [],
        achievements: extractedAchievements,
        goals: extractedGoals
      }

      console.log('✅ Compiled student data:', compiledData)
      console.log('🔍 Final goals count:', compiledData.goals.length)
      console.log('🔍 Final achievements count:', compiledData.achievements.length)
      setStudentData(compiledData)

    } catch (error) {
      console.error('❌ Error fetching student data:', error)
      toast({
        title: "Error",
        description: "Failed to load your profile data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalysis = async () => {
    if (!query.trim() || !studentData) {
      toast.error('Please enter your question')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/self-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          studentData
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysis(result.analysis)
      toast.success('Analysis complete!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze your profile. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Function to process AI response and replace placeholders with interactive buttons
  const processAIResponse = (response: string) => {
    return response
      .replace(/\[connection\]/g, '<button class="ai-connection-btn inline-flex items-center px-3 py-1 mx-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors cursor-pointer">🔗 Connect</button>')
      .replace(/\[goals\]/g, '<button class="ai-goals-btn inline-flex items-center px-3 py-1 mx-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors cursor-pointer">🎯 Add Goals</button>')
  }

  // Function to handle button clicks in AI response
  const handleAIButtonClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement

    if (target.classList.contains('ai-connection-btn')) {
      setShowConnectionSearch(true)
    } else if (target.classList.contains('ai-goals-btn')) {
      router.push('/student/profile/edit?section=goals')
    }
  }

  const generateAIAnalysis = async () => {
    if (!studentData) {
      toast.error("Student data not available.")
      return;
    }

    setGeneratingAnalysis(true);
    try {
      const prompt = `
        You are PathPiper's AI assistant helping students with self-analysis and growth recommendations.

        Based on this student's profile data:
        ${JSON.stringify(studentData, null, 2)}

        Provide personalized recommendations for:
        1. Career paths that align with their interests and skills
        2. Learning opportunities and skill development suggestions
        3. Goal-setting recommendations based on their current achievements
        4. Networking and connection opportunities
        5. Personal growth areas to focus on

        IMPORTANT PLACEHOLDERS TO USE:
        - When suggesting to connect with people, mentors, or anyone, end that suggestion with "[connection]"
        - When suggesting to add or set goals, end that suggestion with "[goals]"

        Keep recommendations practical, actionable, and age-appropriate for a student.
        Format your response in a clear, encouraging tone with specific next steps they can take.
        `

      const response = await fetch('/api/self-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI analysis');
      }

      const result = await response.json();
      console.log('✅ AI Analysis received:', result.analysis)

      // Process the analysis to replace placeholders with interactive elements
      const processedAnalysis = processAIResponse(result.analysis)
      setAiAnalysis(processedAnalysis)
      toast.success('AI analysis generated successfully!')

    } catch (error) {
      console.error('Error generating AI analysis:', error)
      toast.error('Failed to generate AI analysis. Please try again.')
    } finally {
      setGeneratingAnalysis(false)
    }
  }

  // Search users function (similar to navbar)
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const users = await response.json()
        setSearchResults(users)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Handle connection request
  const sendConnectionRequest = async (receiverId: string) => {
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          message: `Hi! I'd like to connect with you on PathPiper.`,
        }),
      })

      if (response.ok) {
        // Remove user from search results after sending request
        setSearchResults(prev => prev.filter(user => user.id !== receiverId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send connection request')
      }
    } catch (error) {
      console.error('Error sending connection request:', error)
      alert('Failed to send connection request')
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])


  if (loading || (profileDataLoading && !studentData)) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile data...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <style jsx global>{`
          .analysis-content h2 {
            border-left: 4px solid #8b5cf6;
            padding-left: 1rem;
            margin: 2rem 0 1.5rem 0;
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
          }
          .dark .analysis-content h2 {
            color: #f3f4f6;
          }
          .analysis-content h3 {
            margin: 2rem 0 1rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #7c3aed;
            display: flex;
            align-items: center;
          }
          .dark .analysis-content h3 {
            color: #a78bfa;
          }
          .analysis-content h4 {
            margin: 1.5rem 0 0.75rem 0;
            font-size: 1.125rem;
            font-weight: 600;
            color: #2563eb;
            display: flex;
            align-items: center;
          }
          .dark .analysis-content h4 {
            color: #60a5fa;
          }

          /* Custom scrollbar styles */
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
            background-color: #d1d5db;
            border-radius: 0.375rem;
          }
          .dark .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
            background-color: #4b5563;
          }
          .scrollbar-track-transparent::-webkit-scrollbar-track {
            background-color: transparent;
          }
          ::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #d1d5db;
            border-radius: 0.375rem;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .dark ::-webkit-scrollbar-thumb {
            background-color: #4b5563;
          }
          ::-webkit-scrollbar-thumb:hover {
            background-color: #9ca3af;
          }
          .dark ::-webkit-scrollbar-thumb:hover {
            background-color: #6b7280;
          }
        `}</style>
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                AI Self Analysis
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get personalized insights about your academic journey, skills, and goals. Our AI analyzes your complete profile to provide tailored guidance and recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Summary */}
              <div className="lg:col-span-1">
                <Card className="h-fit sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Summary
                    </CardTitle>
                    <CardDescription>
                      Your cached profile data for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Basic Information</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {studentData?.profile?.firstName} {studentData?.profile?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{studentData?.profile?.bio || 'No bio available'}</p>
                    </div>

                    {/* Interests */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        Interests ({Array.isArray(studentData?.interests) ? studentData.interests.length : 0})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(studentData?.interests) && studentData.interests.slice(0, 6).map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest.name || interest.interest?.name}
                          </Badge>
                        ))}
                        {Array.isArray(studentData?.interests) && studentData.interests.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{studentData.interests.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Skills ({Array.isArray(studentData?.skills) ? studentData.skills.length : 0})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(studentData?.skills) && studentData.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {skill.name || skill.skill?.name}
                          </Badge>
                        ))}
                        {Array.isArray(studentData?.skills) && studentData.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{studentData.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Education ({Array.isArray(studentData?.educationHistory) ? studentData.educationHistory.length : 0})
                      </h4>
                      {Array.isArray(studentData?.educationHistory) && studentData.educationHistory.length > 0 ? (
                        <div className="space-y-2">
                          {studentData.educationHistory.slice(0, 2).map((edu, index) => (
                            <div key={index} className="text-xs">
                              <p className="font-medium">{edu.institutionName}</p>
                              <p className="text-gray-500">{edu.degreeProgram}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No education history added</p>
                      )}
                    </div>

                    {/* Goals & Achievements */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Goals
                        </h4>
                        <p className="text-xs text-gray-500">{(studentData?.goals || []).length} goals set</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          Achievements
                        </h4>
                        <p className="text-xs text-gray-500">{(studentData?.achievements || []).length} achievements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Interface */}
              <div className="lg:col-span-2 space-y-6">
                {/* Query Input */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ask for Analysis</CardTitle>
                    <CardDescription>
                      Ask any question about your academic journey, career prospects, skill gaps, or get recommendations based on your profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("Analyze my skills and suggest areas for improvement based on my goals.")}
                        className="text-left justify-start"
                      >
                        Skill Gap Analysis
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("What career paths align with my interests and current education?")}
                        className="text-left justify-start"
                      >
                        Career Recommendations
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("How can I improve my profile to achieve my goals faster?")}
                        className="text-left justify-start"
                      >
                        Profile Enhancement
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("Give me a reality check - where do I stand in my academic journey?")}
                        className="text-left justify-start"
                      >
                        Reality Check
                      </Button>
                    </div>

                    <Textarea
                      placeholder="Type your question here... For example: 'What are my strengths and weaknesses?', 'How can I improve my profile?', 'What career paths suit me best?'"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />

                    <div className="flex gap-4">
                      <Button
                        onClick={generateAIAnalysis}
                        disabled={generatingAnalysis}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                      >
                        {generatingAnalysis ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Get AI Analysis
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleAnalysis}
                        disabled={!query.trim() || isAnalyzing}
                        className="w-full"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing... (30-60s)
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Get Text Analysis
                          </>
                        )}
                      </Button>
                    </div>


                    {generatingAnalysis && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          🤖 AI is processing your profile data... This usually takes 30-60 seconds for detailed analysis.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                {analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        AI Analysis Results
                      </CardTitle>
                      <CardDescription>
                        Personalized insights based on your complete profile - Click on titles to expand
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          // Parse the analysis into sections with content consolidation
                          const sections = parseAnalysisIntoSections(analysis);
                          return sections.map((section, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              {/* Collapsible Header */}
                              <button
                                onClick={() => toggleSection(index)}
                                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {getSectionIcon(section.title)}
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {section.title}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                                  <svg
                                    className={`h-5 w-5 text-gray-500 transform transition-transform ${
                                      expandedSections.has(index) ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </button>

                              {/* Collapsible Content */}
                              {expandedSections.has(index) && (
                                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                                  <div className="pt-4 space-y-3">
                                    <div
                                      className="analysis-content text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: formatAnalysisText(section.content)
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ));
                        })()}

                        {/* Expand All / Collapse All Controls */}
                        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => {
                              const sections = parseAnalysisIntoSections(analysis);
                              setExpandedSections(new Set(Array.from({ length: sections.length }, (_, i) => i)));
                            }}
                            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                          >
                            Expand All
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <button
                            onClick={() => setExpandedSections(new Set())}
                            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                          >
                            Collapse All
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Generated Analysis Result */}
                {aiAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        AI Generated Insights
                      </CardTitle>
                      <CardDescription>
                        Actionable insights and recommendations from our AI assistant. Click on interactive elements to proceed.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <div 
                          className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: aiAnalysis }}
                          onClick={handleAIButtonClick}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Tips for better analysis:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Be specific about what you want to know</li>
                      <li>• Ask about skill gaps, career alignment, or improvement areas</li>
                      <li>• Complete your profile sections for more accurate insights</li>
                      <li>• Ask follow-up questions to dive deeper into recommendations</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />

        {/* Connection Search Dialog */}
        <Dialog open={showConnectionSearch} onOpenChange={setShowConnectionSearch}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect with Others</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Search for users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="col-span-3"
              />
              {searchLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={user.avatarUrl || ""} alt={user.firstName} />
                          <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                      <Button size="sm" onClick={() => sendConnectionRequest(user.id)} className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                        <UserPlus className="h-4 w-4 mr-1" /> Connect
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No users found.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedLayout>
  )
}