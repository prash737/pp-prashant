
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, ArrowRight } from "lucide-react"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"

export default function BlogPage() {
  const featuredPost = {
    title: "The Future of Student Networking: Building Safe Digital Communities",
    excerpt: "Explore how PathPiper is revolutionizing the way students connect, learn, and grow together in a safe, supportive online environment.",
    author: "Sarah Chen",
    date: "November 15, 2024",
    readTime: "5 min read",
    category: "Community",
    image: "/images/students-collaborating.png"
  }

  const blogPosts = [
    {
      title: "How AI is Enhancing Student Safety Online",
      excerpt: "Learn about our advanced AI moderation systems that keep students safe while preserving authentic conversations.",
      author: "James Kim",
      date: "November 12, 2024",
      readTime: "4 min read",
      category: "Safety",
      image: "/images/ai-ethics.png"
    },
    {
      title: "Building Global Connections: Student Stories from Around the World",
      excerpt: "Discover inspiring stories of students who have formed meaningful connections across continents through PathPiper.",
      author: "Dr. Emily Watson",
      date: "November 8, 2024",
      readTime: "6 min read",
      category: "Stories",
      image: "/images/diverse-students-studying.png"
    },
    {
      title: "Parent's Guide to Student Online Safety",
      excerpt: "Essential tips and tools for parents to ensure their children have safe and positive online experiences.",
      author: "Michael Rodriguez",
      date: "November 5, 2024",
      readTime: "7 min read",
      category: "Parents",
      image: "/images/parent-controlled.png"
    },
    {
      title: "The Science of Personalized Learning Paths",
      excerpt: "How PathPiper uses data science to create personalized educational experiences for each student.",
      author: "Dr. Lisa Park",
      date: "November 1, 2024",
      readTime: "5 min read",
      category: "Education",
      image: "/images/personalised-growth.png"
    },
    {
      title: "Creating Inclusive Spaces for All Students",
      excerpt: "Our commitment to building a platform where every student feels welcome, valued, and supported.",
      author: "Alex Johnson",
      date: "October 28, 2024",
      readTime: "4 min read",
      category: "Inclusion",
      image: "/images/diverse-classroom-teacher.png"
    },
    {
      title: "Digital Citizenship: Teaching Responsible Online Behavior",
      excerpt: "Why digital citizenship education is crucial for the next generation of online learners.",
      author: "Maria Garcia",
      date: "October 25, 2024",
      readTime: "6 min read",
      category: "Education",
      image: "/images/diverse-professor-lecturing.png"
    }
  ]

  const categories = [
    "All Posts",
    "Safety",
    "Education",
    "Community",
    "Parents",
    "Stories",
    "Inclusion"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              PathPiper Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Insights, stories, and updates from the world of student networking and educational technology.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {categories.map((category, index) => (
              <span 
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  index === 0 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </span>
            ))}
          </div>

          {/* Featured Post */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Article</h2>
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                      {featuredPost.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredPost.date}
                    </span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700 font-medium">{featuredPost.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Posts */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-video">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 text-sm">{post.author}</span>
                      </div>
                      <span className="text-xs text-gray-500">{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-16 text-center">
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Stay Updated
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Subscribe to our newsletter to get the latest insights on student networking, 
                  educational technology, and online safety delivered to your inbox.
                </p>
                <p className="text-gray-600">
                  Subscribe at <a href="mailto:newsletter@pathpiper.com" className="text-teal-600 hover:underline">newsletter@pathpiper.com</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
