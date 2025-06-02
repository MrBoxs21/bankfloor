import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { FreeAIService } from "@/lib/free-ai-models"

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

    const prompt = `Generate 5 relevant tags for this content: ${content}`
    const response = await FreeAIService.generateContent(prompt, "FLAN-T5")
    const tags = response.split(",").map(tag => tag.trim())

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("AI tags error:", error)
    return NextResponse.json(
      { error: "Failed to generate tags" },
      { status: 500 }
    )
  }
}
