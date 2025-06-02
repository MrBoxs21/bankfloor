import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { FreeAIService } from "@/lib/free-ai-models"
import type { AIRequestBody } from "@/types/ai"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { prompt, modelName } = (await request.json()) as AIRequestBody

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const content = await FreeAIService.generateContent(prompt, modelName)
    return NextResponse.json({ content })
  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    )
  }
}
