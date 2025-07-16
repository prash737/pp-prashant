import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mentor Onboarding - PathPiper",
  description: "Set up your mentor profile on PathPiper to connect with students and share your expertise",
}

export default function MentorOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="notebook-bg">{children}</div>
}
