import { type NextRequest, NextResponse } from "next/server"
import { GroqAIService } from "@/lib/groq-ai"

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!GroqAIService.isAvailable()) {
      return NextResponse.json({ error: "Groq AI is not available" }, { status: 503 })
    }

    const tags = await GroqAIService.generateTags(content)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Groq tags error:", error)
    return NextResponse.json({ error: "Failed to generate tags" }, { status: 500 })
  }
}
