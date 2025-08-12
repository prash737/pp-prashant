"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import InternalNavbar from "@/components/internal-navbar";
import Footer from "@/components/footer";
import ProtectedLayout from "@/app/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Check,
  X,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ConnectionRequest {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role: string;
    bio?: string;
  };
}

interface CircleInvitation {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  circle: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  inviter: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role: string;
  };
}

export default function NotificationsPage() {
  const { user, loading, profileData } = useAuth();
  const [connectionRequests, setConnectionRequests] = useState<
    ConnectionRequest[]
  >([]);
  const [circleInvitations, setCircleInvitations] = useState<
    CircleInvitation[]
  >([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "student") {
      router.push("/feed");
      return;
    }

    fetchNotifications();
  }, [user, loading, router]);

  const fetchNotifications = async () => {
    try {
      // Use cached profile data if available
      if (profileData?.connectionRequests && profileData?.circleInvitations) {
        setConnectionRequests(
          profileData.connectionRequests.received.filter((req: ConnectionRequest) => req.status === "pending")
        );
        setCircleInvitations(
          profileData.circleInvitations.filter((inv: CircleInvitation) => inv.status === "pending")
        );
        setLoadingRequests(false);
        return;
      }

      // Fallback to separate API calls if cached data not available
      const [connectionResponse, circleResponse] = await Promise.all([
        fetch("/api/connections/requests?type=received"),
        fetch("/api/circles/invitations?type=received"),
      ]);

      if (connectionResponse.ok) {
        const requests = await connectionResponse.json();
        setConnectionRequests(
          requests.filter((req: ConnectionRequest) => req.status === "pending"),
        );
      }

      if (circleResponse.ok) {
        const invitations = await circleResponse.json();
        setCircleInvitations(
          invitations.filter(
            (inv: CircleInvitation) => inv.status === "pending",
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleConnectionRequest = async (
    requestId: string,
    action: "accept" | "decline",
  ) => {
    setProcessingRequest(requestId);
    try {
      const response = await fetch(`/api/connections/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        toast.success(`Connection request ${action}ed successfully`);
        fetchNotifications(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleCircleInvitation = async (
    invitationId: string,
    action: "accept" | "decline",
  ) => {
    setProcessingRequest(invitationId);
    try {
      const response = await fetch(`/api/circles/invitations/${invitationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        toast.success(`Circle invitation ${action}ed successfully`);
        fetchNotifications(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} invitation`);
      }
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
      toast.error(`Failed to ${action} invitation`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "mentor":
        return "bg-green-100 text-green-800";
      case "institution":
        return "bg-purple-100 text-purple-800";
      case "student":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "users":
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (loading || loadingRequests) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading notifications...
              </p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    );
  }

  const totalNotifications =
    connectionRequests.length + circleInvitations.length;

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your connection requests and circle invitations
              </p>
            </div>

            {totalNotifications === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You're all caught up! New requests will appear here.
                </p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pending Requests ({totalNotifications})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="connections" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="connections">
                        Connection Requests ({connectionRequests.length})
                      </TabsTrigger>
                      <TabsTrigger value="circles">
                        Circle Invitations ({circleInvitations.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="connections" className="mt-6">
                      <div className="space-y-4">
                        {connectionRequests.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <UserPlus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No pending connection requests</p>
                          </div>
                        ) : (
                          connectionRequests.map((request) => (
                            <Card
                              key={request.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3 flex-1">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage
                                        src={
                                          request.sender.profileImageUrl ||
                                          "/images/default-profile.png"
                                        }
                                        alt={`${request.sender.firstName} ${request.sender.lastName}`}
                                      />
                                      <AvatarFallback>
                                        {request.sender.firstName[0]}
                                        {request.sender.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                          {request.sender.firstName}{" "}
                                          {request.sender.lastName}
                                        </h4>
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${getRoleColor(request.sender.role)}`}
                                        >
                                          {request.sender.role}
                                        </Badge>
                                      </div>

                                      {request.sender.bio && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                          {request.sender.bio}
                                        </p>
                                      )}

                                      {request.message && (
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                                          <div className="flex items-start space-x-2">
                                            <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                              "{request.message}"
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      <p className="text-xs text-gray-500">
                                        {new Date(
                                          request.createdAt,
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex space-x-2 ml-4">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleConnectionRequest(
                                          request.id,
                                          "accept",
                                        )
                                      }
                                      disabled={
                                        processingRequest === request.id
                                      }
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      {processingRequest === request.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleConnectionRequest(
                                          request.id,
                                          "decline",
                                        )
                                      }
                                      disabled={
                                        processingRequest === request.id
                                      }
                                      className="border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="circles" className="mt-6">
                      <div className="space-y-4">
                        {circleInvitations.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No pending circle invitations</p>
                          </div>
                        ) : (
                          circleInvitations.map((invitation) => (
                            <Card
                              key={invitation.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3 flex-1">
                                    <div
                                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm"
                                      style={{
                                        backgroundColor:
                                          invitation.circle.color,
                                      }}
                                    >
                                      {invitation.circle.icon &&
                                      (invitation.circle.icon.startsWith(
                                        "data:image",
                                      ) ||
                                        invitation.circle.icon.startsWith(
                                          "/uploads/",
                                        )) ? (
                                        <Image
                                          src={invitation.circle.icon}
                                          alt={invitation.circle.name}
                                          width={48}
                                          height={48}
                                          className="w-full h-full object-cover rounded-full"
                                        />
                                      ) : (
                                        getIconComponent(invitation.circle.icon)
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                          {invitation.circle.name}
                                        </h4>
                                      </div>

                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Invited by{" "}
                                        {invitation.inviter.firstName}{" "}
                                        {invitation.inviter.lastName}
                                      </p>

                                      {invitation.message && (
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                                          <div className="flex items-start space-x-2">
                                            <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                              "{invitation.message}"
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      <p className="text-xs text-gray-500">
                                        {new Date(
                                          invitation.createdAt,
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex space-x-2 ml-4">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleCircleInvitation(
                                          invitation.id,
                                          "accept",
                                        )
                                      }
                                      disabled={
                                        processingRequest === invitation.id
                                      }
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      {processingRequest === invitation.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleCircleInvitation(
                                          invitation.id,
                                          "decline",
                                        )
                                      }
                                      disabled={
                                        processingRequest === invitation.id
                                      }
                                      className="border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  );
}
