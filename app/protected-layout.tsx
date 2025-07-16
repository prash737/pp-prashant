"use client"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Middleware has already handled authentication
  // If we reach here, the user is authenticated
  return <>{children}</>
}