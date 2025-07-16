"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function PipIntro() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setMousePosition({ x, y })
    }

    const section = sectionRef.current
    if (section) {
      section.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      if (section) {
        section.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [])

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden bg-slate-900">
      {/* Interactive gradient background */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(45, 212, 191, 0.5) 0%, 
            rgba(147, 51, 234, 0.3) 25%, 
            rgba(249, 115, 22, 0.2) 50%, 
            rgba(59, 130, 246, 0.1) 75%, 
            rgba(15, 23, 42, 0) 100%)`,
        }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-teal-500/10 blur-3xl"
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        style={{
          top: "10%",
          left: "5%",
        }}
      />

      <motion.div
        className="absolute w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
        animate={{
          x: [0, -100, -50, 0],
          y: [0, 100, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        style={{
          top: "30%",
          right: "10%",
        }}
      />

      <motion.div
        className="absolute w-72 h-72 rounded-full bg-orange-500/10 blur-3xl"
        animate={{
          x: [0, 80, 40, 0],
          y: [0, -60, -120, 0],
        }}
        transition={{
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        style={{
          bottom: "10%",
          left: "20%",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <motion.div
                className="w-full h-full flex justify-center"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
              >
                <Image
                  src="/images/pip-chat-bubble.png"
                  width={500}
                  height={400}
                  alt="Pip with chat bubble"
                  className="w-auto h-auto object-contain"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Meet Pip!</h2>
              {/* Removed the NEW pill/token */}
            </div>
            <p className="text-xl text-teal-300 mb-6">Your learning companion</p>

            <p className="text-slate-300 mb-8">
              Pip is designed to make your educational experience more engaging and personalized. From suggesting
              mentors that match your interests to helping you discover new skills and opportunities, Pip is your
              friendly companion throughout your PathPiper journey.
            </p>

            <div className="flex space-x-4">
              <Button className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full">
                Start Tour with Pip
              </Button>
              <Button
                variant="outline"
                className="border-teal-400/30 text-black hover:bg-teal-400/10 hover:text-white rounded-full"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
