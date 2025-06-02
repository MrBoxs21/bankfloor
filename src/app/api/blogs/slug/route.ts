import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Blog from "@/lib/models/blog"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const slug = url.searchParams.get("slug")
    
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    await connectToDatabase()
    const blog = await Blog.findOne({ slug })
      .populate("author", "name email avatar bio")
      .lean()

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      blog: {
        ...blog,
        id: blog._id.toString(),
        _id: undefined
      }
    })
  } catch (error) {
    console.error("Blog fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
  }
}