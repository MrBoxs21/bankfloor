import { type NextRequest, NextResponse } from "next/server"
import { GroqAIService } from "@/lib/groq-ai"

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    if (!GroqAIService.isAvailable()) {
      return NextResponse.json({ error: "Groq AI is not available" }, { status: 503 })
    }

    const titles = await GroqAIService.generateTitles(description)

    return NextResponse.json({ titles })
  } catch (error) {
    console.error("Groq titles error:", error)
    return NextResponse.json({ error: "Failed to generate titles" }, { status: 500 })
  }
}
