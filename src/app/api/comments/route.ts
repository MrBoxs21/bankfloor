import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Comment from "@/lib/models/comment"
import Blog from "@/lib/models/blog"
import User from "@/lib/models/user"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()
    const { blogId, content, attachments, parentCommentId } = await request.json()

    if (!blogId || !content?.trim()) {
      return NextResponse.json({ error: "Blog ID and content are required" }, { status: 400 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const blog = await Blog.findById(blogId)
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    if (!blog.commentsEnabled) {
      return NextResponse.json({ error: "Comments are disabled for this blog" }, { status: 403 })
    }

    const comment = new Comment({
      blog: blogId,
      content,
      author: user._id,
      attachments: attachments || [],
      parentComment: parentCommentId || null,
    })

    await comment.save()

    // Populate author details
    await comment.populate("author", "name email avatar")

    return NextResponse.json({
      comment: {
        ...comment.toObject(),
        id: comment._id.toString(),
      },
    })
  } catch (error) {
    console.error("Comment creation error:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const blogId = url.searchParams.get("blogId")

    if (!blogId) {
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    const comments = await Comment.find({ blog: blogId })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 })
      .lean()

    // Transform _id to id in response
    const transformedComments = comments.map((comment) => ({
      ...comment,
      id: comment._id.toString(),
      _id: undefined,
    }))

    return NextResponse.json({ comments: transformedComments })
  } catch (error) {
    console.error("Comments fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
