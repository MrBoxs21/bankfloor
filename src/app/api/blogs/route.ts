import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import Blog from "@/lib/models/blog"
import User from "@/lib/models/user"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get the user from the database to ensure we have the correct user ID
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const blogData = await request.json()

    console.log("Received blog data:", {
      title: blogData.title,
      mediaFilesCount: blogData.mediaFiles?.length || 0,
      mediaFiles: blogData.mediaFiles,
    })

    // Validate required fields
    if (!blogData.title || !blogData.content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Generate slug if not provided
    if (!blogData.slug) {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: blogData.slug })
    if (existingBlog) {
      // Add timestamp to make slug unique
      blogData.slug = `${blogData.slug}-${Date.now()}`
    }

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

    console.log("Processed media files:", processedMediaFiles)

    // Create the blog with the user's ID as the author
    const blog = new Blog({
      ...blogData,
      author: user._id, // Use the actual user ID from the database
      mediaFiles: processedMediaFiles,
      readingTime,
      publishedAt: blogData.status === "published" ? new Date() : undefined,
    })

    await blog.save()

    // Populate the author information before sending the response
    const populatedBlog = await Blog.findById(blog._id).populate("author", "name email avatar bio")

    console.log("Blog created successfully with media files:", {
      id: blog._id,
      mediaFilesCount: blog.mediaFiles?.length || 0,
    })

    return NextResponse.json({ blog: populatedBlog })
  } catch (error) {
    console.error("Blog creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create blog",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get the limit parameter from the request URL
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')

    let query = Blog.find({ status: "published" })
      .populate("author", "name email avatar bio")
      .sort({ publishedAt: -1 })
      .lean()

    // Apply limit if provided and is a valid number
    if (limit && !isNaN(parseInt(limit as string))) {
      query = query.limit(parseInt(limit as string))
    }

    // Fetch blogs based on the constructed query
    const blogs = await query.exec()

    // Ensure author information is properly formatted
    const formattedBlogs = blogs.map((blog) => {
      if (!blog.author || typeof blog.author === "string") {
        blog.author = {
          _id: blog.author || "unknown",
          name: "Anonymous Author",
          avatar: { url: "/placeholder.svg?height=40&width=40&text=AA" },
        }
      }
      // Ensure _id is mapped to id for frontend consistency
      if (blog._id) {
        blog.id = blog._id.toString()
        delete blog._id // Remove _id if id is preferred on the frontend
      }
      return blog
    })

    return NextResponse.json({ blogs: formattedBlogs })
  } catch (error) {
    console.error("Blogs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
