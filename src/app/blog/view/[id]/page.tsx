"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  Tag,
  Edit,
  FileText,
  ImageIcon,
  Trash2,
  File,
  MoreVertical,
  Users,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import CommentSystem from "@/components/blog/comment-system"
import { useRouter } from "next/navigation"

interface BlogPost {
  _id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  author: {
    _id: string
    name: string
    email?: string
    avatar?: { url: string }
    bio?: string
  }
  featuredImage?: {
    url: string
    alt: string
  }
  publishedAt: string
  readingTime: number
  views: number
  likes: string[]
  commentsEnabled: boolean
  status: string
  slug: string
  mediaFiles?: Array<{
    url: string
    name: string
    type: string
    size: number
  }>
}

export default function BlogViewPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    fetchBlog()
  }, [params.id])

  useEffect(() => {
    if (blog && session?.user?.email) {
      const isAuthor = blog.author.email === session.user.email
      setCanDelete(isAuthor)
    }
  }, [blog, session])

  const fetchBlog = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/blogs/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch story`)
      }

      if (!data.blog) {
        throw new Error("No story data received")
      }

      // Ensure author information is properly formatted
      if (!data.blog.author || typeof data.blog.author === "string") {
        data.blog.author = {
          _id: data.blog.author || "unknown",
          name: "Anonymous Author",
          avatar: { url: "/placeholder.svg?height=40&width=40&text=AA" },
          bio: "Content creator and writer",
        }
      }

      setBlog(data.blog)
    } catch (error) {
      console.error("Failed to fetch story:", error)
      setError(error instanceof Error ? error.message : "Failed to load story")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    setIsLiked(!isLiked)
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites")
  }

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: blog?.title,
            text: blog?.excerpt,
            url: window.location.href,
          })
        } catch (error) {
          console.log("Error sharing:", error)
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href)
          toast.success("Link copied to clipboard!")
        } catch (error) {
          toast.error("Failed to copy link")
        }
      }
    }
  }

  const handleDeleteBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Story deleted successfully")
        router.push("/profile")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete story")
      }
    } catch (error) {
      console.error("Error deleting story:", error)
      toast.error("Failed to delete story")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (!type) return <File className="h-4 w-4 text-gray-500" />
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-gray-700" />
    if (type.startsWith("video/")) return <FileText className="h-4 w-4 text-gray-700" />
    if (type.startsWith("audio/")) return <FileText className="h-4 w-4 text-gray-700" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const getAuthorInitials = (name: string) => {
    if (!name) return "BP"
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 py-12 text-center">
          <div className="max-w-sm mx-auto">
            <h1 className="text-xl font-semibold mb-3 text-gray-900">Story not found</h1>
            <p className="text-gray-600 mb-6 text-sm">{error || "The story you're looking for doesn't exist."}</p>
            <div className="space-y-3">
              <Link href="/blogs">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Stories
                </Button>
              </Link>
              <Link href="/create-blog">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Share Your Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/blogs">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              {blog.status === "published" && (
                <Badge variant="default" className="bg-gray-900 text-white text-xs">
                  Published
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleLike} variant="outline" size="sm" className="border-gray-300 text-gray-700">
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                <span className="ml-1 text-xs">{blog.likes?.length || 0}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Story
                  </DropdownMenuItem>
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Story</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this story? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteBlog} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-6">
            <Badge variant="outline" className="mb-3 border-gray-300 text-gray-700 text-xs">
              {blog.category}
            </Badge>

            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3 text-gray-900">{blog.title}</h1>

            {blog.excerpt && <p className="text-lg text-gray-600 leading-relaxed mb-4">{blog.excerpt}</p>}

            {/* Author and Meta */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={blog.author?.avatar?.url || "/placeholder.svg?height=40&width=40&text=BP"}
                    alt={blog.author?.name || "Banking Professional"}
                  />
                  <AvatarFallback>{getAuthorInitials(blog.author?.name || "Banking Professional")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{blog.author?.name || "Banking Professional"}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(blog.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {blog.readingTime} min
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {blog.views}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                <Image
                  src={blog.featuredImage.url || "/placeholder.svg?height=400&width=800&text=Banking+Story"}
                  alt={blog.featuredImage.alt || "Banking story image"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </header>

          {/* Media Files Section */}
          {blog.mediaFiles && blog.mediaFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
                <FileText className="h-5 w-5" />
                Attached Files
              </h3>
              <div className="space-y-2">
                {blog.mediaFiles.map((file, index) => (
                  <Card key={index} className="p-3 border-gray-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type && file.type.split("/")[1]?.toUpperCase()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                        className="border-gray-300 text-gray-700"
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} className="blog-content text-gray-800" />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Tag className="h-4 w-4 text-gray-500 mr-1" />
              {blog.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="border-gray-300 text-gray-600 text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="mb-6 bg-gray-200" />

          {/* Author Bio */}
          <Card className="mb-6 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={blog.author?.avatar?.url || "/placeholder.svg?height=48&width=48&text=BP"}
                    alt={blog.author?.name || "Banking Professional"}
                  />
                  <AvatarFallback>{getAuthorInitials(blog.author?.name || "Banking Professional")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">About {blog.author?.name || "the Author"}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Banking Professional</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {blog.author?.bio ||
                      "Experienced banking professional sharing insights and experiences to help fellow colleagues navigate the challenges of the banking industry."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentSystem blogId={blog._id} commentsEnabled={blog.commentsEnabled} />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-8">
            <Link href="/blogs">
              <Button variant="outline" className="w-full border-gray-300 text-gray-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Stories
              </Button>
            </Link>
            <Link href="/create-blog">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                <Edit className="h-4 w-4 mr-2" />
                Share Your Story
              </Button>
            </Link>
          </div>
        </article>
      </div>

      {/* Custom CSS for blog content */}
      <style jsx global>{`
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .blog-content video {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .blog-content audio {
          width: 100%;
          margin: 1rem 0;
        }

        .blog-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .blog-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
        }

        .blog-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .blog-content pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }

        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .blog-content th,
        .blog-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }

        .blog-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
