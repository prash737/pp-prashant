"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  GraduationCap,
  Building,
  MessageCircle,
  Calendar,
  Star,
  ChevronRight,
  UserPlus,
  Filter,
  Inbox,
  UserMinus,
  Trash2,
  Crown,
  Shield,
  Eye,
  Settings,
  Plus,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AddConnectionDialog from "./add-connection-dialog";
import ConnectionRequestsView from "./connection-requests-view";

interface Connection {
  id: string;
  connectionType: string;
  connectedAt: string;
  user: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    profileImageUrl?: string;
    role: string;
    bio?: string;
    location?: string;
    status: "online" | "offline" | "away";
    lastInteraction: string;
  };
}

interface Circle {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isDefault: boolean;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  memberships: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
      role: string;
      bio?: string;
      status?: "online" | "offline" | "away";
    };
  }>;
  _count: {
    memberships: number;
  };
}

// Circle Badges Section Component
function CircleBadgesSection({ 
  onCircleSelect, 
  currentUserId,
  isViewMode = false,
  studentId
}: { 
  onCircleSelect: (circle: Circle) => void;
  currentUserId?: string;
  isViewMode?: boolean;
  studentId?: string;
}) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleColor, setNewCircleColor] = useState('#3B82F6');
  const [newCircleDescription, setNewCircleDescription] = useState('');
  const [newCircleImageFile, setNewCircleImageFile] = useState<File | null>(null);
  const [newCircleImageUrl, setNewCircleImageUrl] = useState('');

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        let response;
        if (isViewMode && studentId) {
          // In view mode, fetch circles for the student being viewed
          response = await fetch(`/api/student/profile/${studentId}/circles`);
        } else {
          // In own profile mode, fetch circles for the current user
          response = await fetch("/api/circles");
        }
        
        if (response.ok) {
          const data = await response.json();
          
          // Filter out disabled circles in view mode
          if (isViewMode && studentId) {
            const enabledCircles = data.filter((circle: any) => {
              // Check if circle is globally disabled
              if (circle.isDisabled) return false;

              // Check if creator is disabled and the student being viewed is the creator
              if (circle.isCreatorDisabled && circle.creator?.id === studentId) {
                return false;
              }

              // Check if the student being viewed has disabled membership
              const studentMembership = circle.memberships?.find(
                (membership: any) => membership.user?.id === studentId
              );
              if (studentMembership && studentMembership.isDisabledMember) {
                return false;
              }

              return true;
            });
            setCircles(enabledCircles);
          } else {
            setCircles(data);
          }
        }
      } catch (error) {
        console.error("Error fetching circles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, [isViewMode, studentId]);

  // Function to check if circle should be disabled for current user
  const isCircleDisabled = (circle: any, currentUserId: string) => {
    if (!currentUserId) return false;

    // 1. Check if circle is globally disabled
    if (circle.isDisabled) {
      return true;
    }

    // 2. Check if creator is disabled and current user is the creator
    if (circle.isCreatorDisabled && circle.creator?.id === currentUserId) {
      return true;
    }

    // 3. Check if current user's membership is disabled
    const userMembership = circle.memberships?.find(
      (membership: any) => membership.user?.id === currentUserId
    );
    if (userMembership && userMembership.isDisabledMember) {
      return true;
    }

    return false;
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "crown":
        return <Crown className="h-4 w-4" />;
      case "shield":
        return <Shield className="h-4 w-4" />;
      case "star":
        return <Star className="h-4 w-4" />;
      case "graduation-cap":
        return <GraduationCap className="h-4 w-4" />;
      case "building":
        return <Building className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const handleCreateCircle = async () => {
    if (!newCircleName.trim()) return

    try {
      let iconPath = 'users' // default icon

      // Upload image if provided
      if (newCircleImageFile) {
        const formData = new FormData()
        formData.append('image', newCircleImageFile)
        formData.append('type', 'circle-icon')

        const uploadResponse = await fetch('/api/upload/circle-icon', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          iconPath = uploadResult.path
        }
      }

      const response = await fetch('/api/circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newCircleName.trim(),
          description: newCircleDescription.trim() || null,
          color: newCircleColor,
          icon: iconPath
        })
      })

      if (response.ok) {
        // Reset form
        setNewCircleName('')
        setNewCircleDescription('')
        setNewCircleColor('#3B82F6')
        setNewCircleImageFile(null)
        setNewCircleImageUrl('')
        setShowCreateCircle(false)

        // Refresh circles
        const fetchResponse = await fetch("/api/circles");
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setCircles(data);
        }
      } else {
        console.error('Failed to create circle')
      }
    } catch (error) {
      console.error('Error creating circle:', error)
    }
  }

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCircleImageFile(file);
      setNewCircleImageUrl(URL.createObjectURL(file));
    }
  };

  const colorOptions = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Circle Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              {isViewMode ? 'Circles' : 'My Circles'}
            </CardTitle>
            <Badge variant="secondary" className="ml-2">{circles.length} circles</Badge>
          </div>
          {!isViewMode && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0"
              title="Create new circle"
              onClick={() => setShowCreateCircle(true)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-6">
        {circles.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No circle badges yet</p>
            <p className="text-xs">Create your first circle!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 3-Column Grid Layout for all circles */}
            <div className="grid grid-cols-3 gap-4 py-3">
              {circles.map((circle) => {
                const targetUserId = isViewMode ? studentId : currentUserId;
                const isDisabled = targetUserId ? isCircleDisabled(circle, targetUserId) : false;

                // Skip rendering disabled circles in view mode
                if (isViewMode && isDisabled) {
                  return null;
                }

                // Debug logging
                if (isDisabled) {
                  console.log(`🔒 Circle "${circle.name}" is disabled for user ${targetUserId}:`, {
                    isGloballyDisabled: circle.isDisabled,
                    isCreatorDisabled: circle.isCreatorDisabled && circle.creator?.id === targetUserId,
                    isMemberDisabled: circle.memberships?.find(m => m.user?.id === targetUserId)?.isDisabledMember
                  });
                }

                return (
                  <div
                    key={circle.id}
                    className={`flex flex-col items-center group ${
                      isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    }`}
                    onClick={() => !isDisabled && onCircleSelect(circle)}
                  >
                    {/* Circle Badge */}
                    <div className="relative mb-2">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 overflow-hidden relative ${
                          isDisabled 
                            ? 'grayscale cursor-not-allowed bg-gray-400 opacity-50' 
                            : 'group-hover:shadow-xl group-hover:scale-105'
                        }`}
                        style={{ 
                          backgroundColor: isDisabled ? '#6B7280' : circle.color,
                          filter: isDisabled ? 'grayscale(1) brightness(0.6) contrast(0.8)' : 'none'
                        }}
                      >
                        {circle.icon && (circle.icon.startsWith('data:image') || circle.icon.startsWith('/uploads/')) ? (
                          <img
                            src={circle.icon}
                            alt={circle.name}
                            className={`w-full h-full object-cover rounded-full ${
                              isDisabled ? 'grayscale brightness-75' : ''
                            }`}
                          />
                        ) : (
                          <div className="scale-75">
                            {getIconComponent(circle.icon)}
                          </div>
                        )}

                        {/* Disabled overlay with cross */}
                        {isDisabled && (
                          <div className="absolute inset-0 rounded-full bg-black bg-opacity-60 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Member count indicator */}
                      <div className={`absolute -top-0.5 -right-0.5 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ${
                        isDisabled ? 'bg-gray-500' : 'bg-gray-900'
                      }`}>
                        <span className="text-xs leading-none">
                          {circle._count.memberships + 1}
                        </span>
                      </div>

                      {/* Default badge indicator */}
                      {circle.isDefault && (
                        <div className={`absolute -bottom-0.5 -right-0.5 text-white rounded-full w-3 h-3 flex items-center justify-center ${
                          isDisabled ? 'bg-gray-500' : 'bg-blue-500'
                        }`}>
                          <Crown className="h-1.5 w-1.5" />
                        </div>
                      )}
                    </div>

                    {/* Circle Name */}
                    <span className={`text-xs text-center font-medium truncate w-16 ${
                      isDisabled 
                        ? 'text-gray-400 dark:text-gray-500' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {circle.name}
                      {isDisabled && (
                        <div className="text-[10px] text-gray-400 mt-0.5">Disabled</div>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Create Circle Dialog */}
      {showCreateCircle && (
        <Dialog open={showCreateCircle} onOpenChange={setShowCreateCircle}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Circle Badge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Circle Name</label>
                <Input
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  placeholder="Enter circle name"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  value={newCircleDescription}
                  onChange={(e) => setNewCircleDescription(e.target.value)}
                  placeholder="Enter circle description"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Circle Icon</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    {newCircleImageUrl && (
                      <div className="flex items-center gap-2">
                        <img
                          src={newCircleImageUrl}
                          alt="Circle icon preview"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNewCircleImageUrl('')
                            setNewCircleImageFile(null)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload a custom icon or leave empty to use default icon
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((colorOption) => (
                    <button
                      key={colorOption}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCircleColor === colorOption ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setNewCircleColor(colorOption)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowCreateCircle(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateCircle} disabled={!newCircleName.trim()} className="flex-1">
                  Create Circle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

interface CircleViewProps {
  student: any;
  currentUserId?: string;
  isViewMode?: boolean;
}

export default function CircleView({ student, currentUserId, isViewMode }: CircleViewProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"connections" | "requests">(
    "connections",
  );
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [showCircleMembers, setShowCircleMembers] = useState(false);

    const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "crown":
        return <Crown className="h-4 w-4" />;
      case "shield":
        return <Shield className="h-4 w-4" />;
      case "star":
        return <Star className="h-4 w-4" />;
      case "graduation-cap":
        return <GraduationCap className="h-4 w-4" />;
      case "building":
        return <Building className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  // Use real student data
  const studentName = student?.profile
    ? `${student.profile.firstName} ${student.profile.lastName}`
    : "Student";
  const tagline = student?.profile?.tagline;
  const bio = student?.profile?.bio;
  const currentEducation = student?.educationHistory?.find(
    (edu: any) => edu.is_current || edu.isCurrent,
  );

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections");
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/connections/requests?type=received");
      if (response.ok) {
        const data = await response.json();
        const pending = data.filter(
          (req: any) => req.status === "pending",
        ).length;
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error("Error fetching connection requests:", error);
    }
  };

  const handleConnectionRequestSent = () => {
    // Refresh data when a new connection request is sent
    fetchConnections();
    fetchPendingRequests();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchConnections(), fetchPendingRequests()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  // Calculate stats from real data
  const totalConnections = connections.length;
  const mentorConnections = connections.filter(
    (c) => c.user.role === "mentor",
  ).length;
  const institutionConnections = connections.filter(
    (c) => c.user.role === "institution",
  ).length;

  const removeConnection = async (connectionId: string) => {
    try {
      // Optimistically update the UI
      setConnections((prevConnections) =>
        prevConnections.filter((connection) => connection.id !== connectionId),
      );

      const response = await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to remove connection");
        // Revert the UI update if the API call fails
        fetchConnections();
      }
    } catch (error) {
      console.error("Error removing connection:", error);
      // Revert the UI update if there's an error
      fetchConnections();
    }
  };

  const handleCircleSelect = (circle: Circle) => {
    setSelectedCircle(circle);
    setShowCircleMembers(true);
    setActiveView("connections");
  };

  const handleCloseCircleMembers = () => {
    setSelectedCircle(null);
    setShowCircleMembers(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Circle
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 text-blue-600 border-blue-200 bg-blue-50"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">{totalConnections}</span>
              <span className="text-xs text-gray-500">Total</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 text-green-600 border-green-200 bg-green-50"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="font-medium">{mentorConnections}</span>
              <span className="text-xs text-gray-500">Mentors</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 text-purple-600 border-purple-200 bg-purple-50"
            >
              <Building className="h-3.5 w-3.5" />
              <span className="font-medium">{institutionConnections}</span>
              <span className="text-xs text-gray-500">Institutions</span>
            </Badge>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with mentors, peers, and institutions
        </p>
      </div>

      {/* Navigation Tabs with Action Buttons */}
      <div className="flex justify-between items-center border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView("connections")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeView === "connections"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {isViewMode ? 'Connections' : 'My Connections'}
          </button>
          {!isViewMode && (
            <button
              onClick={() => setActiveView("requests")}
              className={`px-4 py-2 border-b-2 transition-colors flex items-center space-x-2 ${
                activeView === "requests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Inbox className="h-4 w-4" />
              <span>Requests</span>
              {pendingRequests > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingRequests}
                </Badge>
              )}
            </button>
          )}
        </div>

        {/* Action Buttons - Only show for connections view and when not in view mode */}
        {activeView === "connections" && !isViewMode && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <AddConnectionDialog
              onConnectionRequestSent={handleConnectionRequestSent}
            />
          </div>
        )}
      </div>

      {/* Content based on active view */}
      {activeView === "connections" ? (
        <div className="space-y-6">
          {/* Horizontal Layout: Circle Badges and Connections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Circle Badges Section - Takes 4 columns on large screens */}
            <div className="lg:col-span-4">
              <CircleBadgesSection 
                onCircleSelect={handleCircleSelect} 
                currentUserId={student?.id || currentUserId}
                isViewMode={isViewMode}
                studentId={student?.id}
              />
            </div>

            {/* Connections Section - Takes 8 columns on large screens */}
            <div className="lg:col-span-8">
              <Card>
                <CardHeader className="pb-4">
                  {showCircleMembers && selectedCircle && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white overflow-hidden"
                          style={{ backgroundColor: selectedCircle.color }}
                        >
                          {selectedCircle.icon && (selectedCircle.icon.startsWith('data:image') || selectedCircle.icon.startsWith('/uploads/')) ? (
                            <img
                              src={selectedCircle.icon}
                              alt={selectedCircle.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="scale-75">
                              {getIconComponent(selectedCircle.icon)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedCircle.name} Members
                          </h3>
                          {selectedCircle.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedCircle.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCloseCircleMembers}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="all">
                        All ({(() => {
                          if (showCircleMembers && selectedCircle) {
                            // Count all members in the selected circle (including creator)
                            return selectedCircle.memberships.length + 1;
                          }
                          return totalConnections;
                        })()})
                      </TabsTrigger>
                      <TabsTrigger value="mentors">
                        Mentors ({(() => {
                          if (showCircleMembers && selectedCircle) {
                            // Count only mentors in the selected circle
                            return selectedCircle.memberships.filter(
                              (membership: any) => membership.user.role === "mentor"
                            ).length;
                          }
                          return mentorConnections;
                        })()})
                      </TabsTrigger>
                      <TabsTrigger value="peers">
                        Peers ({(() => {
                          if (showCircleMembers && selectedCircle) {
                            // Count only students in the selected circle
                            return selectedCircle.memberships.filter(
                              (membership: any) => membership.user.role === "student"
                            ).length;
                          }
                          return connections.filter((c) => c.user.role === "student").length;
                        })()})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                      {(() => {
                        if (showCircleMembers && selectedCircle) {
                          // Show circle members
                          const allMembers = [
                            // Add creator as first member
                            {
                              user: {
                                id: selectedCircle.creator.id,
                                firstName: selectedCircle.creator.firstName,
                                lastName: selectedCircle.creator.lastName,
                                profileImageUrl: selectedCircle.creator.profileImageUrl,
                                role: "creator",
                                status: "online",
                                name: `${selectedCircle.creator.firstName} ${selectedCircle.creator.lastName}`,
                                bio: "",
                                lastInteraction: "Circle Creator"
                              }
                            },
                            // Add other members
                            ...selectedCircle.memberships.map(membership => ({
                              user: {
                                ...membership.user,
                                name: `${membership.user.firstName} ${membership.user.lastName}`,
                                lastInteraction: "Circle Member"
                              }
                            }))
                          ];

                          if (allMembers.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No members in this circle yet</p>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                              {allMembers.map((member, index) => (
                                <div
                                  key={`${member.user.id}-${index}`}
                                  className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                >
                                  <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                    <div className="relative">
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage
                                          src={member.user.profileImageUrl}
                                          alt={member.user.name}
                                        />
                                        <AvatarFallback className="text-sm">
                                          {member.user.firstName?.[0]}
                                          {member.user.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div
                                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.user.status || "offline")}`}
                                      />
                                    </div>

                                    <div className="w-full">
                                      <h3 className="font-medium text-xs truncate">
                                        {member.user.name}
                                        {member.user.role === "creator" && (
                                          <span className="text-blue-500 text-xs ml-1">(Creator)</span>
                                        )}
                                      </h3>
                                      <Badge
                                        variant="outline"
                                        className="text-xs mt-1"
                                      >
                                        {member.user.role === "creator" ? "creator" : member.user.role}
                                      </Badge>
                                    </div>

                                    {member.user.bio && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                        {member.user.bio}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-center space-x-1 w-full mt-3">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        title="Message"
                                      >
                                        <MessageCircle className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        title="Schedule"
                                      >
                                        <Calendar className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                    {member.user.lastInteraction}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // Show regular connections
                        const filteredConnections = connections;

                        if (filteredConnections.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              <p>No connections yet</p>
                              <p className="text-sm">
                                Start by adding some connections!
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredConnections.map((connection) => (
                              <div
                                key={connection.id}
                                className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                              >
                                <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                  <div className="relative">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage
                                        src={
                                          connection.user.profileImageUrl ||
                                          connection.user.avatar
                                        }
                                        alt={connection.user.name}
                                      />
                                      <AvatarFallback className="text-sm">
                                        {connection.user.firstName?.[0]}
                                        {connection.user.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div
                                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`}
                                    />
                                  </div>

                                  <div className="w-full">
                                    <h3 className="font-medium text-xs truncate">
                                      {connection.user.name}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-1"
                                    >
                                      {connection.user.role}
                                    </Badge>
                                  </div>

                                  {connection.user.bio && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                      {connection.user.bio}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-center spacex-1 w-full mt-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      title="Message"
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                     title="Schedule"
                                    >
                                      <Calendar className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeConnection(connection.id)
                                      }
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      title="Remove"
                                    >
                                      <UserMinus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                  {connection.user.lastInteraction}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </TabsContent>

                    <TabsContent value="mentors" className="mt-0">
                      {(() => {
                        if (showCircleMembers && selectedCircle) {
                          // Show only mentors from circle
                          const mentorMembers = selectedCircle.memberships.filter(
                            membership => membership.user.role === "mentor"
                          ).map(membership => ({
                            user: {
                              ...membership.user,
                              name: `${membership.user.firstName} ${membership.user.lastName}`,
                              lastInteraction: "Circle Member"
                            }
                          }));

                          if (mentorMembers.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No mentors in this circle yet</p>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                              {mentorMembers.map((member, index) => (
                                <div
                                  key={`${member.user.id}-${index}`}
                                  className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                >
                                  <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                    <div className="relative">
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage
                                          src={member.user.profileImageUrl}
                                          alt={member.user.name}
                                        />
                                        <AvatarFallback className="text-sm">
                                          {member.user.firstName?.[0]}
                                          {member.user.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div
                                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.user.status || "offline")}`}
                                      />
                                      <Star className="absolute -top-1 -left-1 h-4 w-4 text-yellow-500 bg-white rounded-full p-0.5" />
                                    </div>

                                    <div className="w-full">
                                      <h3 className="font-medium text-xs truncate">
                                        {member.user.name}
                                      </h3>
                                      <Badge
                                        variant="outline"
                                        className="text-xs mt-1 bg-green-50 text-green-700 border-green-200"
                                      >
                                        mentor
                                      </Badge>
                                    </div>

                                    {member.user.bio && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                        {member.user.bio}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-center space-x-1 w-full mt-3">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        title="Message"
                                      >
                                        <MessageCircle className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        title="Schedule"
                                      >
                                        <Calendar className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                    {member.user.lastInteraction}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        const filteredConnections = connections.filter(
                          (c) => c.user.role === "mentor",
                        );

                        if (filteredConnections.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              <p>No mentors yet</p>
                              <p className="text-sm">
                                Connect with mentors to gain guidance!
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredConnections.map((connection) => (
                              <div
                                key={connection.id}
                                className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                              >
                                <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                  <div className="relative">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage
                                        src={
                                          connection.user.profileImageUrl ||
                                          connection.user.avatar
                                        }
                                        alt={connection.user.name}
                                      />
                                      <AvatarFallback className="text-sm">
                                        {connection.user.firstName?.[0]}
                                        {connection.user.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div
                                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`}
                                    />
                                    <Star className="absolute -top-1 -left-1 h-4 w-4 text-yellow-500 bg-white rounded-full p-0.5" />
                                  </div>

                                  <div className="w-full">
                                    <h3 className="font-medium text-xs truncate">
                                      {connection.user.name}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-1 bg-green-50 text-green-700 border-green-200"
                                    >
                                      mentor
                                    </Badge>
                                  </div>

                                  {connection.user.bio && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                      {connection.user.bio}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-center space-x-1 w-full mt-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      title="Message"
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      title="Schedule"
                                    >
                                      <Calendar className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeConnection(connection.id)
                                      }
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      title="Remove"
                                    >
                                      <UserMinus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                  {connection.user.lastInteraction}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </TabsContent>

                    <TabsContent value="peers" className="mt-0">
                      {(() => {
                        if (showCircleMembers && selectedCircle) {
                          // Show only students from circle
                          const peerMembers = selectedCircle.memberships.filter(
                            membership => membership.user.role === "student"
                          ).map(membership => ({
                            user: {
                              ...membership.user,
                              name: `${membership.user.firstName} ${membership.user.lastName}`,
                              lastInteraction: "Circle Member"
                            }
                          }));

                          if (peerMembers.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No peers in this circle yet</p>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                              {peerMembers.map((member, index) => (
                                <div
                                  key={`${member.user.id}-${index}`}
                                  className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                >
                                  <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                    <div className="relative">
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage
                                          src={member.user.profileImageUrl}
                                          alt={member.user.name}
                                        />
                                        <AvatarFallback className="text-sm">
                                          {member.user.firstName?.[0]}
                                          {member.user.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div
                                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.user.status || "offline")}`}
                                      />
                                    </div>

                                    <div className="w-full">
                                      <h3 className="font-medium text-xs truncate">
                                        {member.user.name}
                                      </h3>
                                      <Badge
                                        variant="outline"
                                        className="text-xs mt-1 bg-blue-50 text-blue-700 border-blue-200"
                                      >
                                        peer
                                      </Badge>
                                    </div>

                                    {member.user.bio && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                        {member.user.bio}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-center space-x-1 w-full mt-3">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        title="Message"
                                      >
                                        <MessageCircle className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        title="Schedule"
                                      >
                                        <Calendar className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                    {member.user.lastInteraction}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        const filteredConnections = connections.filter(
                          (c) => c.user.role === "student",
                        );

                        if (filteredConnections.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              <p>No peers yet</p>
                              <p className="text-sm">
                                Connect with peers to collaborate!
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredConnections.map((connection) => (
                              <div
                                key={connection.id}
                                className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                              >
                                <div className="flex flex-col items-center text-center space-y-2 pb-6">
                                  <div className="relative">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage
                                        src={
                                          connection.user.profileImageUrl ||
                                          connection.user.avatar
                                        }
                                        alt={connection.user.name}
                                      />
                                      <AvatarFallback className="text-sm">
                                        {connection.user.firstName?.[0]}
                                        {connection.user.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div
                                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(connection.user.status)}`}
                                    />
                                  </div>

                                  <div className="w-full">
                                    <h3 className="font-medium text-xs truncate">
                                      {connection.user.name}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-1 bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      peer
                                    </Badge>
                                  </div>

                                  {connection.user.bio && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 px-1">
                                      {connection.user.bio}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-center space-x-1 w-full mt-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      title="Message"
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      title="Schedule"
                                    >
                                      <Calendar className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeConnection(connection.id)
                                      }
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      title="Remove"
                                    >
                                      <UserMinus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-400 text-center truncate border-t border-gray-100 pt-1">
                                  {connection.user.lastInteraction}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <ConnectionRequestsView />
      )}
    </div>
  );
}