import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password - PathPiper",
  description: "Reset your PathPiper password",
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
