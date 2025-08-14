import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster" // Assuming Toaster is imported from here based on context
import ClientAuthGuard from '@/components/client-auth-guard' // Added import

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "PathPiper - Education-Focused Social Platform",
  description:
    "A global, safe, education-focused social networking platform uniting students, mentors, and institutions.",
    generator: 'v0.dev',
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`font-sans ${nunito.variable} notebook-bg`} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ClientAuthGuard> {/* Wrapped children with ClientAuthGuard */}
            {children}
          </ClientAuthGuard>
          <Toaster position="top-center" closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}