"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { invalidateUserCache } from '@/hooks/use-auth'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Mail, Shield, GraduationCap, Building, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PipLoader from "@/components/loading/pip-loader"

function LoginPageContent() {
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [institutionEmail, setInstitutionEmail] = useState("")
  const [institutionPassword, setInstitutionPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState("user")
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [successMessage, setSuccessMessage] = useState("")
  const [verificationAlerts, setVerificationAlerts] = useState({
    needsParentApproval: false,
    needsEmailVerification: false,
    message: ""
  })

  // Track mouse position for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      // Calculate mouse position relative to container (0-100)
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setMousePosition({ x, y })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [])

  useEffect(() => {
    const emailVerified = searchParams.get('email_verified')
    if (emailVerified === 'true') {
      setSuccessMessage("Your email has been verified! Now once your parent approves your account you will be able to login!")
    }
  }, [searchParams])

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setVerificationAlerts({
      needsParentApproval: false,
      needsEmailVerification: false,
      message: ""
    })

    if (!userEmail || !userPassword) {
      toast.error("Please fill in all fields")
      setLoading(false)
      return
    }

    try {
      // Clear any cached user data and storage before login
      invalidateUserCache()

      // Clear any residual storage to ensure fresh session
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (error) {
        console.log('Storage clear error:', error)
      }

      // Use the new unified user login endpoint
      const response = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, password: userPassword }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.status === 403) {
        setVerificationAlerts({
          needsParentApproval: data.needsParentApproval || false,
          needsEmailVerification: data.needsEmailVerification || false,
          message: data.error || "Verification required"
        })

        // Clear form fields
        setUserEmail("")
        setUserPassword("")
        setLoading(false)
        return
      }

      if (data.success) {
        toast.success("Login successful!")
        setIsRedirecting(true)

        // Determine redirect path based on user type and onboarding status
        let redirectPath = '/feed' // default

        if (data.userType === 'student') {
          if (data.onboardingCompleted) {
            // Redirect directly to the user's profile with their ID
            router.push(`/student/profile/${data.userId}`)
          } else {
            router.push('/onboarding')
          }
        } else if (data.userType === 'parent') {
          router.push('/parent/dashboard')
        }
        
        // Reduced delay for faster redirect
        setTimeout(() => {
          // The actual navigation happens via router.push above.
          // This timeout is primarily to ensure `isRedirecting` is true when the component re-renders
          // or if there's a subsequent client-side navigation.
        }, 500) 
      } else {
        // Check if it's a parent approval error
        if (data.needsParentApproval) {
          // Show prominent parent approval warning
          toast.error(
            <div className="flex flex-col space-y-3 p-2">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">👨‍👩‍👧‍👦</div>
                <div>
                  <div className="font-bold text-base">Parent Approval Required</div>
                  <div className="text-sm opacity-90">Account pending approval</div>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-orange-800">
                  Please wait for your parent to approve your account first. 
                  Check your parent's email for the approval link.
                </p>
              </div>
            </div>,
            {
              duration: 8000,
              style: {
                background: '#FEF3C7',
                border: '2px solid #F59E0B',
                borderRadius: '12px',
                minWidth: '400px'
              }
            }
          )
        } else {
          throw new Error(data.error || 'Login failed')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleInstitutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!institutionEmail || !institutionPassword) {
      toast.error("Please fill in all fields")
      setLoading(false)
      return
    }

    try {
      // Clear any cached user data and storage before login
      invalidateUserCache()

      // Clear any residual storage to ensure fresh session
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (error) {
        console.log('Storage clear error:', error)
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: institutionEmail, 
          password: institutionPassword, 
          expectedRole: 'institution' 
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        // Verify the user role matches expected type for institution
        if (data.role !== 'institution') {
          toast.error(`This account is registered as a ${data.role}, not an institution. Please use the correct login section.`)
          setLoading(false)
          return
        }

        toast.success("Login successful!")
        setIsRedirecting(true)

        // Determine redirect path based on onboarding status
        const redirectPath = data.onboardingCompleted ? '/institution/profile' : '/institution-onboarding'

        // Force a hard navigation to ensure fresh session
        setTimeout(() => {
          window.location.href = redirectPath
        }, 1000)
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Institution login error:', error)
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  // Suppress hydration warnings for browser extension attributes
  useEffect(() => {
    // This runs only on client side to suppress hydration mismatches
    // caused by browser extensions adding attributes like fdprocessedid
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Interactive Pip Loading overlay when redirecting */}
      <PipLoader isVisible={isRedirecting} />

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
        <div>
          <Link href="/signup">
            <Button variant="ghost" className="text-teal-500 hover:text-teal-600 hover:bg-teal-50" suppressHydrationWarning>
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left side - Visual content with Pip character */}
        <div className="hidden md:block md:w-1/2 relative pt-[20px] pb-[20px]">
          <div
            ref={containerRef}
            className="ml-[20px] rounded-2xl relative overflow-hidden flex flex-col p-8 h-full"
            style={{ width: "calc(100% - 20px)" }}
          >
            {/* Interactive gradient background */}
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                  rgba(45, 212, 191, 0.5) 0%, 
                  rgba(147, 51, 234, 0.3) 25%, 
                  rgba(249, 115, 22, 0.2) 50%, 
                  rgba(59, 130, 246, 0.1) 75%, 
                  rgba(15, 23, 42, 0) 100%)`,
              }}
            />

            {/* Welcome back text - positioned at top left */}
            <div className="z-10 mb-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Welcome back to{" "}
                <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
                  PathPiper
                </span>
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                Continue your educational journey with us
              </p>
            </div>

            {/* Floating Pip character with bounce effect - larger size */}
            <motion.div
              className="relative z-10 mx-auto my-auto flex-grow flex items-center justify-center py-8"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                ease: "easeInOut",
              }}
              style={{
                filter: "drop-shadow(0px 10px 15px rgba(45, 212, 191, 0.3))",
              }}
            >
              <Image
                src="/images/pip-character.png"
                width={500}
                height={500}
                alt="Pip Character"
                className="w-[600px] h-auto"
                priority
              />
            </motion.div>

            {/* Animated floating orbs */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-teal-500/20 blur-xl"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                left: `calc(${mousePosition.x / 10}% + 10%)`,
                top: `calc(${mousePosition.y / 10}% + 20%)`,
              }}
            />

            <motion.div
              className="absolute w-40 h-40 rounded-full bg-purple-500/20 blur-xl"
              animate={{
                x: [0, -40, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                right: `calc(${mousePosition.x / 15}% + 10%)`,
                bottom: `calc(${mousePosition.y / 15}% + 20%)`,
              }}
            />

            <motion.div
              className="absolute w-24 h-24 rounded-full bg-yellow-500/20 blur-xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                left: `calc(${mousePosition.x / 12}% + 30%)`,
                bottom: `calc(${mousePosition.y / 12}% + 10%)`,
              }}
            />
          </div>
        </div>

        {/* Right side - Login forms */}
        <div className="w-full md:flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md mx-auto">
            <Card className="w-full border-0 shadow-none md:border md:shadow-sm">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription>
                  Choose your account type to sign in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {successMessage && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
                  </Alert>
                )}

                {verificationAlerts.needsEmailVerification && !verificationAlerts.needsParentApproval && (
                  <Alert className="border-blue-200 bg-blue-50 text-blue-800">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900 font-semibold mb-2">
                      Email Verification Required
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p className="text-blue-700">
                        Please verify your email address before logging in.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 text-blue-700">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">Check your inbox for a verification email</span>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                          Click the verification link in the email we sent you to activate your account.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {verificationAlerts.needsParentApproval && !verificationAlerts.needsEmailVerification && (
                  <Alert className="border-purple-200 bg-purple-50 text-purple-800">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <AlertTitle className="text-purple-900 font-semibold mb-2">
                      Parent Approval Required
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p className="text-purple-700">
                        Your account is waiting for parent/guardian approval.
                      </p>
                      <div className="bg-purple-100 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2 text-purple-700">
                          <Shield className="h-4 w-4" />
                          <span className="font-medium">Your parent needs to approve your account</span>
                        </div>
                        <p className="text-sm text-purple-600 mt-1">
                          We've sent an approval email to your parent/guardian. Please ask them to check their inbox.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {verificationAlerts.needsParentApproval && verificationAlerts.needsEmailVerification && (
                  <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                    <Shield className="h-4 w-4" />
                    <AlertTitle className="text-amber-900 font-semibold mb-2">
                      Account Verification Required
                    </AlertTitle>
                    <AlertDescription className="space-y-3">
                      <p className="text-amber-700">
                        Before you can log in, please complete both verification steps:
                      </p>

                      <div className="space-y-2">
                        <div className="bg-amber-100 p-3 rounded-lg border border-amber-200">
                          <div className="flex items-center space-x-2 text-amber-700">
                            <Mail className="h-4 w-4" />
                            <span className="font-medium">1. Verify your email address</span>
                          </div>
                          <p className="text-sm text-amber-600 mt-1">
                            Check your inbox for a verification email and click the link.
                          </p>
                        </div>

                        <div className="bg-amber-100 p-3 rounded-lg border border-amber-200">
                          <div className="flex items-center space-x-2 text-amber-700">
                            <Shield className="h-4 w-4" />
                            <span className="font-medium">2. Wait for parent approval</span>
                          </div>
                          <p className="text-sm text-amber-600 mt-1">
                            Your parent/guardian needs to approve your account via email.
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-amber-600">
                        Both steps must be completed before you can access your account.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user" className="flex items-center space-x-2 text-xs">
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </TabsTrigger>
                    <TabsTrigger value="institution" className="flex items-center space-x-2 text-xs">
                      <Building className="h-4 w-4" />
                      <span>Institution</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="user" className="space-y-4 mt-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">Student & Parent Login</p>
                    </div>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email</Label>
                        <Input
                          id="user-email"
                          type="email"
                          placeholder="Enter your email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          required
                          disabled={loading || isRedirecting}
                          className="rounded-lg border-slate-300"
                          suppressHydrationWarning
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-password">Password</Label>
                        <Input
                          id="user-password"
                          type="password"
                          placeholder="Enter your password"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          required
                          disabled={loading || isRedirecting}
                          className="rounded-lg border-slate-300"
                          suppressHydrationWarning
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full py-6"
                        disabled={loading || isRedirecting}
                        suppressHydrationWarning
                      >
                        {loading ? "Signing in..." : isRedirecting ? "Redirecting..." : "Sign in"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="institution" className="space-y-4 mt-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">Institution Login</p>
                    </div>
                    <form onSubmit={handleInstitutionSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="institution-email">Institution Email</Label>
                        <Input
                          id="institution-email"
                          type="email"
                          placeholder="Enter your institution email"
                          value={institutionEmail}
                          onChange={(e) => setInstitutionEmail(e.target.value)}
                          required
                          disabled={loading || isRedirecting}
                          className="rounded-lg border-slate-300"
                          suppressHydrationWarning
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="institution-password">Password</Label>
                        <Input
                          id="institution-password"
                          type="password"
                          placeholder="Enter your password"
                          value={institutionPassword}
                          onChange={(e) => setInstitutionPassword(e.target.value)}
                          required
                          disabled={loading || isRedirecting}
                          className="rounded-lg border-slate-300"
                          suppressHydrationWarning
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-400 to-orange-500 hover:from-purple-500 hover:to-orange-600 text-white rounded-full py-6"
                        disabled={loading || isRedirecting}
                        suppressHydrationWarning
                      >
                        {loading ? "Signing in..." : isRedirecting ? "Redirecting..." : "Sign in as Institution"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 text-center text-sm">
                  <Link 
                    href="/forgot-password" 
                    className="text-pathpiper-teal hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    className="text-pathpiper-teal hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto flex justify-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} PathPiper. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}