
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parent Login - PathPiper',
  description: 'Login to your PathPiper parent account',
}

export default function ParentLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
