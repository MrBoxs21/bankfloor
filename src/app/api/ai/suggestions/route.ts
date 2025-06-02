import { type NextRequest, NextResponse } from "next/server"
import { generateTopicContent } from "@/lib/ai-assistant"

export async function POST(request: NextRequest) {
  try {
    const { content, type } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const suggestion = await generateTopicContent(content, type || "Content suggestion")

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error("AI Suggestions error:", error)
    return NextResponse.json({ error: "Failed to generate AI suggestion" }, { status: 500 })
  }
}
