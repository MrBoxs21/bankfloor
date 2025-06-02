import { NextResponse } from "next/server"
import { getSignedUploadUrl } from "@/lib/cloudinary"

export async function GET() {
  try {
    const signedData = getSignedUploadUrl()
    return NextResponse.json(signedData)
  } catch (error) {
    console.error("Cloudinary sign error:", error)
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 })
  }
}
