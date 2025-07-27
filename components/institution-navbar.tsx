"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell,
  Home,
  Search,
  MessageCircle,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  UserPlus,
  Loader2,
  Users,
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

export function InstitutionNavbar() {
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        // Clear all user data and storage without dynamic import
        if (typeof window !== 'undefined') {
          // Clear localStorage
          localStorage.clear()

          // Clear sessionStorage
          sessionStorage.clear()

          // Clear all cookies by setting them to expire
          const cookies = document.cookie.split(";")
          cookies.forEach(cookie => {
            const eqPos = cookie.indexOf("=")
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
            if (name) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
            }
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
          console.log('🔍 Institution Navbar: User data fetched:', userData);
          setUser(userData);
        } else {
          console.warn('🔍 Institution Navbar: Failed to fetch user data');
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
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchLoading(false);
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

  const handleProfileClick = (userId: string, userRole: string) => {
    setShowSearchResults(false);
    setSearchQuery("");

    // Always use public view for cross-role profile viewing
    if (userRole === 'student') {
      router.push(`/public-view/student/profile/${userId}`);
    } else if (userRole === 'institution') {
      router.push(`/public-view/institution/profile/${userId}`);
    } else if (userRole === 'mentor') {
      // When mentor public view is implemented
      console.log('Mentor profile view not yet implemented');
    } else {
      console.warn('Unsupported role:', userRole);
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

  // Function to handle profile navigation with reload
  const handleProfileNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/institution/profile';
  };

  // Navigation items for institutions - fixed profile URL
  const navItems = [
    { name: "Feed", href: "/feed", icon: <Home size={20} /> },
    { name: "Explore", href: "/explore", icon: <Search size={20} /> },
    { name: "Messages", href: "/messages", icon: <MessageCircle size={20} /> },
    { 
      name: "Profile", 
      href: "/institution/profile", 
      icon: <User size={20} />,
      onClick: handleProfileNavigation
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
                          onClick={() => handleProfileClick(searchUser.id, searchUser.role)}
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
                      onClick={link.onClick}
                      className={`text-slate-700 hover:text-teal-500 transition-colors font-medium flex items-center gap-1 ${
                        pathname === link.href ? "text-teal-500" : ""
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

              <Link href="/institution/notifications" className="relative">
                <Bell
                  size={24}
                  className="text-slate-700 hover:text-teal-500 transition-colors"
                />
                {!notificationsLoading && notificationCount > 0 && (
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
                        {user?.role || 'Institution'}
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
                  onClick={item.onClick}
                  className={`flex flex-col items-center p-2 ${
                    pathname === item.href
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
          <Link href="/institution/notifications" className="relative flex flex-col items-center p-2 text-gray-500 hover:text-teal-500">
            <Bell size={20} />
            {!notificationsLoading && notificationCount > 0 && (
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

export default InstitutionNavbar;