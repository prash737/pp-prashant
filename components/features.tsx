"use client"

import { motion } from "framer-motion"
import { UserCircle, Users, Lightbulb, Award, Shield } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: <UserCircle className="h-10 w-10 text-pathpiper-teal" />,
      title: "Student-Centric Profiles",
      description:
        "Tailored for academic and career identity. Showcase achievements and participate in interest-based communities.",
    },
    {
      icon: <Users className="h-10 w-10 text-pathpiper-orange" />,
      title: "Mentorship Engine",
      description: "AI or interest-driven mentor matching. Guided interactions, Q&As, goal-setting, and inspiration.",
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-pathpiper-yellow" />,
      title: "Institutional Engagement",
      description: "Schools and colleges create official pages. Conduct outreach, host events, track student interest.",
    },
    {
      icon: <Award className="h-10 w-10 text-pathpiper-purple" />,
      title: "Gamified Career Discovery",
      description: "Interactive quizzes, activities, and career paths. Personalized growth plans and skill tracking.",
    },
    {
      icon: <Shield className="h-10 w-10 text-pathpiper-blue" />,
      title: "Robust Compliance & Safety",
      description: "COPPA/GDPR-K compliant. Parent dashboards, moderation, privacy-first architecture.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Fundamental Building Blocks</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            PathPiper is built on five core pillars designed to create a safe, engaging, and educational social
            experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-slate-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
