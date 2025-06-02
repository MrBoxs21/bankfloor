import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Blog from "@/lib/models/blog"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()

    const blog = await Blog.findOne({ slug: params.slug, status: "published" })

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    // Try to populate author, but handle case where author might not exist
    let blogWithAuthor
    try {
      blogWithAuthor = await Blog.findOne({ slug: params.slug, status: "published" }).populate(
        "author",
        "name avatar bio",
      )
    } catch (populateError) {
      console.log("Author population failed, using default author:", populateError)
      blogWithAuthor = {
        ...blog.toObject(),
        author: {
          _id: blog.author,
          name: "Anonymous Author",
          avatar: { url: "/placeholder.svg?height=40&width=40&text=AA" },
          bio: "Content creator and writer",
        },
      }
    }

    // If author population failed or author doesn't exist, create a default author
    if (!blogWithAuthor.author || typeof blogWithAuthor.author === "string") {
      blogWithAuthor = {
        ...blog.toObject(),
        author: {
          _id: blog.author,
          name: "Anonymous Author",
          avatar: { url: "/placeholder.svg?height=40&width=40&text=AA" },
          bio: "Content creator and writer",
        },
      }
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })

    return NextResponse.json({ blog: blogWithAuthor })
  } catch (error) {
    console.error("Blog fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch blog",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
