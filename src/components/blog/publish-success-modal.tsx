"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Share2, Eye, Copy, X } from "lucide-react"
import { toast } from "sonner"

interface PublishSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  blogTitle: string
  blogSlug: string
  publishedAt: string
}

export default function PublishSuccessModal({
  isOpen,
  onClose,
  blogTitle,
  blogSlug,
  publishedAt,
}: PublishSuccessModalProps) {
  const [showModal, setShowModal] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setShowModal(isOpen)
  }, [isOpen])

  const getBlogUrl = () => {
    if (!isClient) return ""
    return `${window.location.origin}/blog/${blogSlug}`
  }

  const copyUrl = async () => {
    if (!isClient) return

    try {
      await navigator.clipboard.writeText(getBlogUrl())
      toast.success("URL copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  const sharePost = async () => {
    if (!isClient) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: blogTitle,
          url: getBlogUrl(),
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      copyUrl()
    }
  }

  const viewPost = () => {
    if (!isClient) return
    window.open(getBlogUrl(), "_blank")
  }

  if (!showModal || !isClient) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl">🎉 Blog Published!</CardTitle>
          <p className="text-sm text-muted-foreground">Your blog post is now live and visible to everyone</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <h3 className="font-medium text-sm mb-1">{blogTitle}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Published
              </Badge>
              <span>{new Date(publishedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={sharePost} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={copyUrl} variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={viewPost} variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Post
            </Button>
            <Button onClick={onClose} variant="ghost" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
