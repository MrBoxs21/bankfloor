"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Eye, Heart, MessageCircle } from "lucide-react"
import Image from "next/image"

interface BlogData {
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  featuredImage: {
    url: string
    alt: string
  } | null
}

interface BlogPreviewProps {
  blogData: BlogData
}

export default function BlogPreview({ blogData }: BlogPreviewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <article className="space-y-6">
        {/* Header */}
        <header className="space-y-4">
          {blogData.category && (
            <Badge variant="secondary" className="text-sm">
              {blogData.category}
            </Badge>
          )}

          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {blogData.title || "Your Blog Title Will Appear Here"}
          </h1>

          {blogData.excerpt && <p className="text-lg text-muted-foreground leading-relaxed">{blogData.excerpt}</p>}

          {/* Author and Meta */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Author" />
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Author Name</p>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date().toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />5 min read
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />0
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />0
              </span>
              <span className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />0
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blogData.featuredImage?.url && (
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={blogData.featuredImage.url || "/placeholder.svg"}
              alt={blogData.featuredImage.alt}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600"
          dangerouslySetInnerHTML={{
            __html:
              blogData.content || '<p class="text-muted-foreground italic">Start writing your blog content...</p>',
          }}
        />

        {/* Tags */}
        {blogData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6 border-t">
            {blogData.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="cursor-pointer hover:bg-muted">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
