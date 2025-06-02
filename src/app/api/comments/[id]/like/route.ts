import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Comment from "@/lib/models/comment"
import User from "@/lib/models/user"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const comment = await Comment.findById(params.id)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Toggle like
    const userIdString = user._id.toString()
    const likeIndex = comment.likes.indexOf(userIdString)
    
    if (likeIndex === -1) {
      comment.likes.push(userIdString)
    } else {
      comment.likes.splice(likeIndex, 1)
    }

    await comment.save()

    return NextResponse.json({ 
      likes: comment.likes.length,
      isLiked: likeIndex === -1 
    })
  } catch (error) {
    console.error("Comment like error:", error)
    return NextResponse.json({ error: "Failed to like comment" }, { status: 500 })
  }
}
