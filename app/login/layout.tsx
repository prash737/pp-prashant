import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - PathPiper",
  description: "Log in to PathPiper - A global, safe, education-focused social networking platform",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
