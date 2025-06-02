"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, User, Search, Filter, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

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

const categories = [
  "Success Stories",
  "Career Development",
  "Industry Insights",
  "Leadership",
  "Technology",
  "Regulations",
  "Personal Growth",
  "Work-Life Balance"
]

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("latest")

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs')
        const data = await response.json()
        setBlogs(data.blogs)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  const filteredBlogs = blogs
    .filter(blog => 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(blog => selectedCategory === "all" || blog.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-center mb-4">
            Explore{" "}
            <span className="bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent">
              Stories
            </span>
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Discover insights, experiences, and knowledge shared by banking professionals from around the world.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container py-8">
        {isLoading ? (
          // Loading skeleton
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-none bg-muted/50 animate-pulse">
                <div className="h-48 bg-muted" />
                <CardContent className="p-6">
                  <div className="h-6 w-3/4 bg-muted rounded mb-4" />
                  <div className="h-4 w-1/2 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
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
                        <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <p 
                      className="text-muted-foreground line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No stories found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Create Story CTA */}
      <div className="container py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 to-pink-300 px-6 py-12">
          <div className="relative">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Have a Story to Share?
              </h2>
              <p className="mt-4 text-lg text-pink-50">
                Share your experiences and insights with the banking community.
              </p>
              <div className="mt-8">
                <Link href="/create-blog">
                  <Button size="lg" className="bg-white text-pink-500 hover:bg-pink-50">
                    Write Your Story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
