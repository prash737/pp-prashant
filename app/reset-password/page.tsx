
"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"

function ResetPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get email from URL parameters and check session status
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }

    // Check for auth tokens in URL hash and set up session
    const checkAuthTokens = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (accessToken && refreshToken && type === 'recovery') {
        console.log('Password reset tokens found in URL')
        try {
          // Set the session from hash parameters
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('Failed to set session from tokens:', sessionError)
            setError('Invalid or expired reset link. Please request a new password reset.')
          } else {
            console.log('Session established from reset tokens')
            // Clear the hash to prevent token exposure
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }
        } catch (error) {
          console.error('Error setting up session:', error)
          setError('Failed to establish session. Please request a new password reset link.')
        }
      }
    }

    checkAuthTokens()
  }, [searchParams])

  // Track mouse position for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      // First, try to get auth tokens from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (accessToken && refreshToken && type === 'recovery') {
        console.log('Setting session from URL hash parameters')
        // Set the session from hash parameters
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) {
          console.error('Session error:', sessionError)
          throw new Error('Invalid or expired reset link. Please request a new password reset.')
        }

        console.log('Session set successfully, user:', sessionData?.user?.email)
      } else {
        // Check if user is already authenticated or try to refresh session
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession()
        
        if (getSessionError || !session) {
          console.log('No valid session found, attempting to refresh...')
          
          // Try to refresh the session if we have a refresh token
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError || !refreshData.session) {
            throw new Error('Session expired. Please request a new password reset link.')
          }
          
          console.log('Session refreshed successfully')
        } else {
          console.log('Existing valid session found')
        }
      }

      // Verify we have a valid session before proceeding
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) {
        throw new Error('Unable to establish valid session. Please request a new password reset link.')
      }

      console.log('Updating password for user:', currentSession.user?.email)

      // Update the password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        throw updateError
      }

      console.log('Password updated successfully')
      setIsCompleted(true)
      
      // Sign out the user to ensure they login with new password
      await supabase.auth.signOut()
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?message=Password updated successfully')
      }, 3000)

    } catch (error: any) {
      console.error('Password reset error:', error)
      if (error.message?.includes('expired') || error.message?.includes('Invalid')) {
        setError('Your password reset link has expired. Please request a new one.')
      } else {
        setError(error.message || 'Failed to reset password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
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
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-teal-500 hover:text-teal-600 hover:bg-teal-50 flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              <span className="whitespace-nowrap">Back to Login</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left side - Visual content */}
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

            {/* Hero text */}
            <div className="z-10 mb-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Create a new{" "}
                <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
                  secure password
                </span>
              </h1>
            </div>

            {/* Floating Pip character */}
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

        {/* Right side - Reset Password form */}
        <div className="w-full md:flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Reset Password</h1>

            {!isCompleted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {email && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-600 text-sm">Resetting password for: <strong>{email}</strong></p>
                  </div>
                )}
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-lg pr-10"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 rounded-lg pr-10"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>At least 8 characters long</li>
                    <li>Must match confirmation password</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating Password...
                    </div>
                  ) : (
                    "Update Password"
                  )}
                </Button>

                <p className="mt-8 text-center text-gray-500 text-sm">
                  Remember your password?{" "}
                  <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                    Back to login
                  </Link>
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-6"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-teal-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4">Password Updated!</h2>
                <p className="text-slate-600 mb-6">
                  Your password has been successfully updated. You will be redirected to the login page shortly.
                </p>
                <Link href="/login" className="block">
                  <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
                    Continue to Login
                  </Button>
                </Link>
              </motion.div>
            )}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
