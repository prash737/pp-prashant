
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parent Sign Up - PathPiper',
  description: 'Create your PathPiper parent account',
}

export default function ParentSignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
