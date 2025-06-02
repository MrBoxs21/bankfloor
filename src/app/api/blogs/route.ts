import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Blog from "@/lib/models/blog"
import User from "@/lib/models/user"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
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

    // Create new blog with user as author
    const blog = new Blog({
      ...blogData,
      author: user._id,
    })

    await blog.save()

    // Return success response
    return NextResponse.json({ 
      message: "Blog created successfully",
      blog: {
        ...blog.toObject(),
        id: blog._id.toString(),
      }
    })
  } catch (error) {
    console.error("Blog creation error:", error)
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    
    // Build query
    const queryObj: any = {
      status: "published",
      visibility: "public"
    }
    
    if (query) {
      queryObj.$or = [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } }
      ]
    }

    // Get blogs with author info
    const blogs = await Blog.find(queryObj)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email avatar bio")
      .lean()

    // Get total count for pagination
    const total = await Blog.countDocuments(queryObj)

    // Transform _id to id in response
    const transformedBlogs = blogs.map(blog => ({
      ...blog,
      id: blog._id.toString(),
      _id: undefined
    }))

    return NextResponse.json({
      blogs: transformedBlogs,
      pagination: {
        total,
        page,
        pageSize: limit,
        pageCount: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Blogs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
