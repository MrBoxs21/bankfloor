"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import {
  Upload,
  X,
  Loader2,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Download,
  Eye,
  Play,
  Check,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"

interface MediaFile {
  url: string
  publicId: string
  alt: string
  name: string
  type: string
  size: number
  format?: string
  uploadProgress?: number
  status?: "uploading" | "completed" | "error"
}

interface MediaUploaderProps {
  onUpload: (file: MediaFile) => void
  currentFiles?: MediaFile[]
  multiple?: boolean
  accept?: string
}

export default function MediaUploader({
  onUpload,
  currentFiles = [],
  multiple = false,
  accept = "*/*",
}: MediaUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<MediaFile[]>([])
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)

  const getFileIcon = (type: string, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-12 w-12",
    }

    if (type.startsWith("image/")) return <FileImage className={`${sizeClasses[size]} text-blue-500`} />
    if (type.startsWith("video/")) return <FileVideo className={`${sizeClasses[size]} text-purple-500`} />
    if (type.startsWith("audio/")) return <FileAudio className={`${sizeClasses[size]} text-green-500`} />
    if (type.includes("pdf")) return <FileText className={`${sizeClasses[size]} text-red-500`} />
    if (type.includes("document") || type.includes("word"))
      return <FileText className={`${sizeClasses[size]} text-blue-600`} />
    return <File className={`${sizeClasses[size]} text-gray-500`} />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileTypeColor = (type: string) => {
    if (type.startsWith("image/")) return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
    if (type.startsWith("video/")) return "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800"
    if (type.startsWith("audio/")) return "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
    if (type.includes("pdf")) return "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
    return "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
  }

  const simulateUpload = async (file: File): Promise<MediaFile> => {
    const tempFile: MediaFile = {
      url: URL.createObjectURL(file),
      publicId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alt: file.name,
      name: file.name,
      type: file.type,
      size: file.size,
      format: file.name.split(".").pop(),
      uploadProgress: 0,
      status: "uploading",
    }

    setUploadingFiles((prev) => [...prev, tempFile])

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setUploadingFiles((prev) =>
        prev.map((f) => (f.publicId === tempFile.publicId ? { ...f, uploadProgress: progress } : f)),
      )
    }

    // Mark as completed
    const completedFile = { ...tempFile, status: "completed" as const, uploadProgress: 100 }
    setUploadingFiles((prev) => prev.filter((f) => f.publicId !== tempFile.publicId))

    return completedFile
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      try {
        for (const file of acceptedFiles) {
          const uploadedFile = await simulateUpload(file)
          onUpload(uploadedFile)
        }
        toast.success(`${acceptedFiles.length} file(s) uploaded successfully!`)
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("Failed to upload file(s)")
      }
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    disabled: uploadingFiles.length > 0,
  })

  const removeFile = (publicId: string) => {
    // This would typically call a remove function passed as prop
    toast.success("File removed")
  }

  const downloadFile = (file: MediaFile) => {
    const link = document.createElement("a")
    link.href = file.url
    link.download = file.name
    link.click()
  }

  const renderImagePreview = (file: MediaFile) => (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${getFileTypeColor(file.type)}`}>
      <CardContent className="p-0">
        <div className="relative group">
          <Image
            src={file.url || "/placeholder.svg"}
            alt={file.alt}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPreviewFile(file)}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button variant="secondary" size="sm" onClick={() => downloadFile(file)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="destructive" size="sm" onClick={() => removeFile(file.publicId)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon(file.type, "sm")}
              <div>
                <p className="font-medium text-sm truncate max-w-[150px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {file.format?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderVideoPreview = (file: MediaFile) => (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${getFileTypeColor(file.type)}`}>
      <CardContent className="p-0">
        <div className="relative group">
          <video
            src={file.url}
            className="w-full h-48 object-cover"
            poster="/placeholder.svg?height=200&width=300&text=Video"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm">
              <Play className="h-4 w-4 mr-1" />
              Play
            </Button>
            <Button variant="secondary" size="sm" onClick={() => downloadFile(file)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="destructive" size="sm" onClick={() => removeFile(file.publicId)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-black/70 text-white">
              <FileVideo className="h-3 w-3 mr-1" />
              Video
            </Badge>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {file.format?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderAudioPreview = (file: MediaFile) => (
    <Card className={`transition-all hover:shadow-lg ${getFileTypeColor(file.type)}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <FileAudio className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            <div className="mt-2">
              <audio controls className="w-full h-8">
                <source src={file.url} type={file.type} />
              </audio>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="outline" size="sm" onClick={() => downloadFile(file)}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => removeFile(file.publicId)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderDocumentPreview = (file: MediaFile) => (
    <Card className={`transition-all hover:shadow-lg ${getFileTypeColor(file.type)}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            {getFileIcon(file.type, "lg")}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{file.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{formatFileSize(file.size)}</span>
              {file.format && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {file.format.toUpperCase()}
                  </Badge>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadFile(file)}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => removeFile(file.publicId)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderFilePreview = (file: MediaFile) => {
    if (file.type.startsWith("image/")) return renderImagePreview(file)
    if (file.type.startsWith("video/")) return renderVideoPreview(file)
    if (file.type.startsWith("audio/")) return renderAudioPreview(file)
    return renderDocumentPreview(file)
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Upload Area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/50 scale-[1.02] shadow-lg"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
        } ${uploadingFiles.length > 0 ? "pointer-events-none opacity-50" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          <div
            className={`p-4 rounded-full transition-colors ${
              isDragActive ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <Upload className={`h-8 w-8 transition-colors ${isDragActive ? "text-blue-600" : "text-gray-400"}`} />
          </div>

          <div>
            <p className="text-lg font-semibold mb-2">{isDragActive ? "Drop files here" : "Drag & drop files here"}</p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse • All file types supported • No size limit
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileImage className="h-3 w-3" />
                Images
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileVideo className="h-3 w-3" />
                Videos
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileAudio className="h-3 w-3" />
                Audio
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Documents
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <File className="h-3 w-3" />
                Archives
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading Files
          </h3>
          {uploadingFiles.map((file) => (
            <Card key={file.publicId} className="p-3">
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={file.uploadProgress || 0} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">{file.uploadProgress || 0}%</span>
                  </div>
                </div>
                {file.status === "completed" && <Check className="h-5 w-5 text-green-500" />}
                {file.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* File Grid */}
      {currentFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <File className="h-5 w-5" />
            Uploaded Files ({currentFiles.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFiles.map((file, index) => (
              <div key={index}>{renderFilePreview(file)}</div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{previewFile.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {previewFile.type.startsWith("image/") && (
                <Image
                  src={previewFile.url || "/placeholder.svg"}
                  alt={previewFile.alt}
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
