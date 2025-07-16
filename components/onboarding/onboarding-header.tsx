"use client"

import Link from "next/link"
import Image from "next/image"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingHeaderProps {
  completionPercentage: number
}

export default function OnboardingHeader({ completionPercentage }: OnboardingHeaderProps) {
  return (
    <header className="w-full py-4 px-6 bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="h-10">
          <Image
            src="/images/pathpiper-logo-full.png"
            width={180}
            height={40}
            alt="PathPiper Logo"
            className="h-full w-auto"
          />
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <Home size={16} />
              <span className="hidden md:inline">Go to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}