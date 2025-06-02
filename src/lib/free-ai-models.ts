// Free AI models that don't require API keys

interface AIModel {
  name: string
  endpoint: string
  description: string
  maxTokens: number
}

export const FREE_AI_MODELS: AIModel[] = [
  {
    name: "Microsoft DialoGPT",
    endpoint: "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
    description: "Good for conversational content",
    maxTokens: 1000,
  },
  {
    name: "GPT-2",
    endpoint: "https://api-inference.huggingface.co/models/gpt2",
    description: "Classic text generation model",
    maxTokens: 1024,
  },
  {
    name: "FLAN-T5",
    endpoint: "https://api-inference.huggingface.co/models/google/flan-t5-large",
    description: "Google's instruction-following model",
    maxTokens: 512,
  },
  {
    name: "BLOOM",
    endpoint: "https://api-inference.huggingface.co/models/bigscience/bloom-560m",
    description: "Multilingual text generation",
    maxTokens: 1000,
  },
]

export class FreeAIService {
  private static async callHuggingFace(modelEndpoint: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(modelEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (Array.isArray(result) && result[0]?.generated_text) {
        return result[0].generated_text
      }

      if (result.generated_text) {
        return result.generated_text
      }

      throw new Error("Unexpected response format")
    } catch (error) {
      console.error("Hugging Face API error:", error)
      throw error
    }
  }

  static async generateContent(prompt: string, modelName?: string): Promise<string> {
    const model = FREE_AI_MODELS.find((m) => m.name === modelName) || FREE_AI_MODELS[2] // Default to FLAN-T5

    try {
      // Try primary model
      const content = await this.callHuggingFace(model.endpoint, prompt)
      return this.cleanGeneratedText(content, prompt)
    } catch (error) {
      console.error(`Failed with ${model.name}, trying fallback...`)

      // Try fallback models
      for (const fallbackModel of FREE_AI_MODELS) {
        if (fallbackModel.name !== model.name) {
          try {
            const content = await this.callHuggingFace(fallbackModel.endpoint, prompt)
            return this.cleanGeneratedText(content, prompt)
          } catch (fallbackError) {
            console.error(`Fallback ${fallbackModel.name} also failed:`, fallbackError)
            continue
          }
        }
      }

      // If all models fail, return a helpful fallback
      return this.generateFallbackContent(prompt)
    }
  }

  private static cleanGeneratedText(text: string, originalPrompt: string): string {
    // Remove the original prompt from the response if it's included
    let cleaned = text.replace(originalPrompt, "").trim()

    // Remove common artifacts
    cleaned = cleaned.replace(/^[:\-\s]+/, "") // Remove leading colons, dashes, spaces
    cleaned = cleaned.replace(/\[.*?\]/g, "") // Remove bracketed content
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines

    return cleaned.trim()
  }

  private static generateFallbackContent(prompt: string): string {
    // Extract topic from prompt
    const topicMatch = prompt.match(/title:\s*([^\n]+)/i) || prompt.match(/about:\s*([^\n]+)/i)
    const topic = topicMatch ? topicMatch[1].trim() : "the requested topic"

    return `# ${topic}

## Introduction

${topic} is an important subject that deserves careful consideration. In this comprehensive guide, we'll explore the key aspects and provide valuable insights.

## Key Points

Here are the main points to consider:

• Understanding the fundamentals
• Exploring practical applications  
• Learning best practices
• Implementing effective strategies

## Main Content

When discussing ${topic}, it's essential to consider multiple perspectives and approaches. This topic has gained significant attention due to its relevance and impact.

### Important Considerations

1. **Research and Planning**: Before diving deep, it's crucial to conduct thorough research
2. **Implementation**: Practical steps and actionable advice
3. **Best Practices**: Following proven methodologies
4. **Future Outlook**: Understanding trends and developments

## Conclusion

${topic} continues to evolve and presents both opportunities and challenges. By understanding the core concepts and applying best practices, you can achieve better results.

*Note: This content was generated using a fallback system. For more detailed information, please try again or consult additional resources.*`
  }

  // Alternative: Use a completely local approach
  static generateLocalContent(title: string, description: string): string {
    const templates = [
      {
        category: "technology",
        keywords: ["tech", "software", "digital", "app", "web", "ai", "programming"],
        template: `# ${title}

## Introduction

In today's rapidly evolving technological landscape, ${description.toLowerCase()} has become increasingly important. This comprehensive guide will explore the key aspects and provide practical insights.

## Understanding the Basics

Technology continues to reshape how we work, communicate, and solve problems. The concepts discussed here are fundamental to understanding modern digital solutions.

## Key Benefits

• Improved efficiency and productivity
• Enhanced user experience
• Scalable solutions
• Cost-effective implementation

## Implementation Strategies

When implementing these technologies, consider:

1. **Planning Phase**: Define clear objectives and requirements
2. **Development**: Follow best practices and industry standards  
3. **Testing**: Ensure reliability and performance
4. **Deployment**: Smooth rollout and monitoring

## Best Practices

- Stay updated with latest trends
- Focus on user-centered design
- Prioritize security and privacy
- Maintain clean, documented code

## Conclusion

${title} represents an exciting opportunity to leverage technology for better outcomes. By following the guidelines outlined above, you can successfully implement these solutions.`,
      },
      {
        category: "business",
        keywords: ["business", "marketing", "sales", "strategy", "growth", "finance"],
        template: `# ${title}

## Executive Summary

${description} is a critical aspect of modern business strategy. This article explores proven approaches and actionable insights for success.

## Market Overview

Understanding the current market landscape is essential for making informed decisions. Recent trends show significant opportunities for growth and innovation.

## Strategic Approach

### Core Principles

1. **Customer Focus**: Put customer needs at the center
2. **Data-Driven Decisions**: Use analytics to guide strategy
3. **Agile Implementation**: Adapt quickly to market changes
4. **Continuous Improvement**: Regular evaluation and optimization

### Implementation Framework

- **Assessment**: Analyze current situation
- **Planning**: Develop comprehensive strategy
- **Execution**: Implement with clear milestones
- **Monitoring**: Track progress and adjust as needed

## Key Success Factors

• Strong leadership and vision
• Effective team collaboration
• Clear communication channels
• Robust performance metrics

## Conclusion

Success in ${title.toLowerCase()} requires a combination of strategic thinking, practical execution, and continuous adaptation. By following these principles, organizations can achieve sustainable growth.`,
      },
    ]

    // Determine category based on content
    const content = `${title} ${description}`.toLowerCase()
    let selectedTemplate = templates[0] // Default to technology

    for (const template of templates) {
      if (template.keywords.some((keyword) => content.includes(keyword))) {
        selectedTemplate = template
        break
      }
    }

    return selectedTemplate.template
  }
}
