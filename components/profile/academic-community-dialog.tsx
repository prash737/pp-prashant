"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Building, Plus, Search, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface AcademicCommunity {
  id: number
  name: string
  description: string
  image_url: string
  creator_id: string
  created_at: string
  academic_communities_memberships?: Array<{
    count: number
  }>
}

interface Institution {
  id: string
  name: string
  logo: string
  type: string
  location: string
}

interface Membership {
  id: number
  community_id: number
  member_id: string
  created_at: string
  isCreator?: boolean
  institution_profiles: Institution
}

interface AcademicCommunityDialogProps {
  community: AcademicCommunity | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommunityUpdated: () => void
  isViewMode?: boolean
}

export default function AcademicCommunityDialog({
  community,
  open,
  onOpenChange,
  onCommunityUpdated,
  isViewMode = false
}: AcademicCommunityDialogProps) {
  const [members, setMembers] = useState<Membership[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Institution[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [addingMember, setAddingMember] = useState<string | null>(null)

  useEffect(() => {
    if (open && community) {
      fetchMembers()
    }
  }, [open, community])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchInstitutions()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchMembers = async () => {
    if (!community) return

    setLoading(true)
    try {
      const response = await fetch(`/api/institution/academic-communities/${community.id}/members`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setMembers(data.memberships || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchInstitutions = async () => {
    setSearchLoading(true)
    try {
      const response = await fetch(`/api/institutions/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.institutions || [])
      }
    } catch (error) {
      console.error('Error searching institutions:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const addMember = async (institutionId: string) => {
    if (!community) return

    setAddingMember(institutionId)
    try {
      const response = await fetch(`/api/institution/academic-communities/${community.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          member_id: institutionId
        })
      })

      if (response.ok) {
        await fetchMembers()
        onCommunityUpdated()
        setSearchQuery('')
        setSearchResults([])
      } else {
        const errorData = await response.json()
        console.error('Error adding member:', errorData.error)
      }
    } catch (error) {
      console.error('Error adding member:', error)
    } finally {
      setAddingMember(null)
    }
  }

  const isAlreadyMember = (institutionId: string) => {
    return members.some(member => member.member_id === institutionId)
  }

  if (!community) return null

  const memberCount = members.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {community.image_url ? (
                <Image
                  src={community.image_url}
                  alt={community.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building className="h-4 w-4 text-gray-500" />
              )}
            </div>
            {community.name}
          </DialogTitle>
          {community.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {community.description}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Current members summary */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              Current Members ({memberCount})
            </h4>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-500">Loading members...</span>
                </div>
              ) : members.length > 0 ? (
                members.slice(0, 8).map((member) => (
                  <div key={member.id} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={member.institution_profiles?.logo_url} />
                      <AvatarFallback className="text-xs">
                        {member.institution_profiles?.institution_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-16">
                      {member.institution_profiles?.institution_name}
                    </span>
                    {member.isCreator && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3">
                        Creator
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-500">No members yet</span>
              )}

              {members.length > 8 && (
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
                  +{members.length - 8} more
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Detailed member list */}
          {!loading && members.length > 0 && (
            <>
              <div>
                <h4 className="text-sm font-medium mb-3">All Members</h4>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.institution_profiles?.logo_url} />
                        <AvatarFallback className="text-xs">
                          {member.institution_profiles?.institution_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.institution_profiles?.institution_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {member.institution_profiles?.institution_type}
                        </p>
                      </div>
                      {member.isCreator && (
                        <Badge variant="secondary" className="text-xs">
                          Creator
                        </Badge>
                      )}
                      {member.institution_profiles?.verified && (
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Search and add institutions - Only show if not in view mode */}
          {!isViewMode && (
            <div>
              <h4 className="text-sm font-medium mb-3">
                Add Institutions to Community
              </h4>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  placeholder="Search institutions to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Searching...</span>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.map((institution) => {
                      const alreadyMember = isAlreadyMember(institution.id)
                      const isAdding = addingMember === institution.id

                      return (
                        <div 
                          key={institution.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            window.open(`/public-view/institution/profile/${institution.id}`, '_blank');
                          }}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={institution.logo} />
                            <AvatarFallback className="text-xs">
                              {institution.name[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {institution.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {institution.type}
                              </Badge>
                              {institution.location && (
                                <span className="text-xs text-gray-500 truncate">
                                  {institution.location}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {alreadyMember ? (
                              <Badge variant="secondary" className="text-xs">
                                Already Member
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addMember(institution.id);
                                }}
                                disabled={isAdding}
                                className="text-xs"
                              >
                                {isAdding ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Plus className="h-3 w-3 mr-1" />
                                )}
                                Add to Community
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No institutions found matching your search
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}