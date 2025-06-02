"use client"

import { Button } from "@/components/ui/button"
import { Card,CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PenTool, Users, Shield, Heart, MessageCircle, TrendingUp, ArrowRight, Clock, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { useEffect, useState } from "react"
function formatDistanceToNow(date: Date | string) {
  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();
  const diffInDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return rtf.format(diffInDays, 'day');
}

interface Blog {
  _id: string
  title: string
  content: string
  author: {
    name: string
    image: string
  }
  createdAt: string
  category: string
  image: string
}

export default function HomePage() {
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const response = await fetch('/api/blogs?limit=6')
        const data = await response.json()
        setLatestBlogs(data.blogs)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Check if user is logged in (can be improved with useSession)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        setIsLoggedIn(!!data.user)
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }

    fetchLatestBlogs()
    checkAuth()
  }, [])

  const features = [
    {
      icon: <PenTool className="h-6 w-6" />,
      title: "Share Your Experience",
      description: "Write about your banking career journey, challenges, and success stories.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Connect with Peers",
      description: "Build meaningful connections with fellow banking professionals.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Professional Discussions",
      description: "Engage in conversations about banking trends, regulations, and best practices.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ]

  const stats = [
    { value: "10K+", label: "Active Members" },
    { value: "5K+", label: "Blog Posts" },
    { value: "50K+", label: "Monthly Views" },
    { value: "24/7", label: "Support" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50 to-background dark:from-pink-950/20 dark:to-background" />
        <div className="container relative">
          <div className="mx-auto max-w-[64rem] text-center">
            <Badge className="mb-4 bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300">
              Bank Professional's United
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your Voice in the{" "}
              <span className="bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent">
                Banking World
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Connect with fellow banking professionals, share experiences, and grow together in a secure and supportive environment.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blogs" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-pink-400 hover:bg-pink-500 text-white">
                  Explore Stories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/create-blog" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-900/20">
                  Share Your Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-pink-400 dark:text-pink-300">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blogs Section */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Latest{" "}
            <span className="bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent">
              Stories
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover the most recent insights from our community
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-none bg-muted/50 animate-pulse">
                <div className="h-48 bg-muted" />
                <CardContent className="p-6">
                  <div className="h-6 w-3/4 bg-muted rounded mb-4" />
                  <div className="h-4 w-1/2 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          ) : (latestBlogs.length > 0 ? (
            latestBlogs.map((blog) => (
              <Link href={`/blogs/${blog._id}`} key={blog._id}>
                <Card className="group overflow-hidden border-none bg-muted/50 hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48">
                    <Image
                      src={blog.image || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-pink-400/90 text-white">
                      {blog.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">{blog.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{blog.author.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(blog.createdAt))}</span>
                      </div>
                    </div>
                    <p
                       className="text-muted-foreground line-clamp-3"
                       dangerouslySetInnerHTML={{ __html: blog.content }}
                     />
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 lg:col-span-3">
              <h3 className="text-xl font-semibold mb-2">No stories found</h3>
              <p className="text-muted-foreground mb-4">
                There are no recent stories to display yet.
              </p>
              <Link href="/create-blog">
                <Button variant="outline">
                  Be the first to share your story!
                </Button>
              </Link>
            </div>
          )
        )}
        </div>
        <div className="text-center mt-12">
          <Link href="/blogs">
            <Button variant="outline" size="lg" className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-900/20">
              View All Stories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 ">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Explore{" "}
            <span className="bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover content tailored for banking professionals
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="group overflow-hidden border-none bg-muted/50">
              <div className="relative h-48">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <CardContent className="p-6">
                <div className="mb-4 rounded-lg bg-pink-100 p-2 w-fit text-pink-600 dark:bg-pink-900/30 dark:text-pink-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section - Only shown for non-logged in users */}
      {!isLoggedIn && (
        <section className="container py-20">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-400 to-pink-200 px-6 py-16 sm:px-12 sm:py-24">
            <div className="relative">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                  Join Our Professional Community
                </h2>
                <p className="mt-4 text-lg text-pink-50">
                  Connect with banking professionals, share your experiences, and grow your career.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-white text-pink-500 hover:bg-pink-50">
                      Create Account
                    </Button>
                  </Link>
                  <Link href="/blogs" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full text-pink-500 border-white/20 hover:bg-white/10">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
