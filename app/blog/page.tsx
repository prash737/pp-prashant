
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Clock, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function BlogPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // Choose navbar based on user role
  const renderNavbar = () => {
    if (loading) {
      return <Navbar /> // Show default navbar while loading
    }

    if (!user) {
      return <Navbar /> // Show default navbar for non-authenticated users
    }

    // Show role-specific navbar for authenticated users
    switch (user.role) {
      case 'institution':
        return <InstitutionNavbar />
      case 'student':
      case 'mentor':
      default:
        return <InternalNavbar />
    }
  }

  const blogPosts = [
    {
      id: 1,
      title: "Building Safe Digital Spaces for Young Learners",
      excerpt: "Explore the key principles and technologies we use to create a secure online environment where students can learn and connect safely.",
      author: "Dr. Sarah Johnson",
      date: "2025-01-15",
      readTime: "5 min read",
      category: "Safety",
      image: "/images/safety-topic.png",
      featured: true
    },
    {
      id: 2,
      title: "The Future of Educational Social Networking",
      excerpt: "How platforms like PathPiper are revolutionizing the way students connect with peers, mentors, and educational opportunities worldwide.",
      author: "Michael Chen",
      date: "2025-01-12",
      readTime: "7 min read",
      category: "Education",
      image: "/images/students-collaborating.png"
    },
    {
      id: 3,
      title: "Parental Involvement in Digital Learning",
      excerpt: "Tips and strategies for parents to support their children's online educational journey while maintaining appropriate oversight.",
      author: "Lisa Rodriguez",
      date: "2025-01-10",
      readTime: "4 min read",
      category: "Parenting",
      image: "/images/parent-controlled.png"
    },
    {
      id: 4,
      title: "Mentorship in the Digital Age",
      excerpt: "How technology is transforming traditional mentorship models and creating new opportunities for meaningful mentor-student relationships.",
      author: "Dr. Ahmed Hassan",
      date: "2025-01-08",
      readTime: "6 min read",
      category: "Mentorship",
      image: "/images/career-path.png"
    },
    {
      id: 5,
      title: "Creating Inclusive Learning Communities",
      excerpt: "Best practices for fostering diversity, equity, and inclusion in online educational environments.",
      author: "Jennifer Kim",
      date: "2025-01-05",
      readTime: "5 min read",
      category: "Community",
      image: "/images/diverse-students-studying.png"
    },
    {
      id: 6,
      title: "The Science Behind Personalized Learning",
      excerpt: "Understanding how AI and machine learning can help create customized educational experiences for every student.",
      author: "Dr. Robert Taylor",
      date: "2025-01-03",
      readTime: "8 min read",
      category: "Technology",
      image: "/images/personalised-growth.png"
    }
  ];

  const categories = ["All", "Safety", "Education", "Parenting", "Mentorship", "Community", "Technology"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {renderNavbar()}
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              PathPiper Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Insights, tips, and stories about educational technology, student safety, and building meaningful learning communities.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className={category === "All" ? "bg-teal-500 hover:bg-teal-600" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured Post */}
          {blogPosts.filter(post => post.featured).map((post) => (
            <Card key={post.id} className="mb-12 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                    Featured
                  </Badge>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="secondary" className="w-fit mb-3">
                    {post.category}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Regular Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(post => !post.featured).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg hover:text-teal-600 transition-colors cursor-pointer">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <User className="w-3 h-3 mr-1" />
                      <span className="mr-3">{post.author}</span>
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <Button size="sm" variant="ghost" className="text-teal-600 hover:text-teal-700">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Newsletter Signup */}
          <Card className="mt-16 p-8 bg-gradient-to-r from-teal-50 to-blue-50">
            <CardContent className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Subscribe to our newsletter to get the latest insights on educational technology, student safety, and building meaningful learning communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
