"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Heart, MessageCircle, Share2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

interface BlogPost {
  id: string
  title: string
  content: string
  author: {
    name: string
    bio?: string
    avatar?: {
      url: string
    }
  }
  createdAt: string
  readTime: string
  tags: string[]
  likes: number
  comments: number
  featuredImage?: {
    url: string
    alt: string
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [blog, setBlog] = useState<BlogPost | null>(null)

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/blogs">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Loading...</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="container py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/blogs">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Banking Story</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Blog Content */}
      <article className="container py-8">
        <div className="mx-auto max-w-[800px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{blog.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{blog.likes} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{blog.comments} comments</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
              <Image
                src={blog.featuredImage.url}
                alt={blog.featuredImage.alt}
                fill
                className="blog-image"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {blog.content}
          </div>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="badge-classic">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Author Card */}
          <Card className="mt-8 card-hover">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={blog.author.avatar?.url} alt={blog.author.name} />
                  <AvatarFallback>{blog.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold mb-2">About {blog.author.name}</h3>
                  <p className="text-muted-foreground">
                    {blog.author.bio || "Passionate banking professional sharing insights and experiences."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" size="sm" className="gap-2 button-classic">
              <Heart className="h-4 w-4" />
              Like
            </Button>
            <Button variant="outline" size="sm" className="gap-2 button-classic">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Related Posts */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Stories</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2].map((index) => (
                <Card key={index} className="card-hover">
                  <div className="relative aspect-video">
                    <Image
                      src={`/images/blog/related-${index}.jpg`}
                      alt={`Related post ${index}`}
                      fill
                      className="feature-image"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Related Banking Story {index}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Discover insights and experiences from other banking professionals...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
