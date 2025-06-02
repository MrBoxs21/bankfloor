import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()

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
        return NextResponse.json(
          { error: "File size should not exceed 10MB" },
          { status: 400 }
        )
      }

      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const dataURI = `data:${file.type};base64,${base64}`

      try {
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "comment-files",
        })

        uploadedFiles.push({
          url: result.secure_url,
          publicId: result.public_id,
          type: file.type,
        })
      } catch (uploadError) {
        console.error("File upload error:", uploadError)
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    )
  }
}
