"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Save,
  Eye,
  Send,
  Clock,
  Tag,
  Globe,
  Lock,
  Users,
  ArrowLeft,
  X,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle,
  FileText,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Dynamic imports for components that use browser APIs
const RichTextEditor = dynamic(() => import("@/components/blog/rich-text-editor"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p>Loading editor...</p>
    </div>
  ),
})

const MediaUploader = dynamic(() => import("@/components/blog/media-uploader"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-4 text-center">
      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
      <p className="text-sm">Loading media uploader...</p>
    </div>
  ),
})

const BlogPreview = dynamic(() => import("@/components/blog/blog-preview"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p>Loading preview...</p>
    </div>
  ),
})

const GroqAIAssistant = dynamic(() => import("@/components/blog/groq-ai-assistant"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-4 text-center">
      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
      <p className="text-sm">Loading AI assistant...</p>
    </div>
  ),
})

interface MediaFile {
  url: string
  publicId: string
  alt: string
  name: string
  type: string
  size: number
  format?: string
}

interface BlogData {
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  mediaFiles: MediaFile[]
  status: "draft" | "published"
  visibility: "public" | "private" | "friends"
  commentsEnabled: boolean
  language: string
  author: string
  featuredImage: {
    url: string
    alt: string
  } | null
}

// Banking-specific categories
const bankingCategories = [
  "Customer Service",
  "Stress Management",
  "Career Growth",
  "Workplace Culture",
  "Compliance",
  "Leadership",
  "Work-Life Balance",
  "Team Dynamics",
  "Professional Development",
  "Banking Operations",
  "Client Relations",
  "Performance Pressure",
]

