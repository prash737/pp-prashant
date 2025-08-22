"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Send, Loader2, Users, Target, BookOpen, Award, Lightbulb, TrendingUp, GraduationCap } from "lucide-react"
import { toast } from "sonner"

interface InstitutionData {
  profile: any
  programs: any[]
  faculty: any[]
  facilities: any[]
  events: any[]
  gallery: any[]
  followers: number
}

export default function InstitutionSelfAnalysisPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null)
  const [query, setQuery] = useState("")
  const [analysis, setAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentTokenUsage, setCurrentTokenUsage] = useState<any>(null)
  const [totalTokenUsage, setTotalTokenUsage] = useState<any>(null)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'institution') {
      router.push('/feed')
      return
    }

    fetchInstitutionData()
    fetchTotalTokenUsage()
  }, [user, loading, router])

  // Parse analysis into sections for horizontal layout
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

    return sections;
  };

  // Get icon for section based on title
  const getSectionIcon = (title: string) => {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('insight') || titleLower.includes('overview')) {
      return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    } else if (titleLower.includes('strength') || titleLower.includes('advantage')) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (titleLower.includes('improvement') || titleLower.includes('gap') || titleLower.includes('weakness')) {
      return <Target className="h-5 w-5 text-orange-500" />;
    } else if (titleLower.includes('marketing') || titleLower.includes('attraction') || titleLower.includes('recommendation')) {
      return <Award className="h-5 w-5 text-blue-500" />;
    } else if (titleLower.includes('program') || titleLower.includes('curriculum')) {
      return <GraduationCap className="h-5 w-5 text-purple-500" />;
    } else if (titleLower.includes('student') || titleLower.includes('enrollment')) {
      return <Users className="h-5 w-5 text-indigo-500" />;
    } else {
      return <Building2 className="h-5 w-5 text-purple-500" />;
    }
  };

  // Format analysis text with proper HTML formatting
  const formatAnalysisText = (text: string) => {
    return text
      // Convert markdown-style headers to HTML
      .replace(/#### (.*?)$/gm, '<h4 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-3 flex items-center"><span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>$1</h4>')
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-bold text-purple-600 dark:text-purple-400 mt-8 mb-4 flex items-center"><span class="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-10 mb-6 border-l-4 border-purple-500 pl-4">$1</h2>')

      // Convert bullet points to styled lists
      .replace(/- \*\*(.*?)\*\*: (.*?)$/gm, '<div class="flex items-start space-x-3 mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400"><div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div><div><span class="font-semibold text-blue-700 dark:text-blue-300">$1:</span> <span class="text-gray-700 dark:text-gray-300">$2</span></div></div>')
      .replace(/- (.*?)$/gm, '<div class="flex items-start space-x-3 mb-2"><div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div><span class="text-gray-700 dark:text-gray-300">$1</span></div>')

      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')

      // Convert numbered lists
      .replace(/(\d+)\. (.*?)$/gm, '<div class="flex items-start space-x-3 mb-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"><div class="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full flex-shrink-0">$1</div><span class="text-gray-700 dark:text-gray-300">$2</span></div>')

      // Convert line breaks to proper spacing
      .replace(/\n\n/g, '<div class="my-4"></div>')
      .replace(/\n/g, '<br/>')
  }

  const fetchInstitutionData = async () => {
    try {
      console.log('⚠️ Fetching institution profile data')

      // Fetch all data in parallel using the same approach as institution profile page
      const [profileResponse, programsResponse, facultyResponse, facilitiesResponse, eventsResponse, galleryResponse, followersResponse] = await Promise.all([
        fetch('/api/institution/profile'),
        fetch('/api/institution/programs'),
        fetch('/api/institution/faculty'),
        fetch('/api/institution/facilities'),
        fetch('/api/institution/events'),
        fetch('/api/institution/gallery'),
        fetch('/api/institutions/followers')
      ])

      const [profileData, programsData, facultyData, facilitiesData, eventsData, galleryData, followersData] = await Promise.all([
        profileResponse.ok ? profileResponse.json() : { profile: null },
        programsResponse.ok ? programsResponse.json() : { programs: [] },
        facultyResponse.ok ? facultyResponse.json() : { faculty: [] },
        facilitiesResponse.ok ? facilitiesResponse.json() : { facilities: [] },
        eventsResponse.ok ? eventsResponse.json() : { events: [] },
        galleryResponse.ok ? galleryResponse.json() : { gallery: [] },
        followersResponse.ok ? followersResponse.json() : { followers: [] }
      ])

      const institutionData: InstitutionData = {
        profile: {
          ...profileData.profile,
          institutionName: profileData.profile?.institutionName || 'Institution',
          institutionType: profileData.profile?.institutionType || 'Educational Institution',
          website: profileData.profile?.website,
          description: profileData.profile?.bio || profileData.profile?.overview || '',
          verified: profileData.profile?.verified || false
        },
        programs: programsData.programs || [],
        faculty: facultyData.faculty || [],
        facilities: facilitiesData.facilities || [],
        events: eventsData.events || [],
        gallery: galleryData.gallery || [],
        followers: followersData?.followers?.length || 0
      }

      setInstitutionData(institutionData)
      console.log('📦 Institution data loaded:', {
        programs: institutionData.programs.length,
        faculty: institutionData.faculty.length,
        facilities: institutionData.facilities.length,
        events: institutionData.events.length,
        gallery: institutionData.gallery.length,
        followers: institutionData.followers
      })
    } catch (error) {
      console.error('Error fetching institution data:', error)
      toast.error('Failed to load your institution profile data')
    }
  }

  const handleAnalysis = async () => {
    if (!query.trim() || !institutionData) {
      toast.error('Please enter your question')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/institution/self-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          institutionData
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysis(result.analysis)
      setCurrentTokenUsage(result.tokenUsage) // Assuming the API returns tokenUsage
      toast.success('Analysis complete!')

      // Refetch total token usage to reflect the latest usage
      fetchTotalTokenUsage()
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze your institution profile. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const fetchTotalTokenUsage = async () => {
    try {
      if (!user?.id) return

      const response = await fetch(`/api/token-usage?user_id=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setTotalTokenUsage(data)
      }
    } catch (error) {
      console.error('Failed to fetch total token usage:', error)
    }
  }


  if (loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <InstitutionNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your institution data...</p>
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
        <InstitutionNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                AI Institution Analysis
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get personalized insights about your institution's profile, programs, and student attraction strategies. Our AI analyzes your complete institutional data to provide tailored recommendations for growth.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Institution Summary */}
              <div className="lg:col-span-1">
                <Card className="h-fit sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Institution Summary
                    </CardTitle>
                    <CardDescription>
                      Your institution profile data for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Basic Information</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {institutionData?.profile?.institutionName}
                      </p>
                      <p className="text-xs text-gray-500">{institutionData?.profile?.institutionType}</p>
                      <p className="text-xs text-gray-500">{institutionData?.profile?.description || 'No description available'}</p>
                      {institutionData?.profile?.verified && (
                        <Badge variant="default" className="text-xs mt-1">Verified</Badge>
                      )}
                    </div>

                    {/* Programs */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        Programs ({Array.isArray(institutionData?.programs) ? institutionData.programs.length : 0})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(institutionData?.programs) && institutionData.programs.slice(0, 4).map((program, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {program.name || program.title}
                          </Badge>
                        ))}
                        {Array.isArray(institutionData?.programs) && institutionData.programs.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{institutionData.programs.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Faculty */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Faculty ({Array.isArray(institutionData?.faculty) ? institutionData.faculty.length : 0})
                      </h4>
                      {Array.isArray(institutionData?.faculty) && institutionData.faculty.length > 0 ? (
                        <div className="space-y-2">
                          {institutionData.faculty.slice(0, 2).map((faculty, index) => (
                            <div key={index} className="text-xs">
                              <p className="font-medium">{faculty.name}</p>
                              <p className="text-gray-500">{faculty.designation}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No faculty members added</p>
                      )}
                    </div>

                    {/* Facilities & Events */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Facilities
                        </h4>
                        <p className="text-xs text-gray-500">{Array.isArray(institutionData?.facilities) ? institutionData.facilities.length : 0} facilities</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          Events
                        </h4>
                        <p className="text-xs text-gray-500">{Array.isArray(institutionData?.events) ? institutionData.events.length : 0} events</p>
                      </div>
                    </div>

                    {/* Followers */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Student Following
                      </h4>
                      <p className="text-xs text-gray-500">{institutionData?.followers || 0} student followers</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Interface */}
              <div className="lg:col-span-2 space-y-6">
                {/* Query Input */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ask for Institution Analysis</CardTitle>
                    <CardDescription>
                      Ask any question about your institution's student attraction strategies, program improvements, marketing approach, or get recommendations based on your current offerings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("How can we attract more students to our institution? What are our competitive advantages?")}
                        className="text-left justify-start"
                      >
                        Student Attraction Strategy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("Analyze our programs and suggest improvements or new programs to add.")}
                        className="text-left justify-start"
                      >
                        Program Enhancement
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("What marketing strategies would work best for our institution type and location?")}
                        className="text-left justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                      >
                        Marketing Recommendations
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery("Compare our institution profile with industry standards and suggest areas for improvement.")}
                        className="text-left justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                      >
                        Competitive Analysis
                      </Button>
                    </div>

                    <Textarea
                      placeholder="Type your question here... For example: 'How can we improve our student enrollment?', 'What programs should we add?', 'How to enhance our institution's reputation?'"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />

                    <Button 
                      onClick={handleAnalysis}
                      disabled={!query.trim() || isAnalyzing}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing... (30-60s)
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Get AI Analysis
                        </>
                      )}
                    </Button>

                    {isAnalyzing && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          🤖 AI is analyzing your institution data... This usually takes 30-60 seconds for detailed recommendations.
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
                        <Building2 className="h-5 w-5 text-purple-600" />
                        AI Institution Analysis Results
                      </CardTitle>
                      <CardDescription>
                        Personalized insights based on your complete institution profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Token Usage Display */}
                      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Token Usage</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Current Prompt Tokens:</p>
                            <p className="font-medium text-gray-900 dark:text-white">{currentTokenUsage?.prompt_tokens || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Current Response Tokens:</p>
                            <p className="font-medium text-gray-900 dark:text-white">{currentTokenUsage?.response_tokens || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Model Used:</p>
                            <p className="font-medium text-gray-900 dark:text-white">{currentTokenUsage?.model_name || 'N/A'}</p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Total Prompt Tokens (All Time):</p>
                            <p className="font-medium text-gray-900 dark:text-white">{totalTokenUsage?.total_prompt_tokens || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Total Response Tokens (All Time):</p>
                            <p className="font-medium text-gray-900 dark:text-white">{totalTokenUsage?.total_response_tokens || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {(() => {
                          // Parse the analysis into sections and merge small sections
                          const rawSections = parseAnalysisIntoSections(analysis);
                          const mergedSections = [];

                          for (let i = 0; i < rawSections.length; i++) {
                            const section = rawSections[i];
                            const wordCount = section.content.split(/\s+/).length;

                            // If section has less than 10 words, merge with next section
                            if (wordCount < 10 && i < rawSections.length - 1) {
                              const nextSection = rawSections[i + 1];
                              mergedSections.push({
                                title: section.title,
                                content: section.content + "\n\n" + nextSection.content
                              });
                              i++; // Skip the next section as it's merged
                            } else if (wordCount < 10 && mergedSections.length > 0) {
                              // Merge with previous section if it's the last one
                              const lastSection = mergedSections[mergedSections.length - 1];
                              lastSection.content += "\n\n**" + section.title + ":** " + section.content;
                            } else {
                              mergedSections.push(section);
                            }
                          }

                          return mergedSections.map((section, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <div 
                                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-xl"
                                onClick={() => {
                                  const content = document.getElementById(`section-content-${index}`);
                                  const icon = document.getElementById(`section-icon-${index}`);
                                  if (content && icon) {
                                    const isHidden = content.style.display === 'none' || !content.style.display;
                                    content.style.display = isHidden ? 'block' : 'none';
                                    icon.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {getSectionIcon(section.title)}
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {section.title}
                                    </h3>
                                  </div>
                                  <div 
                                    id={`section-icon-${index}`}
                                    className="transition-transform duration-200"
                                  >
                                    <svg 
                                      className="w-5 h-5 text-gray-500" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-3"></div>
                              </div>

                              <div 
                                id={`section-content-${index}`}
                                className="px-4 pb-4"
                                style={{ display: 'none' }}
                              >
                                <div 
                                  className="analysis-content text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-2 border-t border-gray-200 dark:border-gray-600"
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatAnalysisText(section.content) 
                                  }}
                                />
                              </div>
                            </div>
                          ));
                        })()}

                        {/* Expandable hint */}
                        <div className="flex items-center justify-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            </div>
                            <span>Click on any section title to expand and view detailed insights</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Tips for better analysis:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Be specific about student demographics you want to attract</li>
                      <li>• Ask about program improvements, facility enhancements, or marketing strategies</li>
                      <li>• Complete your institution profile sections for more accurate insights</li>
                      <li>• Ask follow-up questions about implementation strategies</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}