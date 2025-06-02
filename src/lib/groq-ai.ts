import { Groq } from "groq-sdk"

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export class GroqAIService {
  static async generateContent(
    prompt: string,
    options?: {
      model?: string
      maxTokens?: number
      temperature?: number
    },
  ): Promise<string> {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: options?.model || "llama-3.1-8b-instant", // Fast Groq model
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
      })

      const rawContent = completion.choices[0]?.message?.content || ""
      return this.formatContent(rawContent)
    } catch (error) {
      console.error("Groq API error:", error)
      throw error
    }
  }

  // Convert markdown-style formatting to clean HTML
  private static formatContent(content: string): string {
    let formatted = content

    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Convert ### to h3
    formatted = formatted.replace(/^### (.*$)/gim, "<h3>$1</h3>")

    // Convert ## to h2
    formatted = formatted.replace(/^## (.*$)/gim, "<h2>$1</h2>")

    // Convert # to h1
    formatted = formatted.replace(/^# (.*$)/gim, "<h1>$1</h1>")

    // Convert bullet points
    formatted = formatted.replace(/^- (.*$)/gim, "<li>$1</li>")
    formatted = formatted.replace(/^• (.*$)/gim, "<li>$1</li>")

    // Wrap consecutive <li> items in <ul>
    formatted = formatted.replace(/(<li>.*<\/li>)/gs, (match) => {
      const items = match
        .split("</li>")
        .filter((item) => item.trim())
        .map((item) => item + "</li>")
      return `<ul>${items.join("")}</ul>`
    })

    // Convert numbered lists
    formatted = formatted.replace(/^\d+\. (.*$)/gim, "<li>$1</li>")

    // Convert line breaks to paragraphs
    const paragraphs = formatted.split("\n\n").filter((p) => p.trim())
    formatted = paragraphs
      .map((p) => {
        const trimmed = p.trim()
        if (trimmed.startsWith("<h") || trimmed.startsWith("<ul") || trimmed.startsWith("<ol")) {
          return trimmed
        }
        return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`
      })
      .join("\n\n")

    // Clean up any remaining markdown artifacts
    formatted = formatted.replace(/\*\*/g, "") // Remove any remaining **
    formatted = formatted.replace(/\*/g, "") // Remove any remaining *
    formatted = formatted.replace(/#{1,6}\s/g, "") // Remove any remaining #

    return formatted
  }

  static async generateBlogContent(title: string, description: string): Promise<string> {
    const prompt = `Write a comprehensive, engaging blog post about "${title}".

Description: ${description}

Requirements:
- Create an attention-grabbing introduction
- Include 3-4 main sections with detailed content
- Add practical examples and insights
- Write a compelling conclusion with actionable takeaways
- Use a professional, engaging tone
- Make it approximately 800-1000 words
- Use proper formatting with headings and structure
- Do NOT use markdown formatting like ** or * - write in clean, readable text
- Structure content with clear sections and paragraphs

Write the content as clean text that will be formatted automatically.`

    return await this.generateContent(prompt, {
      model: "llama-3.1-8b-instant",
      maxTokens: 1500,
      temperature: 0.7,
    })
  }

  static async generateTags(content: string): Promise<string[]> {
    const prompt = `Based on this blog content, suggest 6-8 relevant SEO tags (single words or short phrases):

${content.substring(0, 1000)}...

Return only the tags, separated by commas, no explanations, no formatting.`

    const response = await this.generateContent(prompt, {
      maxTokens: 100,
      temperature: 0.3,
    })

    return response
      .replace(/<[^>]*>/g, "") // Remove any HTML tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 8)
  }

  static async improveBlogContent(content: string): Promise<string> {
    const prompt = `Improve this blog content by making it more engaging, professional, and well-structured:

${content}

Improvements to make:
- Enhance clarity and readability
- Add compelling examples
- Improve flow and structure
- Make it more engaging
- Ensure professional tone
- Add actionable insights
- Do NOT use markdown formatting like ** or * - write in clean, readable text

Return the improved content as clean text that will be formatted automatically.`

    return await this.generateContent(prompt, {
      maxTokens: 1500,
      temperature: 0.6,
    })
  }

  static async generateTitles(description: string): Promise<string[]> {
    const prompt = `Generate 5 compelling, SEO-friendly blog titles for this topic:

${description}

Requirements:
- Attention-grabbing and clickable
- Include relevant keywords
- 40-60 characters each
- Use power words
- Appeal to target audience
- No formatting, just clean titles

Return only the titles, one per line, numbered 1-5.`

    const response = await this.generateContent(prompt, {
      maxTokens: 200,
      temperature: 0.8,
    })

    return response
      .replace(/<[^>]*>/g, "") // Remove any HTML tags
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((title) => title.length > 0)
      .slice(0, 5)
  }

  static async generateSEODescription(title: string, content: string): Promise<string> {
    const prompt = `Create a compelling SEO meta description for this blog post:

Title: ${title}
Content: ${content.substring(0, 500)}...

Requirements:
- 150-160 characters
- Include main keywords
- Compelling and clickable
- Summarize key value
- Include call-to-action
- No formatting, just clean text

Return only the meta description.`

    const response = await this.generateContent(prompt, {
      maxTokens: 100,
      temperature: 0.5,
    })

    return response.replace(/<[^>]*>/g, "").trim() // Remove any HTML tags
  }

  static isAvailable(): boolean {
    return !!process.env.GROQ_API_KEY
  }
}
