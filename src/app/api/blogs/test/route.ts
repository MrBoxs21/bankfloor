import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Blog from "@/lib/models/blog"
import User from "@/lib/models/user"

export async function GET() {
  try {
    await connectToDatabase()

    // Test database connection and get sample blog
    const blogCount = await Blog.countDocuments()
    const sampleBlog = await Blog.findOne()

    // Test if we can create a sample user (for testing)
    let userTest = null
    try {
      const existingUser = await User.findOne({ email: "test@example.com" })
      if (!existingUser) {
        const testUser = new User({
          name: "Test Author",
          email: "test@example.com",
          bio: "Test author for blog platform",
        })
        userTest = await testUser.save()
      } else {
        userTest = existingUser
      }
    } catch (userError) {
      console.log("User creation test failed:", userError)
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      blogCount,
      userTest: userTest ? { _id: userTest._id, name: userTest.name } : null,
      sampleBlog: sampleBlog
        ? {
            _id: sampleBlog._id,
            title: sampleBlog.title,
            status: sampleBlog.status,
            author: sampleBlog.author,
          }
        : null,
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 500 },
    )
  }
}
