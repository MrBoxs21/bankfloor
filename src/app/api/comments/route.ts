import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import Comment from "@/lib/models/comment"
import Blog from "@/lib/models/blog"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()

    const { blogId, content, attachments, parentCommentId } = await request.json()

    if (!blogId || !content?.trim()) {
      return NextResponse.json({ error: "Blog ID and content are required" }, { status: 400 })
    }

    // Get user ID from database using email
    const User = (await import("@/lib/models/user")).default
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if blog exists and comments are enabled
    const blog = await Blog.findById(blogId)
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    if (!blog.commentsEnabled) {
      return NextResponse.json({ error: "Comments are disabled for this blog" }, { status: 403 })
    }

    // Process attachments
    const processedAttachments = (attachments || []).map((file: any) => ({
      type: file.type,
      url: file.url,
      publicId: file.publicId || "",
      filename: file.filename,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
    }))

    // Create comment
    const comment = new Comment({
      blog: blogId,
      author: user._id,
      content: content.trim(),
      attachments: processedAttachments,
      parentComment: parentCommentId || null,
    })

    await comment.save()

    // If this is a reply, add it to parent comment's replies
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      })
    }

    // Populate author info for response
    await comment.populate("author", "name avatar")

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Comment creation error:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const blogId = searchParams.get("blogId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!blogId) {
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 })
    }

    // Get top-level comments (not replies)
    const comments = await Comment.find({
      blog: blogId,
      parentComment: null,
      status: "active",
    })
      .populate("author", "name avatar")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "name avatar",
        },
        match: { status: "active" },
        options: { sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Comment.countDocuments({
      blog: blogId,
      parentComment: null,
      status: "active",
    })

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Comments fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
