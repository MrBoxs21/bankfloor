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

    const improvedContent = await GroqAIService.improveBlogContent(content)

    return NextResponse.json({ content: improvedContent })
  } catch (error) {
    console.error("Groq improve error:", error)
    return NextResponse.json({ error: "Failed to improve content" }, { status: 500 })
  }
}
