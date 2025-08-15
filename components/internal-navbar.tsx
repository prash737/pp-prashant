"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search, Bell, Menu, X, User, Users, Building, MessageCircle, Home, UserPlus, UserCheck, UserMinus, LogOut, Settings, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";

interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
}

export function InternalNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const { totalCount: notificationCount, loading: notificationsLoading } = useNotifications();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [followStatus, setFollowStatus] = useState<{ [institutionId: string]: boolean }>({});
  const [followLoading, setFollowLoading] = useState<{ [institutionId: string]: boolean }>({});

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        // Import the enhanced cache clearing function
        const { clearAllUserData } = await import('@/hooks/use-auth')

        // Clear all user data and storage
        clearAllUserData()

        // Clear any additional browser storage
        if (typeof window !== 'undefined') {
          // Clear all cookies by setting them to expire
          document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=")
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
          })

          // Force a hard reload after a brief delay to ensure all storage is cleared
          setTimeout(() => {
            window.location.href = '/login'
          }, 100)
        } else {
          // Fallback for server-side
          router.push('/login')
        }

        // Show success message
        toast.success("Logged out successfully. All session data cleared.")
      } else {
        throw new Error(data.error || 'Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error("Failed to logout. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          console.log('🔍 Navbar: User data fetched:', userData);
          setUser(userData);
        } else {
          console.warn('🔍 Navbar: Failed to fetch user data');
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    const fetchConnections = async () => {
      try {
        const response = await fetch("/api/connections", {
          credentials: "include",
        });
        if (response.ok) {
          const connectionsData = await response.json();
          setConnections(connectionsData);
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    const fetchPendingRequests = async () => {
      try {
        const response = await fetch("/api/connections/requests?type=sent", {
          credentials: "include",
        });
        if (response.ok) {
          const requestsData = await response.json();
          setPendingRequests(requestsData);
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchUser();
    fetchConnections();
    fetchPendingRequests();
  }, []);

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setFollowStatus({});
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
        setShowSearchResults(true);

        // Get follow status for institutions
        const institutionIds = users.filter((user: SearchUser) => user.role === 'institution').map((user: SearchUser) => user.id);
        if (institutionIds.length > 0) {
          await checkFollowStatus(institutionIds);
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const checkFollowStatus = async (institutionIds: string[]) => {
    try {
      const response = await fetch(`/api/institutions/follow-status?ids=${institutionIds.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        setFollowStatus(data.followStatus);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async (institutionId: string, isFollowing: boolean) => {
    setFollowLoading(prev => ({ ...prev, [institutionId]: true }));

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch('/api/institutions/follow', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ institutionId })
      });

      if (response.ok) {
        setFollowStatus(prev => ({
          ...prev,
          [institutionId]: !isFollowing
        }));
      } else {
        console.error('Failed to toggle follow status');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [institutionId]: false }));
    }
  };

  const getConnectionStatus = (userId: string) => {
    // Check if already connected
    const isConnected = connections.some(conn => conn.user.id === userId);
    if (isConnected) return 'connected';

    // Check if request is pending
    const isPending = pendingRequests.some(req => req.receiverId === userId);
    if (isPending) return 'pending';

    return 'none';
  };

  const sendConnectionRequest = async (receiverId: string) => {
    if (!user) return;

    setSendingRequest(receiverId);
    try {
      const response = await fetch("/api/connections/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId,
          message: `Hi! I'd like to connect with you on PathPiper.`,
        }),
      });

      if (response.ok) {
        // Add to pending requests instead of removing from search
        setPendingRequests(prev => [...prev, { receiverId, status: 'pending' }]);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send connection request");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert("Failed to send connection request");
    } finally {
      setSendingRequest(null);
    }
  };

  const handleProfileClick = (userId: string) => {
    setShowSearchResults(false);
    setSearchQuery("");
    router.push(`/student/profile/view/${userId}`);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById("search-container");
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to get profile URL based on user role
  const getProfileUrl = () => {
    if (!user || userLoading) return "/student/profile"; // Default fallback

    console.log('🔍 Navbar: Getting profile URL for user role:', user.role, 'user ID:', user.id);

    switch (user.role) {
      case "institution":
        return "/institution/profile";
      case "mentor":
        return "/mentor/profile";
      case "student":
      default:
        return `/student/profile/${user.id}`;
    }
  };

  

  // Navigation items for logged-in users
  const navItems = [
    { name: "Feed", href: "/feed", icon: <Home size={20} /> },
    { name: "Explore", href: "/explore", icon: <Search size={20} /> },
    { name: "Messages", href: "/messages", icon: <MessageCircle size={20} /> },
    { 
      name: "Profile", 
      href: getProfileUrl(), 
      icon: <User size={20} />
    },
  ];

  return (
    <>
      {/* Top navigation for desktop and tablet */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="py-3 flex items-center justify-between">
            <Link href="/feed" className="flex items-center">
              <div
                className={`transition-all duration-300 h-${scrolled ? "10" : "12"}`}
              >
                <Image
                  src="/images/pathpiper-logo-full.png"
                  width={scrolled ? 180 : 220}
                  height={scrolled ? 30 : 36}
                  alt="PathPiper Logo"
                  className="h-full w-auto"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative" id="search-container">
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  suppressHydrationWarning
                />
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 min-w-[400px]">
                    {searchLoading && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-pathpiper-teal" />
                        <span className="ml-2 text-sm text-gray-500">
                          Searching...
                        </span>
                      </div>
                    )}

                    {!searchLoading &&
                      searchQuery.length >= 2 &&
                      searchResults.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No users found matching "{searchQuery}"</p>
                        </div>
                      )}

                    {searchResults.map((searchUser) => (
                      <div
                        key={searchUser.id}
                        className="flex items-start space-x-3 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="flex items-start space-x-3 flex-1 cursor-pointer"
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery("");
                            if (searchUser.id === user?.id) {
                              router.push(`/student/profile/${user.id}`);
                            } else {
                              if (searchUser.role === 'student') {
                                router.push(`/public-view/student/profile/${searchUser.id}`);
                              } else if (searchUser.role === 'institution') {
                                router.push(`/public-view/institution/profile/${searchUser.id}`);
                              } else {
                                // Handle other roles or provide a default
                                console.warn('Unsupported role:', searchUser.role);
                              }
                            }
                          }}
                        >
                          <div className="relative">
                            <Image
                              src={searchUser.profileImageUrl || "/images/default-profile.png"}
                              alt={`${searchUser.firstName} ${searchUser.lastName}`}
                              width={48}
                              height={48}
                              className="rounded-full border-2 border-gray-100"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-sm text-gray-900">
                                {searchUser.firstName} {searchUser.lastName}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 font-medium ${getRoleColor(searchUser.role)}`}
                              >
                                {searchUser.role}
                              </Badge>
                            </div>

                            {searchUser.bio && (
                              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                {searchUser.bio}
                              </p>
                            )}

                            {searchUser.location && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {searchUser.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {searchUser.role === 'institution' ? (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(searchUser.id, followStatus[searchUser.id]);
                            }}
                            disabled={followLoading[searchUser.id]}
                            className={`shrink-0 px-3 py-1.5 text-xs font-medium ${
                              followStatus[searchUser.id]
                                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                : "bg-pathpiper-teal hover:bg-pathpiper-teal/90 text-white"
                            }`}
                          >
                            {followLoading[searchUser.id] ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : followStatus[searchUser.id] ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3 mr-1" />
                                Follow
                              </>
                            )}
                          </Button>
                        ) : (
                          (() => {
                            const status = getConnectionStatus(searchUser.id);
                            if (status === 'connected') {
                              return (
                                <Button
                                  size="sm"
                                  disabled
                                  className="shrink-0 bg-green-100 text-green-800 px-3 py-1.5 text-xs font-medium cursor-not-allowed"
                                >
                                  Connected
                                </Button>
                              );
                            } else if (status === 'pending') {
                              return (
                                <Button
                                  size="sm"
                                  disabled
                                  className="shrink-0 bg-yellow-100 text-yellow-800 px-3 py-1.5 text-xs font-medium cursor-not-allowed"
                                >
                                  Pending
                                </Button>
                              );
                            } else {
                              return (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendConnectionRequest(searchUser.id);
                                  }}
                                  disabled={sendingRequest === searchUser.id}
                                  className="shrink-0 bg-pathpiper-teal hover:bg-pathpiper-teal/90 text-white px-3 py-1.5 text-xs font-medium"
                                >
                                  {sendingRequest === searchUser.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      Connect
                                    </>
                                  )}
                                </Button>
                              );
                            }
                          })()
                        )}
                      </div>
                    ))}

                    {searchQuery.length < 2 && (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">
                          Type at least 2 characters to search for users
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {navItems.map((link) => {
                if (link.name === "Profile") {
                  return (
                    <button
                      key={link.name}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!userLoading && user?.id) {
                          const directUrl = user.role === 'student' ? `/student/profile/${user.id}` : link.href;
                          router.push(directUrl);
                        }
                      }}
                      className={`text-slate-700 hover:text-teal-500 transition-colors font-medium flex items-center gap-1 ${
                        pathname === link.href || pathname === `/student/profile/${user?.id}` ? "text-teal-500" : ""
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-slate-700 hover:text-teal-500 transition-colors font-medium flex items-center gap-1 ${
                      pathname === link.href ? "text-teal-500" : ""
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <Link href="/notifications" className="relative">
                <Bell
                  size={24}
                  className="text-slate-700 hover:text-teal-500 transition-colors"
                />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>

              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:text-red-500 hover:bg-red-50"
                suppressHydrationWarning
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Navigation Toggle */}
            <button
              className="md:hidden text-slate-700"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white"
              >
                <div className="py-4 flex flex-col space-y-4">
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200">
                      {user?.profileImageUrl ? (
                        <Image
                          src={user.profileImageUrl}
                          alt={user ? `${user.firstName} ${user.lastName}` : "Profile"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                          {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {user ? (
                          user.firstName || user.lastName ? 
                            `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                            'User'
                        ) : 'Loading...'}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {user?.role || 'Student'}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full"
                      suppressHydrationWarning
                    />
                    <Search
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                  <Link
                    href="/settings"
                    className="text-slate-700 hover:text-teal-500 transition-colors py-2 font-medium flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings size={20} />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="text-slate-700 hover:text-red-500 transition-colors py-2 font-medium flex items-center gap-2 w-full text-left"
                  >
                    <LogOut size={20} />
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            if (item.name === "Profile") {
              return (
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!userLoading && user?.id) {
                      const directUrl = user.role === 'student' ? `/student/profile/${user.id}` : item.href;
                      router.push(directUrl);
                    } else {
                      item.onClick?.(e);
                    }
                  }}
                  className={`flex flex-col items-center p-2 ${
                    pathname === item.href || pathname === `/student/profile/${user?.id}`
                      ? "text-teal-500"
                      : "text-gray-500 hover:text-teal-500"
                  }`}
                >
                  {item.icon}
                  <span className="text-xs mt-1">{item.name}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center p-2 ${
                  pathname === item.href
                    ? "text-teal-500"
                    : "text-gray-500 hover:text-teal-500"
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
          <Link href="/notifications" className="relative flex flex-col items-center p-2 text-gray-500 hover:text-teal-500">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
            <span className="text-xs mt-1">Alerts</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export default InternalNavbar;