import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Blog from "@/lib/models/blog"
import User from "@/lib/models/user"

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const blogs = await Blog.find({ author: user._id })
      .sort({ createdAt: -1 })
      .lean()

    // Transform MongoDB _id to id in response
    const transformedBlogs = blogs.map(blog => ({
      ...blog,
      id: blog._id.toString(),
      _id: undefined
    }))

    return NextResponse.json({ blogs: transformedBlogs })
  } catch (error) {
    console.error("User blogs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
