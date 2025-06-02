import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import Blog from "@/lib/models/blog"
import User from "@/lib/models/user"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    console.log("Fetching blog with ID:", params.id)

    // Validate if the ID is a valid MongoDB ObjectId
    if (!params.id || params.id.length !== 24) {
      return NextResponse.json({ error: "Invalid blog ID format" }, { status: 400 })
    }

    // Find the blog and populate the author
    const blog = await Blog.findById(params.id).populate("author", "name email avatar bio").lean()

    if (!blog) {
      console.log("Blog not found for ID:", params.id)
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    console.log("Blog found:", {
      title: blog.title,
      authorId: blog.author?._id || "No author ID",
      authorName: blog.author?.name || "No author name",
      mediaFilesCount: blog.mediaFiles?.length || 0,
    })

    // If author is just an ID string, fetch the author separately
    if (blog.author && typeof blog.author === "string") {
      try {
        const authorUser = await User.findById(blog.author).select("name email avatar bio").lean()
        if (authorUser) {
          blog.author = authorUser
        } else {
          blog.author = {
            _id: blog.author,
            name: "Anonymous Author",
            avatar: { url: "/placeholder.svg?height=40&width=40&text=AA" },
            bio: "Content creator and writer",
          }
        }
      } catch (authorError) {
        console.error("Error fetching author:", authorError)
        blog.author = {
          _id: blog.author,
          name: "Anonymous Author",
          avatar: { url: "/placeholder.svg?height=40&width=40&text=AA" },
          bio: "Content creator and writer",
        }
      }
    }

    // Ensure author has required fields
    if (!blog.author) {
      blog.author = {
        _id: "unknown",
        name: "Anonymous Author",
        avatar: { url: "/placeholder.svg?height=40&width=40&text=AA" },
        bio: "Content creator and writer",
      }
    } else {
      if (!blog.author.name) blog.author.name = "Anonymous Author"
      if (!blog.author.avatar) blog.author.avatar = { url: "/placeholder.svg?height=40&width=40&text=AA" }
      if (!blog.author.bio) blog.author.bio = "Content creator and writer"
    }

    // Increment view count
    await Blog.findByIdAndUpdate(params.id, { $inc: { views: 1 } })

    return NextResponse.json({ blog })
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()

    // Find the blog
    const blog = await Blog.findById(params.id).populate("author", "email role")

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    // Find the current user
    const currentUser = await User.findOne({ email: session.user.email })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is the author or an admin
    const isAuthor = blog.author._id.toString() === currentUser._id.toString()
    const isAdmin = currentUser.role === "admin"

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to delete this blog" }, { status: 403 })
    }

    // Delete the blog
    await Blog.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true, message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Blog delete error:", error)
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const blogData = await request.json()

    console.log("Updating blog with media files:", {
      id: params.id,
      mediaFilesCount: blogData.mediaFiles?.length || 0,
    })

    // Calculate reading time
    const wordsPerMinute = 200
    const wordCount = blogData.content.replace(/<[^>]*>/g, "").split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)

    // Process media files - ensure they're properly formatted
    const processedMediaFiles = (blogData.mediaFiles || []).map((file: any) => ({
      url: file.url,
      publicId: file.publicId || "",
      name: file.name,
      type: file.type,
      size: file.size || 0,
      format: file.format || file.name.split(".").pop(),
      alt: file.alt || file.name,
    }))

    const updatedBlog = await Blog.findByIdAndUpdate(
      params.id,
      {
        ...blogData,
        mediaFiles: processedMediaFiles,
        readingTime,
        publishedAt: blogData.status === "published" && !blogData.publishedAt ? new Date() : blogData.publishedAt,
      },
      { new: true },
    )

    if (!updatedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    console.log("Blog updated successfully with media files:", {
      id: updatedBlog._id,
      mediaFilesCount: updatedBlog.mediaFiles?.length || 0,
    })

    return NextResponse.json({
      success: true,
      blog: {
        _id: updatedBlog._id,
        title: updatedBlog.title,
        slug: updatedBlog.slug,
        status: updatedBlog.status,
        publishedAt: updatedBlog.publishedAt,
        mediaFiles: updatedBlog.mediaFiles,
      },
    })
  } catch (error) {
    console.error("Blog update error:", error)
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}
