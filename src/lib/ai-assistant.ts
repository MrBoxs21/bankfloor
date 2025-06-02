import { GroqAIService } from "./groq-ai"
import { FreeAIService } from "./free-ai-models"

export async function generateTopicContent(title: string, description: string): Promise<string> {
  try {
    // Validate inputs
    if (!title || !description) {
      throw new Error("Both title and description are required")
    }

    // Try Groq first (fastest and best quality)
    if (GroqAIService.isAvailable()) {
      try {
        console.log("Using Groq AI for content generation...")
        const content = await GroqAIService.generateBlogContent(title, description)
        if (content && content.length > 200) {
          return content
        }
      } catch (groqError) {
        console.error("Groq AI failed, falling back to free models:", groqError)
      }
    }

    // Fallback to free AI models
    try {
      console.log("Using free AI models...")
      const content = await FreeAIService.generateContent(
        `Write a comprehensive blog post about: ${title}\n\nDescription: ${description}`,
        "FLAN-T5",
      )
      if (content && content.length > 200) {
        return content
      }
    } catch (freeAiError) {
      console.log("Free AI models unavailable, using local generation...")
    }

    // Ultimate fallback to local content generation
    return FreeAIService.generateLocalContent(title, description)
  } catch (error) {
    console.error("Content generation error:", error)
    throw error
  }
}

export function isGeminiAvailable(): boolean {
  return GroqAIService.isAvailable() || true // Always true due to fallbacks
}
