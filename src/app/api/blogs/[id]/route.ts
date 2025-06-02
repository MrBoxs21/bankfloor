import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Blog from "@/lib/models/blog"
import User from "@/lib/models/user"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase()

    if (!params.id || params.id.length !== 24) {
      return NextResponse.json({ error: "Invalid blog ID format" }, { status: 400 })
    }

    const blog = await Blog.findById(params.id)
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()
    const blog = await Blog.findById(params.id)
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is the author
    if (blog.author.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not authorized to edit this blog" }, { status: 403 })
    }

    const updates = await request.json()
    const updatedBlog = await Blog.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true }
    ).populate("author", "name email avatar bio")

    return NextResponse.json({ 
      blog: {
        ...updatedBlog.toObject(),
        id: updatedBlog._id.toString(),
        _id: undefined
      }
    })
  } catch (error) {
    console.error("Blog update error:", error)
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()
    const blog = await Blog.findById(params.id)
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is the author or admin
    const isAuthor = blog.author.toString() === user._id.toString()
    const isAdmin = user.role === "admin"
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to delete this blog" }, { status: 403 })
    }

    await Blog.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Blog deletion error:", error)
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}
