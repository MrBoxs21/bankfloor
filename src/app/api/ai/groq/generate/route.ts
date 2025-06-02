import { type NextRequest, NextResponse } from "next/server"
import { GroqAIService } from "@/lib/groq-ai"

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    if (!GroqAIService.isAvailable()) {
      return NextResponse.json({ error: "Groq AI is not available" }, { status: 503 })
    }

    const content = await GroqAIService.generateBlogContent(title, description)

    return NextResponse.json({
      content,
      model: "groq-llama-3.1-8b-instant",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Groq generate error:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
