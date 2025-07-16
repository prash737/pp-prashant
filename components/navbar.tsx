"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Profiles", href: "#profiles" },
    { name: "Mentorship", href: "#mentorship" },
    { name: "Institutions", href: "#institutions" },
    { name: "Discovery", href: "#discovery" },
    { name: "Safety", href: "#safety" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div
          className={`py-4 flex items-center justify-between transition-all duration-300 ${scrolled ? "py-3" : "py-8"}`}
        >
          <Link href="/" className="flex items-center space-x-2">
            <div className={`transition-all duration-300 ${scrolled ? "h-14" : "h-20"}`}>
              <Image
                src="/images/pathpiper-logo-full.png"
                width={scrolled ? 360 : 450}
                height={scrolled ? 60 : 75}
                alt="PathPiper Logo"
                className="h-full w-auto"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-slate-700 hover:text-teal-500 transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/login">
              <Button className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white rounded-full px-6 mr-2">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-6">
                Join Now
              </Button>
            </Link>
          </nav>

          {/* Mobile Navigation Toggle */}
          <button className="md:hidden text-slate-700" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white"
            >
              <div className="py-4 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-slate-700 hover:text-teal-500 transition-colors py-2 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link href="/login">
                  <Button
                    className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white rounded-full w-full mb-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    Join Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Navbar
