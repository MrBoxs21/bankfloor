"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, Clock, Globe } from "lucide-react"

interface SimplePublishStatusProps {
  status: "draft" | "published" | "scheduled"
  savedBlogId?: string | null
  publishedAt?: string
}

export default function SimplePublishStatus({ status, savedBlogId, publishedAt }: SimplePublishStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "published":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: "Published",
          variant: "default" as const,
          className: "bg-green-600 hover:bg-green-700",
        }
      case "draft":
        return {
          icon: <FileText className="h-3 w-3" />,
          label: savedBlogId ? "Draft Saved" : "Draft",
          variant: "secondary" as const,
          className: "",
        }
      case "scheduled":
        return {
          icon: <Clock className="h-3 w-3" />,
          label: "Scheduled",
          variant: "outline" as const,
          className: "border-orange-500 text-orange-600",
        }
      default:
        return {
          icon: <FileText className="h-3 w-3" />,
          label: "Draft",
          variant: "secondary" as const,
          className: "",
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="flex items-center gap-2">
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.icon}
        <span className="ml-1">{statusInfo.label}</span>
      </Badge>

      {status === "published" && publishedAt && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  )
}
