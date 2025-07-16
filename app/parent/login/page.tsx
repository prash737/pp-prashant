"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

function ParentLoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const response = await fetch('/api/parent/children', {
          credentials: 'include'
        })

        if (response.ok) {
          // Parent is already authenticated, redirect to dashboard
          router.push('/parent/dashboard')
          return
        }
      } catch (error) {
        // Not authenticated, continue with login page
      }
    }

    checkExistingAuth()

    const urlParams = new URLSearchParams(window.location.search)

    // Prefill email from URL parameter
    const prefilledEmail = urlParams.get('email')
    if (prefilledEmail) {
      setEmail(prefilledEmail)
    }

    if (urlParams.get('verified') === 'true') {
      setSuccessMessage('Email verified successfully! You can now log in.')
    }
    if (urlParams.get('error') === 'invalid_verification') {
      setError('Invalid or expired verification link.')
    }
    if (urlParams.get('error') === 'verification_failed') {
      setError('Email verification failed. Please try again.')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/parent/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Login successful!")
        setIsRedirecting(true)

        setTimeout(() => {
          router.push('/parent/dashboard')
        }, 1000)
      } else {
        if (data.needsVerification) {
          setError("Your email is not verified. We have sent an email for verification. Please click the link and verify to proceed with login.")
        } else {
          setError(data.error || 'Login failed')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Loading overlay when redirecting */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pathpiper-teal"></div>
              <p className="text-gray-700 font-medium">Setting up your dashboard...</p>
            </div>
          </div>
        </div>
      )}

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
          <Link href="/parent/signup">
            <Button variant="ghost" className="text-teal-500 hover:text-teal-600 hover:bg-teal-50">
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

            {/* Welcome back text */}
            <div className="z-10 mb-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Welcome back{" "}
                <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
                  Parents
                </span>
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                Monitor your child's educational journey
              </p>
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

        {/* Right side - Login form */}
        <div className="w-full md:flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md mx-auto">
            <Card className="w-full border-0 shadow-none md:border md:shadow-sm">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Parent Login</CardTitle>
                <CardDescription>
                  Access your parent dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {successMessage && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading || isRedirecting}
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading || isRedirecting}
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full py-6"
                    disabled={loading || isRedirecting}
                  >
                    {loading ? "Signing in..." : isRedirecting ? "Redirecting..." : "Sign in"}
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/parent/signup"
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

export default function ParentLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ParentLoginContent />
    </Suspense>
  )
}