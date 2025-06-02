import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import Blog from "@/lib/models/blog"
import User from "@/lib/models/user"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()

    // Find the user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find all blogs by this user
    const blogs = await Blog.find({ author: user._id }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ blogs })
  } catch (error) {
    console.error("User blogs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user blogs" }, { status: 500 })
  }
}
