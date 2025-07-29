"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTA() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 rounded-3xl overflow-hidden shadow-xl">
          <div className="relative px-6 py-16 md:p-16">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-xl"></div>
              <div className="absolute top-1/2 right-0 w-40 h-40 rounded-full bg-white/10 blur-xl"></div>
              <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
            </div>
            
            {/* Ensure any buttons in this component have proper text contrast */}
            <style jsx>{`
              .cta-section button {
                color: white !important;
              }
              .cta-section button:hover {
                color: white !important;
                background-color: rgba(255, 255, 255, 0.2) !important;
              }
            `}</style>

            <motion.div
              className="relative max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Join the PathPiper Community Today</h2>
              <p className="text-xl text-white/90 mb-8">
                Connect with peers, find mentors, and discover your educational path in a safe, engaging environment
                designed just for students.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup">
                  <Button className="bg-white text-teal-600 hover:bg-yellow-100 hover:text-orange-600 rounded-full px-8 py-6 text-lg transition-colors duration-300">
                    Join Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="text-amber-700 border-white hover:bg-white/10 hover:text-white rounded-full px-8 py-6 text-lg transition-colors duration-300"
                >
                  Learn More
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">50,000+</div>
                  <div className="text-white/80">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">5,000+</div>
                  <div className="text-white/80">Mentors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-white/80">Institutions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">100+</div>
                  <div className="text-white/80">Countries</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
