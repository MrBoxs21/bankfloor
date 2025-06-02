import { type NextRequest, NextResponse } from "next/server"
import { generateTopicContent } from "@/lib/ai-assistant"

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    try {
      // Create a prompt for tag generation
      const prompt = `Based on this blog content, suggest 5-8 relevant tags (single words or short phrases, comma-separated):\n\n${content}`

      // Generate content based on the prompt
      const tagsText = await generateTopicContent(prompt, "Tag generation")

      // Parse the response into an array of tags
      const tags = tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      return NextResponse.json({ tags })
    } catch (error) {
      console.error("Tag Generation Error:", error)
      return NextResponse.json({ error: "Failed to generate tags" }, { status: 500 })
    }
  } catch (error) {
    console.error("Tag generation error:", error)
    return NextResponse.json({ error: "Failed to generate tags" }, { status: 500 })
  }
}
