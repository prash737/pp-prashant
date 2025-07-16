import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - PathPiper",
  description: "Join PathPiper - A global, safe, education-focused social networking platform",
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
