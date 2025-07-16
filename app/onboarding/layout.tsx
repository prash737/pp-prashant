import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Complete Your Profile - PathPiper",
  description: "Set up your profile on PathPiper to connect with mentors and educational opportunities",
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="notebook-bg">{children}</div>
}
