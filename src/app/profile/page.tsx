"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  MessageCircle,
  Edit,
  Trash2,
  PenTool,
  User,
  BookOpen,
  Settings,
  ArrowLeft,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

interface BlogPost {
  _id: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  featuredImage?: {
    url: string
    alt: string
  }
  publishedAt: string
  readingTime: number
  views: number
  likes: string[]
  comments: any[]
  status: string
}

interface UserProfile {
  _id: string
  name: string
  email: string
  avatar?: { url: string }
  bio?: string
  role: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [userBlogs, setUserBlogs] = useState<BlogPost[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("published")

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserProfile()
      fetchUserBlogs()
    }
  }, [status])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()

      if (response.ok) {
        setUserProfile(data.user)
      } else {
        toast.error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    }
  }

  const fetchUserBlogs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/blogs")
      const data = await response.json()

      if (response.ok) {
        setUserBlogs(data.blogs)
      } else {
        toast.error("Failed to fetch your blogs")
      }
    } catch (error) {
      console.error("Error fetching user blogs:", error)
      toast.error("Failed to load your blogs")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBlog = async (blogId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUserBlogs(userBlogs.filter((blog) => blog._id !== blogId))
        toast.success("Blog deleted successfully")
      } else {
        toast.error("Failed to delete blog")
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast.error("Failed to delete blog")
    }
  }

  const getAuthorInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getFilteredBlogs = () => {
    switch (activeTab) {
      case "published":
        return userBlogs.filter((blog) => blog.status === "published")
      case "draft":
        return userBlogs.filter((blog) => blog.status === "draft")
      case "all":
      default:
        return userBlogs
    }
  }

  const filteredBlogs = getFilteredBlogs()

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="px-4 py-6">
          <div className="animate-pulse space-y-6">
            {/* Profile Card Skeleton */}
            <div className="rounded-lg bg-white shadow-sm border border-slate-200 p-6">
              <div className="flex gap-6">
                <div className="h-20 w-20 rounded-full bg-slate-200"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 w-48 bg-slate-200 rounded"></div>
                  <div className="h-4 w-72 bg-slate-200 rounded"></div>
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Blog List Skeleton */}
            <div className="rounded-lg bg-white shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="h-6 w-32 bg-slate-200 rounded"></div>
              </div>
              <div className="p-6 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-48 bg-slate-200 rounded-lg"></div>
                    <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="px-4 py-16 text-center">
          <div className="max-w-sm mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <BookOpen className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-3 text-slate-400">Sign In Required</h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Please sign in to view your profile and manage your blogs. Join our community of professionals sharing their experiences.
            </p>
            <Link href="/auth/signin">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 max-w-screen-sm mx-auto">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/blogs">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <ArrowLeft className="h-4 w-4 text-blue-600" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Profile</h1>
                <p className="text-xs text-gray-600">Manage your content</p>
              </div>
            </div>
            <Link href="/create-blog">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm w-full sm:w-auto">
                <PenTool className="h-4 w-4 mr-1" />
                Write
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="px-1 sm:px-4 py-4 sm:py-6">
        {/* Profile Header */}
        <Card className="mb-6 border-blue-100 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-blue-50/50 w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-blue-100 shadow-md mb-2 sm:mb-0">
                <AvatarImage
                  src={userProfile?.avatar?.url || session?.user?.image || "/placeholder.svg?height=80&width=80&text=U"}
                  alt={userProfile?.name || session?.user?.name || "User"}
                />
                <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600">
                  {getAuthorInitials(userProfile?.name || session?.user?.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 break-words">{userProfile?.name || session?.user?.name}</h2>
                <p className="text-gray-600 text-sm mb-3 break-words">{userProfile?.email || session?.user?.email}</p>
                {userProfile?.bio && <p className="text-gray-600 text-sm mb-4 leading-relaxed break-words">{userProfile.bio}</p>}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center px-2 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                    <User className="h-4 w-4 mr-1.5 text-blue-600" />
                    {userProfile?.role || "User"}
                  </span>
                  <span className="flex items-center px-2 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                    <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />
                    {userProfile?.createdAt ? formatDate(userProfile.createdAt) : "Recently"}
                  </span>
                  <span className="flex items-center px-2 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                    <BookOpen className="h-4 w-4 mr-1.5 text-blue-600" />
                    {userBlogs.length} blogs
                  </span>
                </div>
              </div>
              {/* <Button variant="outline" size="sm" className="mt-2 sm:mt-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm w-full sm:w-auto">
                <Settings className="h-4 w-4" />
              </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* Blog Management */}
        <Card className="border-blue-100 shadow-md bg-white w-full">
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-800">
              <BookOpen className="h-5 w-5 text-blue-600" />
              My Blogs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-2 sm:px-6">
                <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-lg p-1">
                  <TabsTrigger value="published" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md w-full">
                    Published ({userBlogs.filter((blog) => blog.status === "published").length})
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md w-full">
                    Drafts ({userBlogs.filter((blog) => blog.status === "draft").length})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md w-full">
                    All ({userBlogs.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-4 sm:mt-6">
                {filteredBlogs.length > 0 ? (
                  <div className="space-y-4 px-2 sm:px-6 pb-4 sm:pb-6">
                    {filteredBlogs.map((blog) => (
                      <Card key={blog._id} className="border-blue-100 hover:shadow-lg transition-all duration-200 group bg-gradient-to-br from-white to-blue-50/30 w-full">
                        <CardContent className="p-0">
                          {/* Featured Image */}
                          <div className="relative aspect-video overflow-hidden rounded-t-lg">
                            <Image
                              src={
                                blog.featuredImage?.url ||
                                "/placeholder.svg?height=200&width=400&text=" + encodeURIComponent(blog.title) ||
                                "/placeholder.svg"
                              }
                              alt={blog.featuredImage?.alt || blog.title}
                              fill
                              className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute top-3 left-3">
                              <Badge
                                variant={blog.status === "published" ? "default" : "secondary"}
                                className={
                                  blog.status === "published"
                                    ? "bg-blue-600 text-white text-xs shadow-md"
                                    : "bg-blue-100 text-blue-700 text-xs shadow-md"
                                }
                              >
                                {blog.status}
                              </Badge>
                            </div>
                            <div className="absolute top-3 right-3">
                              <Badge variant="outline" className="bg-white/95 text-blue-600 text-xs shadow-md backdrop-blur-sm border-blue-200">
                                {blog.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 sm:p-6">
                            <h3 className="font-semibold mb-3 line-clamp-2 text-gray-800 text-base sm:text-lg group-hover:text-blue-700 transition-colors duration-200 break-words">{blog.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed break-words">{blog.excerpt}</p>

                            {/* Tags */}
                            {blog.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {blog.tags.slice(0, 2).map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                  >
                                    #{tag}
                                  </Badge>
                                ))}
                                {blog.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                                    +{blog.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Meta */}
                            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-4">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                                {formatDate(blog.publishedAt)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                                {blog.readingTime} min read
                              </span>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4 pb-4 border-b border-blue-100">
                              <span className="flex items-center px-2 py-1 rounded-md bg-blue-50">
                                <Eye className="h-4 w-4 mr-1.5 text-blue-600" />
                                {blog.views} views
                              </span>
                              <span className="flex items-center px-2 py-1 rounded-md bg-blue-50">
                                <Heart className="h-4 w-4 mr-1.5 text-blue-600" />
                                {blog.likes?.length || 0} likes
                              </span>
                              <span className="flex items-center px-2 py-1 rounded-md bg-blue-50">
                                <MessageCircle className="h-4 w-4 mr-1.5 text-blue-600" />
                                {blog.comments?.length || 0} comments
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <Link href={`/blog/view/${blog._id}`} className="flex-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs sm:text-sm border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                  View
                                </Button>
                              </Link>
                              <Link href={`/blog/edit/${blog._id}`}> 
                                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm border-slate-200 text-slate-600 hover:bg-slate-50">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto text-xs sm:text-sm text-red-600 border-red-100 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="mx-2 sm:mx-4">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-slate-400">Delete Blog</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-600">
                                      Are you sure you want to delete "{blog.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="text-slate-600 hover:text-slate-700">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteBlog(blog._id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16 px-2 sm:px-6">
                    <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 text-slate-400">
                      No {activeTab === "all" ? "" : activeTab} blogs yet
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-xs sm:max-w-sm mx-auto">
                      {activeTab === "published"
                        ? "Share your insights with the community by publishing your first blog."
                        : activeTab === "draft"
                          ? "Start writing and save your ideas as drafts."
                          : "Begin your journey by creating your first blog post."}
                    </p>
                    <Link href="/create-blog">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm w-full sm:w-auto">
                        <PenTool className="h-4 w-4 mr-2" />
                        Write Your First Blog
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
