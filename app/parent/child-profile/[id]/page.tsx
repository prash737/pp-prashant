"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import EditSectionDialog from "@/components/parent/edit-section-dialog"
import FollowingInstitutions from "@/components/profile/following-institutions"
import ActivityLogs from "@/components/profile/activity-logs"
import { 
  User, 
  Edit3, 
  GraduationCap, 
  Heart, 
  Sparkles, 
  Trophy, 
  Users, 
  MapPin,
  Mail,
  Phone,
  Globe,
  LogOut,
  Plus,
  Trash2,
  Eye,
  MessageCircle,
  Settings
} from "lucide-react"
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ChildData {
  id: string
  profile: {
    firstName: string
    lastName: string
    bio?: string
    location?: string
    profileImageUrl?: string
    coverImageUrl?: string
    tagline?: string
    userInterests: Array<{
      id: string
      interest: {
        id: string
        name: string
        category: { name: string }
      }
    }>
    userSkills: Array<{
      id: string
      skill: {
        id: string
        name: string
        category: { name: string }
      }
      proficiencyLevel: number
    }>
    socialLinks: Array<{
      id: string
      platform: string
      url: string
    }>
    goals: Array<{
      id: string
      title: string
      description: string
      category: string
      timeframe: string
      completed: boolean
    }>
    userAchievements: Array<{
      id: string
      name: string
      description: string
      achievementType: {
        name: string
        category: {
          name: string
        }
      }
      dateOfAchievement: string
      achievementImageIcon: string
    }>
  }
  educationHistory: Array<{
    id: string
    institutionName: string
    institutionTypeName?: string
    degreeProgram?: string
    fieldOfStudy?: string
    subjects?: string[]
    startDate: string
    endDate?: string
    isCurrent: boolean
    gradeLevel?: string
    gpa?: number
    achievements?: string[]
    description?: string
  }>
  connections?: Array<{
    id: string
    user: {
      firstName: string
      lastName: string
      profileImageUrl?: string
      role: string
    }
  }>
  achievements?: Array<{
    id: string
    title: string
    description: string
    earnedDate: string
    iconUrl?: string
  }>
}

