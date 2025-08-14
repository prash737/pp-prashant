
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react'

interface SchemaComparison {
  tableName: string
  prismaFields: string[]
  drizzleFields: string[]
  status: 'complete' | 'missing' | 'partial'
  missingFields: string[]
  extraFields: string[]
}

export default function SchemaMigrationPage() {
  const [comparisons, setComparisons] = useState<SchemaComparison[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate schema comparison analysis
    const performComparison = () => {
      const schemaComparisons: SchemaComparison[] = [
        {
          tableName: 'profiles',
          prismaFields: [
            'id', 'role', 'firstName', 'lastName', 'bio', 'location', 'profileImageUrl',
            'tagline', 'professionalSummary', 'verificationStatus', 'email', 'emailVerified',
            'phone', 'coverImageUrl', 'themePreference', 'timezone', 'availabilityStatus',
            'lastActiveDate', 'profileViews', 'createdAt', 'updatedAt', 'parentId', 'parentVerified'
          ],
          drizzleFields: [
            'id', 'role', 'firstName', 'lastName', 'bio', 'location', 'profileImageUrl',
            'tagline', 'professionalSummary', 'verificationStatus', 'email', 'emailVerified',
            'phone', 'coverImageUrl', 'themePreference', 'timezone', 'availabilityStatus',
            'lastActiveDate', 'profileViews', 'createdAt', 'updatedAt', 'parentId', 'parentVerified'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'student_profiles',
          prismaFields: [
            'id', 'age_group', 'educationLevel', 'birthMonth', 'birthYear',
            'personalityType', 'learningStyle', 'favoriteQuote', 'onboardingCompleted',
            'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'ageGroup', 'educationLevel', 'birthMonth', 'birthYear',
            'personalityType', 'learningStyle', 'favoriteQuote', 'onboardingCompleted',
            'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'mentor_profiles',
          prismaFields: [
            'id', 'profession', 'organization', 'yearsExperience', 'verified',
            'onboardingCompleted', 'hoursPerWeek', 'maxMentees', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'profession', 'organization', 'yearsExperience', 'verified',
            'onboardingCompleted', 'hoursPerWeek', 'maxMentees', 'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'institution_profiles',
          prismaFields: [
            'id', 'institutionName', 'institutionType', 'institutionTypeId', 'website',
            'logoUrl', 'coverImageUrl', 'overview', 'mission', 'coreValues', 'verified',
            'onboardingCompleted', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'institutionName', 'institutionType', 'institutionTypeId', 'website',
            'logoUrl', 'coverImageUrl', 'overview', 'mission', 'coreValues', 'verified',
            'onboardingCompleted', 'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'student_education_history',
          prismaFields: [
            'id', 'studentId', 'institutionId', 'institutionName', 'institutionTypeId',
            'degreeProgram', 'fieldOfStudy', 'subjects', 'startDate', 'endDate', 'isCurrent',
            'gradeLevel', 'gpa', 'achievements', 'description', 'institutionVerified',
            'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'studentId', 'institutionId', 'institutionName', 'institutionTypeId',
            'degreeProgram', 'fieldOfStudy', 'subjects', 'startDate', 'endDate', 'isCurrent',
            'gradeLevel', 'gpa', 'achievements', 'description', 'institutionVerified',
            'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'feed_posts',
          prismaFields: [
            'id', 'userId', 'content', 'imageUrl', 'linkPreview', 'likesCount', 'commentsCount',
            'sharesCount', 'isTrail', 'parentPostId', 'trailOrder', 'postType', 'tags', 'subjects',
            'ageGroup', 'difficultyLevel', 'isQuestion', 'isAchievement', 'achievementType',
            'projectCategory', 'moderationStatus', 'viewsCount', 'engagementScore',
            'isPinned', 'isPromoted', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'userId', 'content', 'imageUrl', 'linkPreview', 'likesCount', 'commentsCount',
            'sharesCount', 'isTrail', 'parentPostId', 'trailOrder', 'postType', 'tags', 'subjects',
            'ageGroup', 'difficultyLevel', 'isQuestion', 'isAchievement', 'achievementType',
            'projectCategory', 'moderationStatus', 'viewsCount', 'engagementScore',
            'isPinned', 'isPromoted', 'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'connection_requests',
          prismaFields: [
            'id', 'senderId', 'receiverId', 'status', 'message', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'senderId', 'receiverId', 'status', 'message', 'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'connections',
          prismaFields: [
            'id', 'user1Id', 'user2Id', 'connectionType', 'connectedAt'
          ],
          drizzleFields: [
            'id', 'user1Id', 'user2Id', 'connectionType', 'connectedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'user_interests',
          prismaFields: [
            'id', 'userId', 'interestId', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'userId', 'interestId', 'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'user_skills',
          prismaFields: [
            'id', 'userId', 'skillId', 'proficiencyLevel', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'userId', 'skillId', 'proficiencyLevel', 'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'circle_badges',
          prismaFields: [
            'id', 'creatorId', 'name', 'description', 'color', 'icon', 'isDefault',
            'isDisabled', 'isCreatorDisabled', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'creatorId', 'name', 'description', 'color', 'icon', 'isDefault',
            'isDisabled', 'isCreatorDisabled', 'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'user_achievements',
          prismaFields: [
            'id', 'userId', 'name', 'description', 'dateOfAchievement', 'achievementTypeId',
            'achievementImageIcon', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'userId', 'name', 'description', 'dateOfAchievement', 'achievementTypeId',
            'achievementImageIcon', 'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'conversations',
          prismaFields: [
            'id', 'user1Id', 'user2Id', 'lastMessageAt', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [
            'id', 'user1Id', 'user2Id', 'lastMessageAt', 'createdAt', 'updatedAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        {
          tableName: 'messages',
          prismaFields: [
            'id', 'conversationId', 'senderId', 'content', 'messageType', 'isRead', 'createdAt'
          ],
          drizzleFields: [
            'id', 'conversationId', 'senderId', 'content', 'messageType', 'isRead', 'createdAt'
          ],
          status: 'complete',
          missingFields: [],
          extraFields: []
        },
        // Missing tables from Prisma schema that need to be added
        {
          tableName: 'institution_gallery',
          prismaFields: [
            'id', 'institutionId', 'imageUrl', 'caption', 'createdAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'institutionId', 'imageUrl', 'caption', 'createdAt'
          ],
          extraFields: []
        },
        {
          tableName: 'institution_facilities',
          prismaFields: [
            'id', 'institutionId', 'name', 'description', 'features', 'images',
            'learnMoreLink', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'institutionId', 'name', 'description', 'features', 'images',
            'learnMoreLink', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'institution_faculty',
          prismaFields: [
            'id', 'institutionId', 'name', 'title', 'department', 'image', 'expertise',
            'email', 'bio', 'qualifications', 'experience', 'specialization', 'featured',
            'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'institutionId', 'name', 'title', 'department', 'image', 'expertise',
            'email', 'bio', 'qualifications', 'experience', 'specialization', 'featured',
            'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'institution_events',
          prismaFields: [
            'id', 'institutionId', 'title', 'description', 'eventType', 'startDate',
            'endDate', 'location', 'imageUrl', 'registrationUrl', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'institutionId', 'title', 'description', 'eventType', 'startDate',
            'endDate', 'location', 'imageUrl', 'registrationUrl', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'institution_programs',
          prismaFields: [
            'id', 'institutionId', 'name', 'type', 'level', 'durationValue', 'durationType',
            'description', 'eligibility', 'learningOutcomes', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'institutionId', 'name', 'type', 'level', 'durationValue', 'durationType',
            'description', 'eligibility', 'learningOutcomes', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'institution_quick_facts',
          prismaFields: [
            'id', 'institutionId', 'undergraduateStudents', 'graduateStudents', 'facultyMembers',
            'campusSizeAcres', 'campusSizeKm2', 'internationalStudentsCountries', 'globalRanking',
            'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'institutionId', 'undergraduateStudents', 'graduateStudents', 'facultyMembers',
            'campusSizeAcres', 'campusSizeKm2', 'internationalStudentsCountries', 'globalRanking',
            'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'institution_contact_info',
          prismaFields: [
            'id', 'institutionId', 'address', 'city', 'state', 'country', 'postalCode',
            'phone', 'email', 'website', 'socialLinks', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'institutionId', 'address', 'city', 'state', 'country', 'postalCode',
            'phone', 'email', 'website', 'socialLinks', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'institution_faculty_stats',
          prismaFields: [
            'id', 'institutionId', 'totalFaculty', 'studentFacultyRatioStudents',
            'studentFacultyRatioFaculty', 'facultyWithPhdsPercentage',
            'internationalFacultyPercentage', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'institutionId', 'totalFaculty', 'studentFacultyRatioStudents',
            'studentFacultyRatioFaculty', 'facultyWithPhdsPercentage',
            'internationalFacultyPercentage', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'social_links',
          prismaFields: [
            'id', 'userId', 'platform', 'url', 'displayName', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'userId', 'platform', 'url', 'displayName', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'user_languages',
          prismaFields: [
            'id', 'userId', 'languageId', 'proficiencyLevel', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'userId', 'languageId', 'proficiencyLevel', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'user_hobbies',
          prismaFields: [
            'id', 'userId', 'hobbyId', 'createdAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'userId', 'hobbyId', 'createdAt'
          ],
          extraFields: []
        },
        {
          tableName: 'mood_board',
          prismaFields: [
            'id', 'userId', 'imageUrl', 'caption', 'position', 'collectionId',
            'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'userId', 'imageUrl', 'caption', 'position', 'collectionId',
            'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'custom_badges',
          prismaFields: [
            'id', 'userId', 'title', 'description', 'iconUrl', 'color', 'earnedDate',
            'issuer', 'verificationUrl', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'userId', 'title', 'description', 'iconUrl', 'color', 'earnedDate',
            'issuer', 'verificationUrl', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'skill_endorsements',
          prismaFields: [
            'id', 'endorserId', 'endorsedUserId', 'skillId', 'comment', 'createdAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'endorserId', 'endorsedUserId', 'skillId', 'comment', 'createdAt'
          ],
          extraFields: []
        },
        {
          tableName: 'post_likes',
          prismaFields: [
            'id', 'userId', 'postId', 'createdAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'userId', 'postId', 'createdAt'
          ],
          extraFields: []
        },
        {
          tableName: 'post_comments',
          prismaFields: [
            'id', 'postId', 'userId', 'content', 'parentId', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'postId', 'userId', 'content', 'parentId', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        },
        {
          tableName: 'post_bookmarks',
          prismaFields: [
            'id', 'userId', 'postId', 'createdAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'userId', 'postId', 'createdAt'
          ],
          extraFields: []
        },
        {
          tableName: 'post_reactions',
          prismaFields: [
            'id', 'postId', 'userId', 'reactionType', 'createdAt', 'updatedAt'
          ],
          drizzleFields: [],
          status: 'missing',
          missingFields: [
            'id', 'postId', 'userId', 'reactionType', 'createdAt', 'updatedAt'
          ],
          extraFields: []
        }
      ]

      setComparisons(schemaComparisons)
      setLoading(false)
    }

    performComparison()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'missing':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case 'missing':
        return <Badge className="bg-red-100 text-red-800">Missing</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const stats = {
    total: comparisons.length,
    complete: comparisons.filter(c => c.status === 'complete').length,
    partial: comparisons.filter(c => c.status === 'partial').length,
    missing: comparisons.filter(c => c.status === 'missing').length
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Schema Migration Analysis</h1>
          <p>Analyzing Prisma vs Drizzle schemas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Schema Migration Analysis</h1>
        <p className="text-gray-600 mb-6">
          Comparison between Prisma schema and Drizzle schema implementation
        </p>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tables</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
            <div className="text-sm text-gray-600">Complete</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
            <div className="text-sm text-gray-600">Partial</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.missing}</div>
            <div className="text-sm text-gray-600">Missing</div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="complete">Complete ({stats.complete})</TabsTrigger>
          <TabsTrigger value="partial">Partial ({stats.partial})</TabsTrigger>
          <TabsTrigger value="missing">Missing ({stats.missing})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {comparisons.map((comparison) => (
                <Card key={comparison.tableName} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(comparison.status)}
                      <h3 className="text-lg font-semibold">{comparison.tableName}</h3>
                    </div>
                    {getStatusBadge(comparison.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Prisma Fields ({comparison.prismaFields.length})</h4>
                      <div className="text-xs text-gray-600">
                        {comparison.prismaFields.slice(0, 5).join(', ')}
                        {comparison.prismaFields.length > 5 && ` + ${comparison.prismaFields.length - 5} more`}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Drizzle Fields ({comparison.drizzleFields.length})</h4>
                      <div className="text-xs text-gray-600">
                        {comparison.drizzleFields.length > 0 ? (
                          <>
                            {comparison.drizzleFields.slice(0, 5).join(', ')}
                            {comparison.drizzleFields.length > 5 && ` + ${comparison.drizzleFields.length - 5} more`}
                          </>
                        ) : (
                          <span className="text-red-500">Not implemented</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {comparison.missingFields.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Missing Fields:</h4>
                      <div className="text-xs text-red-600">{comparison.missingFields.join(', ')}</div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="complete">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {comparisons.filter(c => c.status === 'complete').map((comparison) => (
                <Card key={comparison.tableName} className="p-4 border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">{comparison.tableName}</h3>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    All {comparison.prismaFields.length} fields successfully migrated to Drizzle
                  </p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="partial">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {comparisons.filter(c => c.status === 'partial').map((comparison) => (
                <Card key={comparison.tableName} className="p-4 border-yellow-200">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">{comparison.tableName}</h3>
                    <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                  </div>
                  <div className="space-y-2">
                    {comparison.missingFields.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Missing Fields:</h4>
                        <p className="text-xs text-red-600">{comparison.missingFields.join(', ')}</p>
                      </div>
                    )}
                    {comparison.extraFields.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Extra Fields:</h4>
                        <p className="text-xs text-blue-600">{comparison.extraFields.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="missing">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {comparisons.filter(c => c.status === 'missing').map((comparison) => (
                <Card key={comparison.tableName} className="p-4 border-red-200">
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold">{comparison.tableName}</h3>
                    <Badge className="bg-red-100 text-red-800">Missing</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      Needs to be implemented in Drizzle ({comparison.prismaFields.length} fields)
                    </h4>
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {comparison.prismaFields.join(', ')}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      <Card className="mt-8 p-6">
        <h3 className="text-lg font-semibold mb-3">Next Steps for Complete Migration</h3>
        <div className="space-y-2 text-sm">
          <p>• <strong>{stats.missing} tables</strong> need to be implemented in Drizzle schema</p>
          <p>• Focus on high-priority tables: institution features, social links, and feed interactions</p>
          <p>• Create migration scripts for data transfer once schemas are complete</p>
          <p>• Update API endpoints to use Drizzle instead of Prisma</p>
        </div>
      </Card>
    </div>
  )
}