export default function CreateBlogPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [newTag, setNewTag] = useState("")
  const [showAI, setShowAI] = useState(false)
  const [savedBlogId, setSavedBlogId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  const [blogData, setBlogData] = useState<BlogData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    mediaFiles: [],
    status: "draft",
    visibility: "public",
    commentsEnabled: true,
    language: "en",
    author: session?.user?.email || "", // Use current user's email as ID
    featuredImage: null
  })

  // Update author when session changes
  useEffect(() => {
    if (session?.user?.email) {
      setBlogData(prev => ({
        ...prev,
        author: session.user.email || "" // Ensure we always have a string
      }))
    }
  }, [session])

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)

    // Load saved draft only on client side
    const loadDraft = () => {
      try {
        const savedDraft = localStorage.getItem("blog-draft")
        const savedId = localStorage.getItem("blog-draft-id")

        if (savedDraft) {
          const draftData = JSON.parse(savedDraft)
          setBlogData(draftData)
          if (savedId) {
            setSavedBlogId(savedId)
          }
          toast.info("Draft loaded from previous session")
        }
      } catch (error) {
        console.error("Error loading draft:", error)
      }
    }

    loadDraft()
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (blogData.title) {
      const slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setBlogData((prev) => ({ ...prev, slug }))
    }
  }, [blogData.title])

  // Calculate word count and reading time
  useEffect(() => {
    const text = blogData.content.replace(/<[^>]*>/g, "")
    const words = text.split(/\s+/).filter((word) => word.length > 0)
    const count = words.length
    const time = Math.ceil(count / 200)
    setWordCount(count)
    setReadingTime(time)
  }, [blogData.content])

  // Auto-save functionality
  useEffect(() => {
    if (!isClient) return

    const autoSaveInterval = setInterval(() => {
      if (blogData.title || blogData.content) {
        handleAutoSave()
      }
    }, 60000) // Auto-save every minute

    return () => clearInterval(autoSaveInterval)
  }, [blogData, isClient])

  const handleAutoSave = async () => {
    if (!isClient) return

    try {
      const draftData = {
        ...blogData,
        status: "draft",
        autoSavedAt: new Date().toISOString(),
      }
      localStorage.setItem("blog-draft", JSON.stringify(draftData))
    } catch (error) {
      console.error("Auto-save error:", error)
    }
  }

  const handleSaveDraft = async () => {
    if (!blogData.title.trim()) {
      toast.error("Please enter a title before saving")
      return
    }

    setIsSaving(true)
    try {
      const draftData = {
        ...blogData,
        status: "draft",
      }

      console.log("Saving draft with media files:", {
        mediaFilesCount: draftData.mediaFiles.length,
        mediaFiles: draftData.mediaFiles,
      })

      let response
      if (savedBlogId) {
        // Update existing draft
        response = await fetch(`/api/blogs/${savedBlogId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftData),
        })
      } else {
        // Create new draft
        response = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftData),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save draft")
      }

      if (!savedBlogId) {
        setSavedBlogId(data.blog._id)
        if (isClient) {
          localStorage.setItem("blog-draft-id", data.blog._id)
        }
      }

      if (isClient) {
        localStorage.setItem("blog-draft", JSON.stringify(draftData))
      }

      toast.success("Draft saved successfully!")
    } catch (error) {
      console.error("Save error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!session?.user?.email) {
      toast.error("Please sign in to publish your story")
      return
    }

    if (!blogData.title.trim()) {
      toast.error("Please enter a title before publishing")
      return
    }

    if (!blogData.content.trim()) {
      toast.error("Please write your story before publishing")
      return
    }

    if (!blogData.category) {
      toast.error("Please select a topic before publishing")
      return
    }

    setIsPublishing(true)
    try {
      const publishData = {
        ...blogData,
        status: "published",
        publishedAt: new Date().toISOString(),
        author: session.user.email || "" // Ensure we always have a string
      }

      let response
      if (savedBlogId) {
        // Update existing blog
        response = await fetch(`/api/blogs/${savedBlogId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(publishData),
        })
      } else {
        // Create new blog
        response = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(publishData),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish story")
      }

      // Clear draft data
      if (isClient) {
        localStorage.removeItem("blog-draft")
        localStorage.removeItem("blog-draft-id")
      }

      toast.success("Story published successfully!")
      router.push(`/blog/view/${data.blog._id}`)
    } catch (error) {
      console.error("Publish error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to publish story")
    } finally {
      setIsPublishing(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !blogData.tags.includes(newTag.trim())) {
      setBlogData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setBlogData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleMediaUpload = (file: MediaFile) => {
    console.log("Media file uploaded:", file)
    setBlogData((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, file],
    }))
    toast.success(`File "${file.name}" uploaded successfully!`)
  }

  const removeMediaFile = (index: number) => {
    setBlogData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }))
    toast.success("File removed")
  }

  const clearDraft = () => {
    if (isClient) {
      localStorage.removeItem("blog-draft")
      localStorage.removeItem("blog-draft-id")
    }
    setBlogData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      category: "",
      tags: [],
      mediaFiles: [],
      status: "draft",
      visibility: "public",
      commentsEnabled: true,
      language: "en",
      author: session?.user?.email || "",
      featuredImage: null
    })
    setSavedBlogId(null)
    toast.success("Draft cleared")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50/50 dark:from-slate-950 dark:via-zinc-900 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-zinc-200 dark:border-zinc-800">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/blogs">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 dark:hover:bg-primary/20">
                <ArrowLeft className="h-4 w-4 text-primary" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Share Your Story</h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                {wordCount} words • {readingTime} min read
              </span>
              {savedBlogId && (
                <Badge variant="outline" className="text-xs border-primary/20 bg-primary/10 text-primary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
              {blogData.mediaFiles.length > 0 && (
                <Badge variant="outline" className="text-xs border-primary/20 bg-primary/10 text-primary">
                  <FileText className="h-3 w-3 mr-1" />
                  {blogData.mediaFiles.length} files
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <Card className="border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-0">
                {!isPreviewMode ? (
                  <div className="space-y-0">
                    {/* Title Section */}
                    <div className="p-4 pb-3">
                      <Input
                        placeholder="Share your banking experience..."
                        value={blogData.title}
                        onChange={(e) => setBlogData((prev) => ({ ...prev, title: e.target.value }))}
                        className="text-2xl font-bold border-0 px-0 focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground bg-transparent"
                      />
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                        <Globe className="h-3 w-3 text-primary" />
                        <span>URL: /story/{blogData.slug || "your-story-title"}</span>
                      </div>
                    </div>

                    {/* Media Upload Section */}
                    {isClient && (
                      <div className="px-4 pb-3">
                        <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Attachments</Label>
                        <MediaUploader
                          onUpload={handleMediaUpload}
                          currentFiles={blogData.mediaFiles}
                          multiple={true}
                        />

                        {/* Display uploaded files */}
                        {blogData.mediaFiles.length > 0 && (
                          <div className="mt-3">
                            <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                              Uploaded Files ({blogData.mediaFiles.length})
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {blogData.mediaFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors duration-200"
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm truncate text-gray-700 dark:text-gray-300">{file.name}</span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400">({Math.round(file.size / 1024)}KB)</span>
                                  </div>
                                  <Button
                                    onClick={() => removeMediaFile(index)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Excerpt */}
                    <div className="px-4 pb-3">
                      <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Brief Summary (Optional)</Label>
                      <Textarea
                        placeholder="Briefly describe your experience or what others can expect to learn..."
                        value={blogData.excerpt}
                        onChange={(e) => setBlogData((prev) => ({ ...prev, excerpt: e.target.value }))}
                        className="min-h-[60px] border-blue-100 dark:border-blue-800 focus:border-blue-200 dark:focus:border-blue-700 focus:ring-blue-200 dark:focus:ring-blue-700 bg-blue-50/30 dark:bg-blue-900/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100"
                        maxLength={300}
                      />
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{blogData.excerpt.length}/300</div>
                    </div>

                    <Separator className="bg-blue-100 dark:bg-gray-800" />

                    {/* Rich Text Editor */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Story</Label>
                        {isClient && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAI(!showAI)}
                            className="flex items-center gap-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                          >
                            <Sparkles className="h-4 w-4" />
                            AI Help
                          </Button>
                        )}
                      </div>

                      {showAI && isClient && (
                        <div className="mb-4">
                          <GroqAIAssistant
                            onContentGenerated={(content) =>
                              setBlogData((prev) => ({
                                ...prev,
                                content: content,
                              }))
                            }
                            onTagsGenerated={(tags) =>
                              setBlogData((prev) => ({
                                ...prev,
                                tags: [...new Set([...prev.tags, ...tags])],
                              }))
                            }
                            onTitleGenerated={(title) =>
                              setBlogData((prev) => ({
                                ...prev,
                                title: title,
                              }))
                            }
                            currentContent={blogData.content}
                            currentTitle={blogData.title}
                          />
                        </div>
                      )}

                      {isClient && (
                        <RichTextEditor
                          content={blogData.content}
                          onChange={(content) => setBlogData((prev) => ({ ...prev, content }))}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4">{isClient && <BlogPreview blogData={blogData} />}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish Card */}
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-primary" />
                  Share Your Story
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing || !blogData.title.trim() || !blogData.content.trim() || !blogData.category}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Share Story
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Your story will help fellow banking professionals</p>
                </div>

                {/* Requirements checklist */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {blogData.title.trim() ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={blogData.title.trim() ? "text-foreground" : "text-muted-foreground"}>Title added</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {blogData.content.trim() ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={blogData.content.trim() ? "text-foreground" : "text-muted-foreground"}>Story written</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {blogData.category ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={blogData.category ? "text-foreground" : "text-muted-foreground"}>Topic selected</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category & Tags Card */}
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-gray-900 dark:text-gray-100">
                  <Tag className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Topic & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Topic *</Label>
                  <Select
                    value={blogData.category}
                    onValueChange={(value) => setBlogData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="border-primary/10 focus:ring-primary/20 bg-primary/5 text-foreground">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankingCategories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="flex-1 border-primary/10 focus:ring-primary/20 bg-primary/5 placeholder:text-muted-foreground"
                    />
                    <Button 
                      onClick={addTag} 
                      size="sm" 
                      variant="outline" 
                      className="border-primary/10 text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {blogData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="flex items-center gap-1 border-primary/10 bg-primary/5 text-primary"
                      >
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeTag(tag)} 
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Enable Comments</Label>
                  <Switch
                    checked={blogData.commentsEnabled}
                    onCheckedChange={(checked) => setBlogData((prev) => ({ ...prev, commentsEnabled: checked }))}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Visibility</Label>
                  <Select
                    value={blogData.visibility}
                    onValueChange={(value: "public" | "private" | "friends") => setBlogData((prev) => ({ ...prev, visibility: value }))}
                  >
                    <SelectTrigger className="border-primary/10 focus:ring-primary/20 bg-primary/5 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-primary" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2 text-primary" />
                          Private
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          Banking Community Only
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
