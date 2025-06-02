"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageCircle,
  Heart,
  Reply,
  Upload,
  Download,
  File,
  ImageIcon,
  Video,
  Music,
  FileText,
  X,
  Send,
  Loader2,
  Paperclip,
  Eye,
  Lock,
} from "lucide-react"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import Link from "next/link"

interface Attachment {
  type: "image" | "document" | "video" | "audio" | "other"
  url: string
  publicId?: string
  filename: string
  originalName?: string
  size: number
  mimeType: string
  uploadedAt?: string
}

interface Comment {
  _id: string
  content: string
  author: {
    _id: string
    name: string
    avatar?: { url: string }
  }
  attachments: Attachment[]
  replies: Comment[]
  likes: string[]
  createdAt: string
  isEdited: boolean
}

interface CommentSystemProps {
  blogId: string
  commentsEnabled: boolean
}

export default function CommentSystem({ blogId, commentsEnabled }: CommentSystemProps) {
  const { data: session, status } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null)

  // Fetch comments
  useEffect(() => {
    fetchComments()
  }, [blogId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?blogId=${blogId}`)
      const data = await response.json()
      if (response.ok) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // File upload handling
  const onDrop = async (acceptedFiles: File[]) => {
    if (!session) {
      toast.error("Please sign in to upload files")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      acceptedFiles.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload/comment-files", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      // Add uploaded files to attachments
      setAttachments((prev) => [...prev, ...acceptedFiles])
      toast.success(`${acceptedFiles.length} file(s) uploaded successfully!`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".ogg"],
      "audio/*": [".mp3", ".wav", ".ogg"],
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".md"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  })

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File | Attachment) => {
    // Safe check for file type
    const fileType = "type" in file ? file.type : file.mimeType || ""

    if (!fileType) return <File className="h-4 w-4 text-gray-500" />

    if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-blue-500" />
    if (fileType.startsWith("video/")) return <Video className="h-4 w-4 text-purple-500" />
    if (fileType.startsWith("audio/")) return <Music className="h-4 w-4 text-green-500" />
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />
    return <File className="h-4 w-4 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const uploadAttachments = async (files: File[]): Promise<Attachment[]> => {
    if (files.length === 0) return []

    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await fetch("/api/upload/comment-files", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Upload failed")
    }

    return data.files
  }

  const submitComment = async (content: string, parentId?: string) => {
    if (!session) {
      toast.error("Please sign in to comment")
      return
    }

    if (!content.trim() && attachments.length === 0) {
      toast.error("Please add some content or attachments")
      return
    }

    setIsSubmitting(true)
    try {
      // Upload attachments first
      const uploadedAttachments = await uploadAttachments(attachments)

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId,
          content: content.trim(),
          attachments: uploadedAttachments,
          parentCommentId: parentId,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        toast.success("Comment posted successfully!")
        setNewComment("")
        setReplyContent("")
        setReplyTo(null)
        setAttachments([])
        fetchComments() // Refresh comments
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const likeComment = async (commentId: string) => {
    if (!session?.user?.email) {
      toast.error("Please sign in to like comments")
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session.user.email }),
      })

      if (response.ok) {
        fetchComments() // Refresh to get updated likes
      }
    } catch (error) {
      toast.error("Failed to like comment")
    }
  }

  const downloadAttachment = (attachment: Attachment) => {
    if (!attachment || !attachment.url) {
      toast.error("Cannot download: Invalid attachment")
      return
    }

    const link = document.createElement("a")
    link.href = attachment.url
    link.download = attachment.filename || "download"
    link.click()
  }

  const renderAttachment = (attachment: Attachment) => {
    if (!attachment || !attachment.type) {
      return (
        <Card className="p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium truncate max-w-[150px]">{attachment?.filename || "Unknown file"}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(attachment?.size || 0)}</p>
              </div>
            </div>
            <Button
              onClick={() => attachment?.url && window.open(attachment.url, "_blank")}
              size="sm"
              variant="outline"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )
    }

    if (attachment.type === "image") {
      return (
        <div className="relative group cursor-pointer" onClick={() => setPreviewFile(attachment)}>
          <Image
            src={attachment.url || "/placeholder.svg"}
            alt={attachment.filename || "Image"}
            width={200}
            height={150}
            className="rounded-lg object-cover hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              downloadAttachment(attachment)
            }}
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    if (attachment.type === "video") {
      return (
        <div className="relative group">
          <video src={attachment.url} controls className="rounded-lg max-w-full h-auto" style={{ maxHeight: "300px" }}>
            Your browser does not support the video tag.
          </video>
          <Button
            onClick={() => downloadAttachment(attachment)}
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    if (attachment.type === "audio") {
      return (
        <Card className="p-4 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
              <Music className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{attachment.filename}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
            </div>
            <Button onClick={() => downloadAttachment(attachment)} size="sm" variant="outline">
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <audio controls className="w-full">
            <source src={attachment.url} type={attachment.mimeType} />
            Your browser does not support the audio element.
          </audio>
        </Card>
      )
    }

    return (
      <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {getFileIcon(attachment)}
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{attachment.filename}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(attachment.size)}</span>
                {attachment.mimeType && (
                  <>
                    <span>•</span>
                    <span>{attachment.mimeType.split("/")[1]?.toUpperCase() || "FILE"}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button onClick={() => window.open(attachment.url, "_blank")} size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
            <Button onClick={() => downloadAttachment(attachment)} size="sm" variant="outline">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment._id} className={`space-y-3 ${isReply ? "ml-8 border-l-2 border-muted pl-4" : ""}`}>
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={comment.author?.avatar?.url || "/placeholder.svg"}
                alt={comment.author?.name || "User"}
              />
              <AvatarFallback>{(comment.author?.name || "U").charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.author?.name || "Anonymous User"}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                {comment.isEdited && (
                  <Badge variant="outline" className="text-xs">
                    Edited
                  </Badge>
                )}
              </div>

              <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

              {/* Attachments */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    <span>{comment.attachments.length} attachment(s)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {comment.attachments.map((attachment, index) => (
                      <div key={index}>{renderAttachment(attachment)}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2">
                <Button
                  onClick={() => likeComment(comment._id)}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-muted-foreground hover:text-red-500"
                  disabled={status !== "authenticated"}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      session?.user?.email && comment.likes && comment.likes.some((like) => like === session.user.email)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  {comment.likes?.length || 0}
                </Button>

                <Button
                  onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-muted-foreground hover:text-blue-500"
                  disabled={status !== "authenticated"}
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </Button>
              </div>

              {/* Reply Form */}
              {replyTo === comment._id && session && (
                <div className="mt-3 space-y-3 p-3 bg-muted/30 rounded-lg">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px]"
                  />

                  {/* File Upload for Reply */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {isDragActive ? "Drop files here" : "Drag files or click to upload"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Images, videos, audio, documents (max 10MB each)</p>
                  </div>

                  {/* Attachment Preview */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file)}
                            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                            <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                          </div>
                          <Button onClick={() => removeAttachment(index)} size="sm" variant="ghost">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => submitComment(replyContent, comment._id)}
                      disabled={isSubmitting || isUploading}
                      size="sm"
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post Reply
                        </>
                      )}
                    </Button>
                    <Button onClick={() => setReplyTo(null)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">{comment.replies.map((reply) => renderComment(reply, true))}</div>
      )}
    </div>
  )

  if (!commentsEnabled) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Comments are disabled for this blog post.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Loading authentication...</AlertDescription>
            </Alert>
          )}

          {status === "unauthenticated" && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>{" "}
                to join the conversation and share your thoughts.
              </AlertDescription>
            </Alert>
          )}

          {/* New Comment Form - only show if authenticated */}
          {status === "authenticated" && session && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || "/placeholder.svg"} alt={session.user?.name || ""} />
                  <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive ? "Drop files here" : "Drag files or click to upload"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Support images, videos, audio, documents (max 10MB each)</p>
              </div>

              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Attachments:</p>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file)}
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                      </div>
                      <Button onClick={() => removeAttachment(index)} size="sm" variant="ghost">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => submitComment(newComment)}
                disabled={isSubmitting || isUploading || (!newComment.trim() && attachments.length === 0)}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          )}

          <Separator />

          {/* Comments List */}
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">{comments.map((comment) => renderComment(comment))}</div>
          )}
        </CardContent>
      </Card>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{previewFile.filename}</h3>
              <div className="flex items-center gap-2">
                <Button onClick={() => downloadAttachment(previewFile)} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setPreviewFile(null)} size="sm" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {previewFile.type === "image" && (
                <Image
                  src={previewFile.url || "/placeholder.svg"}
                  alt={previewFile.filename}
                  width={800}
                  height={600}
                  className="max-w-full h-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