export default function ParentChildProfilePage() {
  const [childData, setChildData] = useState<ChildData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parentName, setParentName] = useState("")
  const [activeTab, setActiveTab] = useState("about")
  const [circles, setCircles] = useState<any[]>([])
  const [circlesLoading, setCirclesLoading] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    type: 'education' | 'achievement' | 'goal'
    id: string | number
    name: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const childId = params.id as string
  const [selectedCircleMembers, setSelectedCircleMembers] = useState<any[] | null>(null);
  const [selectedCircleInfo, setSelectedCircleInfo] = useState<any | null>(null);
  const [circleDisableConfirmation, setCircleDisableConfirmation] = useState<{
    isOpen: boolean
    circleId: string
    circleName: string
    disableType: 'child' | 'all'
  } | null>(null)
  const [isDisablingCircle, setIsDisablingCircle] = useState(false)
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false)
  const [currentCircleStatus, setCurrentCircleStatus] = useState<{
    circleId: string | null
    isDisabled: boolean
    disableType: 'child' | 'all' | null
  }>({
    circleId: null,
    isDisabled: false,
    disableType: null
  })
  const [revokeConfirmation, setRevokeConfirmation] = useState<{
    isOpen: boolean
    circleId: string
    circleName: string
    disableType: 'child' | 'all'
  } | null>(null)
  const [isRevokingCircle, setIsRevokingCircle] = useState(false)
  const [selectedCircleForOptions, setSelectedCircleForOptions] = useState<any | null>(null);

  useEffect(() => {
    fetchChildProfile()
  }, [childId])

  useEffect(() => {
    if (activeTab === 'circles' && childData && circles.length === 0) {
      fetchChildCircles()
    }
  }, [activeTab, childData])

  const fetchChildProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/parent/child-profile/${childId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/parent/login')
          return
        }
        if (response.status === 403) {
          setError('You do not have permission to view this profile')
          return
        }
        throw new Error('Failed to fetch child profile')
      }

      const data = await response.json()
      setChildData(data.child)
      setParentName(data.parentName || "Parent")
    } catch (error) {
      console.error('Error fetching child profile:', error)
      setError('Failed to load child profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchChildCircles = async () => {
    try {
      setCirclesLoading(true)
      const response = await fetch(`/api/parent/child-profile/${childId}/circles`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setCircles(data.circles || [])
      }
    } catch (error) {
      console.error('Error fetching child circles:', error)
    } finally {
      setCirclesLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/parent/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "crown":
        return <User className="h-4 w-4" />;
      case "shield":
        return <User className="h-4 w-4" />;
      case "star":
        return <User className="h-4 w-4" />;
      case "graduation-cap":
        return <GraduationCap className="h-4 w-4" />;
      case "building":
        return <User className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  }

  const [editingItemData, setEditingItemData] = useState<any>(null)

  const handleEditEducation = (education: any) => {
    setEditingItemData(education)
    setEditingSection('education')
  }

  const handleEditAchievement = (achievement: any) => {
    setEditingItemData(achievement)
    setEditingSection('achievements')
  }

  const handleEditGoal = (goal: any) => {
    setEditingItemData(goal)
    setEditingSection('goals')
  }

  const handleDeleteEducation = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'education',
      id,
      name
    })
  }

  const handleDeleteAchievement = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'achievement',
      id,
      name
    })
  }

  const handleDeleteGoal = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'goal',
      id,
      name
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation) return

    setIsDeleting(true)
    try {
      // Use the parent API endpoint for all deletions
      const response = await fetch(`/api/parent/child-profile/${childId}/edit`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          section: deleteConfirmation.type === 'achievement' ? 'achievements' : deleteConfirmation.type === 'education' ? 'education' : 'goals',
          itemId: deleteConfirmation.id
        })
      })

      if (response.ok) {
        toast.success(`${deleteConfirmation.type.charAt(0).toUpperCase() + deleteConfirmation.type.slice(1)} deleted successfully!`)
        // Refresh the child profile data
        await fetchChildProfile()
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to delete ${deleteConfirmation.type}`)
      }
    } catch (error) {
      console.error(`Error deleting ${deleteConfirmation.type}:`, error)
      toast.error(`Failed to delete ${deleteConfirmation.type}`)
    } finally {
      setIsDeleting(false)
      setDeleteConfirmation(null)
    }
  }

  const showCircleMembers = async (circle: any) => {
    try {
      const response = await fetch(`/api/parent/child-profile/${childId}/circles/${circle.id}/members`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedCircleMembers(data.members);
        setSelectedCircleInfo(data.circle);
      } else {
        console.error('Failed to fetch circle members');
        setSelectedCircleMembers([]);
        setSelectedCircleInfo(null);
      }
    } catch (error) {
      console.error('Error fetching circle members:', error);
      setSelectedCircleMembers([]);
      setSelectedCircleInfo(null);
    }
  };

  const handleCircleDisable = (circleId: string, disableType: 'child' | 'all') => {
    const circle = circles.find(c => c.id === circleId);
    if (circle) {
      setCircleDisableConfirmation({
        isOpen: true,
        circleId,
        circleName: circle.name,
        disableType
      });
    }
  };

  const checkCircleStatus = (circle: any) => {
    // Check if circle is disabled for all members
    if (circle.isDisabled) {
      return {
        isDisabled: true,
        disableType: 'all' as const
      };
    }

    // Check if child is creator and is disabled
    if (circle.creatorId === childId && circle.isCreatorDisabled) {
      return {
        isDisabled: true,
        disableType: 'child' as const
      };
    }

    // Check if child is a member and is disabled
    const childMembership = circle.memberships?.find((m: any) => m.userId === childId);
    if (childMembership?.isDisabledMember) {
      return {
        isDisabled: true,
        disableType: 'child' as const
      };
    }

    return {
      isDisabled: false,
      disableType: null
    };
  };

  const handleOptionsDialogOpen = (circle: any) => {
    const status = checkCircleStatus(circle);
    setCurrentCircleStatus({
      circleId: circle.id,
      isDisabled: status.isDisabled,
      disableType: status.disableType
    });
    setOptionsDialogOpen(true);
    setSelectedCircleForOptions(circle);
  };

  const confirmCircleDisable = async () => {
    if (!circleDisableConfirmation) return;

    setIsDisablingCircle(true);
    try {
      const response = await fetch(`/api/parent/child-profile/${childId}/circles/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          circleId: circleDisableConfirmation.circleId,
          disableType: circleDisableConfirmation.disableType
        })
      });

      if (response.ok) {
        toast.success(`Circle ${circleDisableConfirmation.disableType === 'child' ? 'disabled for your child' : 'disabled for all members'} successfully!`);
        // Refresh the circles data
        await fetchChildCircles();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to disable circle');
      }
    } catch (error) {
      console.error('Error disabling circle:', error);
      toast.error('Failed to disable circle');
    } finally {
      setIsDisablingCircle(false);
      setCircleDisableConfirmation(null);
    }
  };

  const handleRevokeDisable = (circle: any) => {
    const status = checkCircleStatus(circle);
    if (status.isDisabled && status.disableType) {
      setRevokeConfirmation({
        isOpen: true,
        circleId: circle.id,
        circleName: circle.name,
        disableType: status.disableType
      });
    }
  };

  const confirmRevokeDisable = async () => {
    if (!revokeConfirmation) return;

    setIsRevokingCircle(true);
    try {
      const response = await fetch(`/api/parent/child-profile/${childId}/circles/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          circleId: revokeConfirmation.circleId,
          disableType: revokeConfirmation.disableType
        })
      });

      if (response.ok) {
        toast.success(`Circle access restored successfully!`);
        // Refresh the circles data
        await fetchChildCircles();
        // Close options dialog and reset state
        setOptionsDialogOpen(false);
        setCurrentCircleStatus({
          circleId: null,
          isDisabled: false,
          disableType: null
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to restore circle access');
      }
    } catch (error) {
      console.error('Error restoring circle access:', error);
      toast.error('Failed to restore circle access');
    } finally {
      setIsRevokingCircle(false);
      setRevokeConfirmation(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
          <Link href="/" className="h-10">
            <Image
              src="/images/pathpiper-logo-full.png"
              width={180}
              height={40}
              alt="PathPiper Logo"
              className="h-full w-auto"
            />
          </Link>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
          <Link href="/" className="h-10">
            <Image
              src="/images/pathpiper-logo-full.png"
              width={180}
              height={40}
              alt="PathPiper Logo"
              className="h-full w-auto"
            />
          </Link>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/parent/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!childData) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
        <Link href="/" className="h-10">
          <Image
            src="/images/pathpiper-logo-full.png"
            width={180}
            height={40}
            alt="PathPiper Logo"
            className="h-full w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/parent/dashboard')}
            className="text-gray-600"
          >
            Back to Dashboard
          </Button>
          <span className="text-gray-700 font-medium">Welcome, {parentName}</span>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          {childData.profile.coverImageUrl && (
            <Image
              src={childData.profile.coverImageUrl}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
          <div className="container mx-auto flex items-end space-x-6">
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage 
                src={childData.profile.profileImageUrl} 
                alt={`${childData.profile.firstName} ${childData.profile.lastName}`} 
              />
              <AvatarFallback className="bg-gradient-to-r from-teal-400 to-blue-500 text-white text-2xl font-bold">
                {getInitials(childData.profile.firstName, childData.profile.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="text-white mb-4">
              <h1 className="text-3xl font-bold">
                {childData.profile.firstName} {childData.profile.lastName}
              </h1>
              {childData.profile.tagline && (
                <p className="text-lg opacity-90">{childData.profile.tagline}</p>
              )}
              {childData.profile.location && (
                <div className="flex items-center mt-2 opacity-80">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{childData.profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="circles">Circles</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>About {childData.profile.firstName}</CardTitle>
                    <CardDescription>Personal information and bio</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="about" 
                    childId={childId} 
                    currentData={childData.profile}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent className="space-y-4">
                  {childData.profile.bio ? (
                    <p className="text-gray-700">{childData.profile.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No bio added yet</p>
                  )}

                  {childData.profile.socialLinks && childData.profile.socialLinks.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Social Links</h4>
                      <div className="space-y-2">
                        {childData.profile.socialLinks.map((link) => (
                          <div key={link.id} className="flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span className="capitalize">{link.platform}:</span>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {link.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interests Tab */}
            <TabsContent value="interests" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Interests & Passions</CardTitle>
                    <CardDescription>Things {childData.profile.firstName} is passionate about</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="interests" 
                    childId={childId} 
                    currentData={childData.profile}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent>
                  {childData.profile.userInterests && childData.profile.userInterests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {childData.profile.userInterests.map((userInterest) => (
                        <Badge key={userInterest.id} variant="secondary" className="text-sm">
                          {userInterest.interest.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No interests added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Skills & Abilities</CardTitle>
                    <CardDescription>{childData.profile.firstName}'s skill portfolio</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="skills" 
                    childId={childId} 
                    currentData={childData.profile}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent>
                  {childData.profile.userSkills && childData.profile.userSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {childData.profile.userSkills.map((userSkill) => (
                        <Badge key={userSkill.id} variant="secondary" className="text-sm">
                          {userSkill.skill.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Education History</CardTitle>
                    <CardDescription>{childData.profile.firstName}'s educational journey</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <EditSectionDialog 
                      section="education" 
                      childId={childId} 
                      currentData={null}
                      onUpdate={fetchChildProfile}
                    >
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </Button>
                    </EditSectionDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {childData.educationHistory && childData.educationHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="flex space-x-4 pb-4" style={{ width: `${childData.educationHistory.length * 300}px`, minWidth: '100%' }}>
                        {childData.educationHistory.map((education) => (
                          <div key={education.id} className="flex-shrink-0 w-72 border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3">
                                <GraduationCap className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-base truncate">{education.institutionName}</h4>
                                  {education.institutionTypeName && (
                                    <p className="text-sm text-gray-600 truncate">{education.institutionTypeName}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {education.isCurrent && (
                                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs flex-shrink-0">
                                    Current
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEducation(education)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEducation(education.id, education.institutionName)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {education.degreeProgram && (
                                <p className="font-medium text-sm">{education.degreeProgram}</p>
                              )}
                              {education.fieldOfStudy && (
                                <p className="text-gray-700 text-sm">{education.fieldOfStudy}</p>
                              )}
                              {education.gradeLevel && (
                                <p className="text-sm text-gray-600">Grade: {education.gradeLevel}</p>
                              )}
                              <p className="text-sm text-gray-500">
                                {new Date(education.startDate).getFullYear()} - {
                                  education.isCurrent ? 'Present' : 
                                  education.endDate ? new Date(education.endDate).getFullYear() : 'Present'
                                }
                              </p>
                            </div>

                            {education.subjects && education.subjects.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium mb-2">Subjects:</p>
                                <div className="flex flex-wrap gap-1">
                                  {education.subjects.slice(0, 3).map((subject, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {subject}
                                    </Badge>
                                  ))}
                                  {education.subjects.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{education.subjects.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {education.description && (
                              <p className="mt-3 text-xs text-gray-700 line-clamp-2">{education.description}</p>
                            )}
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {education.startDate && format(new Date(education.startDate), 'MMM yyyy')} - {education.isCurrent ? 'Present' : education.endDate ? format(new Date(education.endDate), 'MMM yyyy') : 'N/A'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No education history added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Achievements & Badges</CardTitle>
                    <CardDescription>{childData.profile.firstName}'s accomplishments</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="achievements" 
                    childId={childId} 
                    currentData={null}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Achievement
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent>
                  {childData.profile.userAchievements && childData.profile.userAchievements.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="flex space-x-4 pb-4" style={{ width: `${childData.profile.userAchievements.length * 300}px`, minWidth: '100%' }}>
                        {childData.profile.userAchievements.map((achievement) => (
                          <div key={achievement.id} className="flex-shrink-0 w-72 border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3">
                                {achievement.achievementImageIcon ? (
                                  <img 
                                    src={achievement.achievementImageIcon} 
                                    alt={achievement.name}
                                    className="w-10 h-10 object-cover rounded mt-1 flex-shrink-0"
                                  />
                                ) : (
                                  <Trophy className="w-10 h-10 text-yellow-500 mt-1 flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-base truncate">{achievement.name}</h4>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAchievement(achievement)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAchievement(achievement.id, achievement.name)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <p className="text-gray-600 text-sm line-clamp-2">{achievement.description}</p>

                              {achievement.achievementType && (
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded truncate">
                                    {achievement.achievementType.name}
                                  </span>
                                  {achievement.achievementType.category && (
                                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded truncate">
                                      {achievement.achievementType.category.name}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {achievement.dateOfAchievement && format(new Date(achievement.dateOfAchievement), 'MMM yyyy')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No achievements added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Goals & Aspirations</CardTitle>
                    <CardDescription>{childData.profile.firstName}'s future plans</CardDescription>
                  </div>
                  <EditSectionDialog 
                    section="goals" 
                    childId={childId} 
                    currentData={null}
                    onUpdate={fetchChildProfile}
                  >
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </EditSectionDialog>
                </CardHeader>
                <CardContent>
                  {childData.profile.goals && childData.profile.goals.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="flex space-x-4 pb-4" style={{ width: `${childData.profile.goals.length * 300}px`, minWidth: '100%' }}>
                        {childData.profile.goals.map((goal) => (
                          <div key={goal.id} className="flex-shrink-0 w-72 border rounded-lg p-4 bg-white">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-base line-clamp-2 flex-1">{goal.title}</h4>
                                <div className="flex items-center space-x-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditGoal(goal)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteGoal(goal.id, goal.title)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm line-clamp-3">{goal.description}</p>

                              <div className="flex flex-wrap gap-2">
                                {goal.category && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded truncate">
                                    {goal.category}
                                  </span>
                                )}
                                {goal.timeframe && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded truncate">
                                    {goal.timeframe}
                                  </span>
                                )}
                              </div>

                              <div className="pt-2">
                                <span className={`text-xs px-2 py-1 rounded ${goal.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {goal.completed ? 'Completed' : 'In Progress'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No goals added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Circles Tab */}
            <TabsContent value="circles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Circle Badges</CardTitle>
                  <CardDescription>{childData.profile.firstName}'s circle memberships and badges</CardDescription>
                </CardHeader>
                <CardContent>
                  {circlesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-500">Loading circles...</span>
                    </div>
                  ) : circles.length > 0 ? (
                    <div className="space-y-6">
                      {/* Circle Cards Display */}
                      <div>
                        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          Circle Badges ({circles.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {circles.map((circle) => (
                            <Card key={circle.id} className="p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {/* Circle Badge */}
                                  <div className="relative">
                                    <div
                                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg overflow-hidden"
                                      style={{ backgroundColor: circle.color }}
                                    >
                                      {circle.icon && (circle.icon.startsWith('data:image') || circle.icon.startsWith('/uploads/')) ? (
                                        <img
                                          src={circle.icon}
                                          alt={circle.name}
                                          className="w-full h-full object-cover rounded-full"
                                        />
                                      ) : (
                                        <div className="scale-75">
                                          {getIconComponent(circle.icon)}
                                        </div>
                                      )}
                                    </div>
                                    {/* Member count indicator */}
                                    <div className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                      <span className="text-xs leading-none">
                                        {(circle._count?.memberships || 0) + 1}
                                      </span>
                                    </div>
                                    {/* Default badge indicator */}
                                    {circle.isDefault && (
                                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center">
                                        <User className="h-1.5 w-1.5" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                      {circle.name}
                                    </h5>
                                    {circle.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {circle.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Circle Actions */}
                              <div className="flex items-center justify-between pt-3 border-t">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => showCircleMembers(circle)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Members
                                </Button>

                                <Dialog open={optionsDialogOpen} onOpenChange={setOptionsDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                      onClick={() => handleOptionsDialogOpen(circle)}
                                    >
                                      <Settings className="w-4 h-4 mr-1" />
                                      Enable/Disable
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[700px] max-w-[95vw] w-full">
                                    <DialogHeader>
                                      <DialogTitle className="text-lg">Circle Control - {selectedCircleForOptions?.name || 'Circle'}</DialogTitle>
                                      <DialogDescription className="text-sm">
                                        Choose how you want to disable this circle for your child.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      {currentCircleStatus.isDisabled ? (
                                        // Show current status and revoke option
                                        <div className="space-y-4">
                                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="text-sm font-medium text-blue-800 mb-1">
                                              Current Status: {currentCircleStatus.disableType === 'all' ? 'Disabled for all members' : 'Disabled for your child'}
                                            </div>
                                            <div className="text-xs text-blue-600">
                                              {currentCircleStatus.disableType === 'all' 
                                                ? 'This circle is currently disabled for all members.'
                                                : 'Your child is currently removed from this circle.'}
                                            </div>
                                          </div>

                                          <Button
                                            variant="outline"
                                            className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                            onClick={() => {
                                              setOptionsDialogOpen(false);
                                              handleRevokeDisable(selectedCircleForOptions);
                                            }}
                                          >
                                            <div className="flex items-center justify-center">
                                              <Settings className="w-4 h-4 mr-2" />
                                              Revoke & Restore Access
                                            </div>
                                          </Button>
                                        </div>
                                      ) : (
                                        // Show disable options
                                        <div className="space-y-3">
                                          <Button
                                            variant="outline"
                                            className="w-full justify-start text-left h-auto p-3 min-h-[70px] overflow-hidden hover:bg-orange-600 hover:text-white hover:border-orange-600 group"
                                            onClick={() => {
                                              setOptionsDialogOpen(false);
                                              handleCircleDisable(selectedCircleForOptions.id, 'child');
                                            }}
                                          >
                                            <div className="w-full overflow-hidden">
                                              <div className="font-medium text-orange-600 group-hover:text-white mb-1 text-sm">
                                                Disable for only my child
                                              </div>
                                              <div className="text-xs text-gray-500 group-hover:text-white leading-relaxed break-words">
                                                Your child will be removed from this circle, but other members can continue using it.
                                              </div>
                                            </div>
                                          </Button>

                                          <Button
                                            variant="outline"
                                            className="w-full justify-start text-left h-auto p-3 min-h-[70px] overflow-hidden hover:bg-red-600 hover:text-white hover:border-red-600 group"
                                            onClick={() => {
                                              setOptionsDialogOpen(false);
                                              handleCircleDisable(selectedCircleForOptions.id, 'all');
                                            }}
                                          >
                                            <div className="w-full overflow-hidden">
                                              <div className="font-medium text-red-600 group-hover:text-white mb-1 text-sm">
                                                Disable for all members
                                              </div>
                                              <div className="text-xs text-gray-500 group-hover:text-white leading-relaxed break-words">
                                                This entire circle will be disabled for ALL members, not just your child. 
                                                All members will lose access to this circle.
                                              </div>
                                            </div>
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Selected Circle Members Display */}
                      {selectedCircleMembers && selectedCircleInfo && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white overflow-hidden"
                                style={{ backgroundColor: selectedCircleInfo.color }}
                              >
                                {selectedCircleInfo.icon && (selectedCircleInfo.icon.startsWith('data:image') || selectedCircleInfo.icon.startsWith('/uploads/')) ? (
                                  <img
                                    src={selectedCircleInfo.icon}
                                    alt={selectedCircleInfo.name}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <div className="scale-75">
                                    {getIconComponent(selectedCircleInfo.icon)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {selectedCircleInfo.name} Members
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {selectedCircleMembers.length} member{selectedCircleMembers.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCircleMembers(null);
                                setSelectedCircleInfo(null);
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              ✕
                            </Button>
                          </div>

                          {/* Circular Members Grid */}
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 justify-items-center">
                            {selectedCircleMembers.map((member) => (
                              <div key={member.id} className="flex flex-col items-center text-center">
                                <div className="relative mb-2">
                                  <Avatar className="w-12 h-12 border-2 border-gray-200">
                                    <AvatarImage src={member.profileImageUrl} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm">
                                      {getInitials(member.firstName, member.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {member.isCreator && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                      <User className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="w-16">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {member.firstName}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {member.lastName}
                                  </p>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs mt-1 ${
                                      member.isCreator 
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                                        : member.role === 'mentor'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}
                                  >
                                    {member.isCreator ? 'Creator' : member.role}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>

                          {selectedCircleInfo.description && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {selectedCircleInfo.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No circles yet</p>
                      <p className="text-sm">Your child hasn't joined any circles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" className="space-y-6">
              <FollowingInstitutions userId={childId} />
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connections</CardTitle>
                  <CardDescription>{childData.profile.firstName}'s network</CardDescription>
                </CardHeader>
                <CardContent>
                  {childData.connections && childData.connections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {childData.connections.map((connection) => (
                        <div key={connection.id} className="border rounded-lg p-4 text-center">
                          <Avatar className="w-16 h-16 mx-auto mb-3">
                            <AvatarImage src={connection.user.profileImageUrl} />
                            <AvatarFallback>
                              {getInitials(connection.user.firstName, connection.user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-medium">{connection.user.firstName} {connection.user.lastName}</h4>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {connection.user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No connections yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity" className="space-y-6">
              <ActivityLogs childId={childId} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto flex justify-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} PathPiper. All rights reserved.</p>
        </div>
      </footer>
      {editingSection && childData && (
        <EditSectionDialog
          isOpen={!!editingSection}
          onClose={() => {
            setEditingSection(null)
            setEditingItemData(null)
          }}
          section={editingSection}
          childProfile={{
            ...childData.profile,
            ageGroup: 'young_adult' //childData?.student?.ageGroup || 'young_adult'  //Assuming all children are young adults for now
          }}
          onSave={fetchChildProfile}
          childId={childId}
          editingItemData={editingItemData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete {deleteConfirmation.type.charAt(0).toUpperCase() + deleteConfirmation.type.slice(1)}
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<span className="font-medium">{deleteConfirmation.name}</span>"?
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Circle Disable Confirmation Dialog */}
      {circleDisableConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Circle Control
                </h3>
                <p className="text-sm text-gray-600">
                  This action will affect circle access.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                You are about to <span className="font-medium">
                  {circleDisableConfirmation.disableType === 'child' 
                    ? 'disable the circle for only your child' 
                    : 'disable the circle for all members'}
                </span>:
              </p>
              <p className="font-medium text-gray-900">
                "{circleDisableConfirmation.circleName}"
              </p>

              {circleDisableConfirmation.disableType === 'all' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> This will disable the circle for ALL members, not just your child. 
                    All members will lose access to this circle.
                  </p>
                </div>
              )}

              {circleDisableConfirmation.disableType === 'child' && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">
                    Your child will be removed from this circle, but other members can continue using it.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setCircleDisableConfirmation(null)}
                disabled={isDisablingCircle}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCircleDisable}
                disabled={isDisablingCircle}
                className={`${circleDisableConfirmation.disableType === 'child' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isDisablingCircle ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Confirm
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Dialog */}
      {revokeConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Restore Access
                </h3>
                <p className="text-sm text-gray-600">
                  This will restore circle access.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                You are about to <span className="font-medium text-green-700">restore access</span> to:
              </p>
              <p className="font-medium text-gray-900">
                "{revokeConfirmation.circleName}"
              </p>

              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  {revokeConfirmation.disableType === 'all' 
                    ? 'This will re-enable the circle for all members.'
                    : 'This will restore your child\'s access to this circle.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setRevokeConfirmation(null)}
                disabled={isRevokingCircle}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRevokeDisable}
                disabled={isRevokingCircle}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isRevokingCircle ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Restoring...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Confirm Restore
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}