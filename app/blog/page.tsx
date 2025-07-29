
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight } from "lucide-react"
import Footer from "@/components/footer"
import InternalNavbar from "@/components/internal-navbar"

export default function BlogPage() {
  const featuredPost = {
    title: "The Future of Educational Social Networking",
    excerpt: "Exploring how platforms like PathPiper are revolutionizing the way students connect, learn, and grow in the digital age.",
    author: "PathPiper Team",
    date: "January 15, 2024",
    category: "Education Technology",
    image: "/images/students-collaborating.png",
    readTime: "5 min read"
  }

  const blogPosts = [
    {
      title: "Building Safe Digital Spaces for Students",
      excerpt: "Learn about our comprehensive approach to creating secure environments where students can thrive online.",
      author: "Safety Team",
      date: "January 10, 2024",
      category: "Safety",
      image: "/images/parent-controlled.png",
      readTime: "4 min read"
    },
    {
      title: "The Power of Peer-to-Peer Learning",
      excerpt: "Discover how students learn best when they can connect and collaborate with their peers around the world.",
      author: "Education Team",
      date: "January 5, 2024",
      category: "Learning",
      image: "/images/personalised-growth.png",
      readTime: "6 min read"
    },
    {
      title: "Student Success Stories: Achievements Unlocked",
      excerpt: "Inspiring stories from students who have found their path through connections made on PathPiper.",
      author: "Community Team",
      date: "December 28, 2023",
      category: "Success Stories",
      image: "/images/skill-tracking.png",
      readTime: "3 min read"
    },
    {
      title: "Navigating College Applications in the Digital Age",
      excerpt: "Tips and strategies for using digital portfolios and online connections to strengthen college applications.",
      author: "College Counselor",
      date: "December 20, 2023",
      category: "College Prep",
      image: "/images/career-path.png",
      readTime: "7 min read"
    },
    {
      title: "The Role of AI in Personalized Education",
      excerpt: "How artificial intelligence is helping create more personalized learning experiences for every student.",
      author: "Tech Team",
      date: "December 15, 2023",
      category: "Technology",
      image: "/images/interactive-quizzes.png",
      readTime: "5 min read"
    },
    {
      title: "Building Global Connections: Students Without Borders",
      excerpt: "Stories of international friendships and collaborations that are shaping the next generation of global citizens.",
      author: "Global Team",
      date: "December 10, 2023",
      category: "Global Learning",
      image: "/images/diverse-students-studying.png",
      readTime: "4 min read"
    }
  ]

  const categories = ["All", "Education Technology", "Safety", "Learning", "Success Stories", "College Prep", "Technology", "Global Learning"]

  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              PathPiper Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Insights, stories, and updates from the world of educational social networking. Discover how we're shaping the future of student connections.
            </p>
          </div>

          {/* Featured Post */}
          <div className="mb-16">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto">
                  <Image
                    src={featuredPost.image}
                    fill
                    alt={featuredPost.title}
                    className="object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredPost.date}
                    </span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <Button className="w-fit">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {blogPosts.map((post, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    fill
                    alt={post.title}
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <Badge className="w-fit mb-2">{post.category}</Badge>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                    <Button variant="ghost" size="sm">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="text-center bg-white rounded-xl p-8 border">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter to get the latest insights on educational technology and student success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button className="bg-teal-500 hover:bg-teal-600">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
