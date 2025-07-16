"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle } from "lucide-react"

export default function ParentSignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/parent/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Account created successfully!")
        setIsComplete(true)
      } else {
        // Handle specific error messages from the server
        const errorMessage = data.error || 'Registration failed'
        if (errorMessage.includes('already registered')) {
          toast.error(errorMessage, {
            duration: 5000,
            style: {
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #f59e0b'
            }
          })
        } else {
          toast.error(errorMessage)
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Registration error:', error)
      // Only show generic error if we haven't already shown a specific one
      if (!error.message.includes('already registered')) {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (isComplete) {
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
        </header>

        <div className="flex flex-1 items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-10"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-teal-500" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Registration Complete!</h2>
            <p className="text-slate-600 mb-4 max-w-md mx-auto">
              Your parent account has been created successfully.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 text-xl">📧</div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Email Verification Required</h3>
                  <p className="text-blue-700 text-sm">
                    We've sent a verification email to your inbox. Please verify your email address before logging in to access your dashboard.
                  </p>
                </div>
              </div>
            </div>
            <Link href="/parent/login">
              <Button className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-8 py-6">
                Continue to Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    )
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
          <Link href="/parent/login">
            <Button variant="ghost" className="text-teal-500 hover:text-teal-600 hover:bg-teal-50">
              Log In
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
                Join as a{" "}
                <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
                  Parent
                </span>
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                Support your child's educational journey
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

        {/* Right side - Signup form */}
        <div className="w-full md:flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md mx-auto">
            <Card className="w-full border-0 shadow-none md:border md:shadow-sm">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Create Parent Account</CardTitle>
                <CardDescription>
                  Join PathPiper to support your child's education
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="rounded-lg border-slate-300"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full py-6"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    href="/parent/login" 
                    className="text-pathpiper-teal hover:underline font-medium"
                  >
                    Log in
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