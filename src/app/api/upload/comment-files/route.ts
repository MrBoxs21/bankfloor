import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} is too large (max 10MB)` }, { status: 400 })
      }

      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Determine file type for proper categorization
        let fileType = "other"
        const mimeType = file.type || ""

        if (mimeType.startsWith("image/")) {
          fileType = "image"
        } else if (mimeType.startsWith("video/")) {
          fileType = "video"
        } else if (mimeType.startsWith("audio/")) {
          fileType = "audio"
        } else if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("msword")) {
          fileType = "document"
        }

        // Generate a unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const originalName = file.name
        const fileExtension = originalName.split('.').pop() || ''
        const uniqueFilename = `comment-${timestamp}-${randomString}.${fileExtension}`

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "auto",
                folder: "blog-comments",
                public_id: uniqueFilename,
              },
              (error, result) => {
                if (error) {
                  reject(error)
                } else {
                  resolve(result)
                }
              },
            )
            .end(buffer)
        })

        // Add to uploaded files with required filename field
        uploadedFiles.push({
          url: result.secure_url,
          publicId: result.public_id,
          filename: uniqueFilename, // Set the required filename field
          originalName: originalName,
          type: fileType,
          mimeType: mimeType,
          size: file.size,
          format: result.format,
          uploadedAt: new Date().toISOString(),
        })
      } catch (uploadError) {
        console.error(`Error uploading file ${file.name}:`, uploadError)
        // Continue with other files even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}
