import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { GroqAI } from "@/lib/groq-ai"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const tags = await GroqAI.generateTags(content)
    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Groq AI tags error:", error)
    return NextResponse.json(
      { error: "Failed to generate tags" },
      { status: 500 }
    )
  }
}
