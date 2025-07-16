
import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password - PathPiper",
  description: "Create a new password for your PathPiper account",
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
