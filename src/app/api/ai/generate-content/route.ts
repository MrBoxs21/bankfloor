import { type NextRequest, NextResponse } from "next/server"
import { generateTopicContent } from "@/lib/ai-assistant"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    // Validate input lengths
    if (title.length > 200) {
      return NextResponse.json({ error: "Title is too long (max 200 characters)" }, { status: 400 })
    }

    if (description.length > 1000) {
      return NextResponse.json({ error: "Description is too long (max 1000 characters)" }, { status: 400 })
    }

    // Generate content using free AI models
    const content = await generateTopicContent(title.trim(), description.trim())

    return NextResponse.json({
      content,
      method: "Free AI Models + Local Templates",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Content generation API error:", error)

    // Return specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          type: "generation_error",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred while generating content",
        type: "unknown_error",
      },
      { status: 500 },
    )
  }
}
