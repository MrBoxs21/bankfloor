import { Groq } from "groq-sdk"

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export class GroqAI {
  private static readonly API_URL = "https://api.groq.com/v1/completions"
  private static readonly API_KEY = process.env.GROQ_API_KEY

  static async generate(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI writing assistant."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.choices[0]?.message?.content || "No content generated"
    } catch (error) {
      console.error("Groq API error:", error)
      throw error
    }
  }

  static async improve(content: string): Promise<string> {
    return this.generate(`Improve this content while keeping its core message: ${content}`)
  }

  static async generateTags(content: string): Promise<string[]> {
    const response = await this.generate(`Generate 5 relevant tags for this content: ${content}`)
    return response.split(",").map(tag => tag.trim())
  }

  static async suggestTitles(content: string): Promise<string[]> {
    const response = await this.generate(`Generate 5 engaging titles for this content: ${content}`)
    return response.split("\n").map(title => title.trim().replace(/^\d+\.\s*/, ""))
  }
}
