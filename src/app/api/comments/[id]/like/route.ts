import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import Comment from "@/lib/models/comment"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()

    const User = (await import("@/lib/models/user")).default
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const comment = await Comment.findById(params.id)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    const userId = user._id.toString()
    const isLiked = comment.likes.includes(userId)

    if (isLiked) {
      // Remove like
      comment.likes = comment.likes.filter((id: string) => id !== userId)
    } else {
      // Add like
      comment.likes.push(userId)
    }

    await comment.save()

    return NextResponse.json({
      success: true,
      isLiked: !isLiked,
      likesCount: comment.likes.length,
    })
  } catch (error) {
    console.error("Like comment error:", error)
    return NextResponse.json({ error: "Failed to like comment" }, { status: 500 })
  }
}
