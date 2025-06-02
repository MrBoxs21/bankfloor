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

    const { prompt } = (await request.json()) as AIRequestBody

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const suggestions = await FreeAIService.generateContent(
      `Generate 5 suggestions for the following content: ${prompt}`,
      "GPT-2"
    )

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("AI suggestions error:", error)
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    )
  }
}
