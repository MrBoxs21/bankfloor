"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Wand2,
  Tag,
  Loader2,
  Copy,
  Check,
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  Search,
  Brain,
  Zap,
  PenTool,
} from "lucide-react"
import { toast } from "sonner"

interface AIAssistantProps {
  content?: string
  title?: string
  description?: string
  onSuggestion: (suggestion: string) => void
  onTagSuggestion: (tags: string[]) => void
  onTitleSuggestion: (title: string) => void
}

interface AIResponse {
  content: string
  type: string
  confidence: number
}

export default function AIAssistant({
  content = "",
  title = "",
  description = "",
  onSuggestion,
  onTagSuggestion,
  onTitleSuggestion,
}: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [activePrompt, setActivePrompt] = useState("")
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  // Safe analyze function with proper null checks
  const analyzeContext = (title: string, description: string, content: string) => {
    try {
      const safeTitle = title || ""
      const safeDescription = description || ""
      const safeContent = content || ""

      const combinedText = `${safeTitle} ${safeDescription} ${safeContent}`.toLowerCase()

      // Determine blog category/niche
      const categories = {
        technology: ["tech", "software", "programming", "code", "development", "ai", "digital", "app", "web"],
        business: ["business", "marketing", "sales", "entrepreneur", "startup", "finance", "money", "profit"],
        lifestyle: ["lifestyle", "health", "fitness", "wellness", "food", "travel", "fashion", "home"],
        education: ["learn", "education", "tutorial", "guide", "how to", "tips", "course", "training"],
        personal: ["personal", "story", "experience", "journey", "life", "thoughts", "opinion"],
      }

      let detectedCategory = "general"
      let maxMatches = 0

      for (const [category, keywords] of Object.entries(categories)) {
        const matches = keywords.filter((keyword) => combinedText.includes(keyword)).length
        if (matches > maxMatches) {
          maxMatches = matches
          detectedCategory = category
        }
      }

      // Determine content type
      const contentTypes = {
        tutorial: ["how to", "guide", "step", "tutorial", "learn", "beginner"],
        listicle: ["best", "top", "list", "ways", "tips", "secrets", "reasons"],
        review: ["review", "comparison", "vs", "pros", "cons", "rating"],
        opinion: ["opinion", "thoughts", "believe", "think", "perspective"],
        news: ["news", "update", "latest", "breaking", "announcement"],
      }

      let detectedType = "article"
      maxMatches = 0

      for (const [type, keywords] of Object.entries(contentTypes)) {
        const matches = keywords.filter((keyword) => combinedText.includes(keyword)).length
        if (matches > maxMatches) {
          maxMatches = matches
          detectedType = type
        }
      }

      // Determine target audience
      const audiences = {
        beginners: ["beginner", "start", "basic", "introduction", "first time", "new to"],
        professionals: ["professional", "expert", "advanced", "enterprise", "business"],
        general: ["everyone", "anyone", "people", "users", "readers"],
      }

      let detectedAudience = "general"
      maxMatches = 0

      for (const [audience, keywords] of Object.entries(audiences)) {
        const matches = keywords.filter((keyword) => combinedText.includes(keyword)).length
        if (matches > maxMatches) {
          maxMatches = matches
          detectedAudience = audience
        }
      }

      const cleanContent = safeContent.replace(/<[^>]*>/g, "")
      const wordCount = cleanContent ? cleanContent.split(/\s+/).filter((word) => word.length > 0).length : 0

      return {
        category: detectedCategory,
        contentType: detectedType,
        audience: detectedAudience,
        wordCount: wordCount,
        hasTitle: safeTitle.length > 0,
        hasDescription: safeDescription.length > 0,
        hasContent: safeContent.length > 0,
      }
    } catch (error) {
      console.error("Analysis error:", error)
      return {
        category: "general",
        contentType: "article",
        audience: "general",
        wordCount: 0,
        hasTitle: false,
        hasDescription: false,
        hasContent: false,
      }
    }
  }

  const generateContextualPrompts = (analysis: any) => {
    const basePrompts = {
      introduction: {
        icon: <Target className="h-4 w-4" />,
        label: "Write Introduction",
        description: "Create an engaging opening",
      },
      mainContent: {
        icon: <PenTool className="h-4 w-4" />,
        label: "Develop Content",
        description: "Expand main points",
      },
      conclusion: {
        icon: <TrendingUp className="h-4 w-4" />,
        label: "Write Conclusion",
        description: "Summarize and call-to-action",
      },
      improve: {
        icon: <Wand2 className="h-4 w-4" />,
        label: "Improve Writing",
        description: "Enhance clarity and flow",
      },
      seoOptimize: {
        icon: <Search className="h-4 w-4" />,
        label: "SEO Optimize",
        description: "Improve search ranking",
      },
      engagement: {
        icon: <Users className="h-4 w-4" />,
        label: "Boost Engagement",
        description: "Make more compelling",
      },
    }

    return basePrompts
  }

  const generateIntelligentContent = async (promptType: string) => {
    setIsLoading(true)
    setActivePrompt(promptType)

    try {
      // Analyze the context first
      const analysis = analyzeContext(title, description, content)
      setAnalysisResult(analysis)

      // Create intelligent prompts based on analysis
      const contextualPrompts = {
        introduction: `As a professional ${analysis.category} writer, create an engaging introduction for a blog post titled "${title || "My Blog Post"}". 
        
Context: ${description || "No description provided"}
Target Audience: ${analysis.audience}
Content Type: ${analysis.contentType}

The introduction should:
- Hook the reader immediately
- Clearly state what they'll learn
- Be relevant to ${analysis.category} audience
- Match the ${analysis.contentType} format
- Be approximately 150-200 words

Write a compelling introduction that makes readers want to continue reading.`,

        mainContent: `As an expert ${analysis.category} content writer, develop the main content for this blog post.

Title: ${title || "My Blog Post"}
Description: ${description || "No description provided"}
Current Content: ${content ? content.replace(/<[^>]*>/g, " ").substring(0, 500) + "..." : "No content yet"}

Based on the context, create detailed, valuable content that:
- Provides actionable insights for ${analysis.audience}
- Follows ${analysis.contentType} best practices
- Includes specific examples and practical advice
- Is well-structured with clear sections
- Delivers on the promise made in the title

Write 300-500 words of high-quality content that adds real value.`,

        conclusion: `As a professional copywriter specializing in ${analysis.category}, write a powerful conclusion for this blog post.

Title: ${title || "My Blog Post"}
Main Content Summary: ${content ? content.replace(/<[^>]*>/g, " ").substring(0, 300) + "..." : "No content provided"}

The conclusion should:
- Summarize key takeaways
- Reinforce the main message
- Include a compelling call-to-action
- Encourage reader engagement
- Be appropriate for ${analysis.audience}

Write a conclusion that leaves readers satisfied and motivated to take action.`,

        improve: `As a professional editor and ${analysis.category} content specialist, improve this content:

Current Content: ${content ? content.replace(/<[^>]*>/g, " ") : "No content provided"}

Improvements needed:
- Enhance clarity and readability
- Improve flow and structure
- Make it more engaging for ${analysis.audience}
- Optimize for ${analysis.contentType} format
- Add professional insights
- Ensure value delivery

Provide an improved version that maintains the original message but elevates the quality.`,

        seoOptimize: `As an SEO content specialist for ${analysis.category}, optimize this content:

Title: ${title || "My Blog Post"}
Content: ${content ? content.replace(/<[^>]*>/g, " ") : "No content provided"}

SEO Optimization for ${analysis.category} niche:
- Improve keyword integration naturally
- Enhance structure with proper headings
- Add semantic keywords
- Optimize for user intent
- Improve readability
- Add internal linking opportunities

Provide SEO-optimized content that ranks well while maintaining quality.`,

        engagement: `As a content strategist specializing in ${analysis.category}, make this content more engaging:

Current Content: ${content ? content.replace(/<[^>]*>/g, " ") : "No content provided"}
Target: ${analysis.audience}

Enhancement strategies:
- Add compelling storytelling elements
- Include relatable examples
- Create emotional connection
- Add interactive elements
- Improve readability
- Make it more actionable

Rewrite to maximize engagement while maintaining professionalism.`,
      }

      // Make the actual API call to Gemini
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contextualPrompts[promptType as keyof typeof contextualPrompts],
          type: promptType,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      const newResponse: AIResponse = {
        content: data.suggestion,
        type: promptType,
        confidence: 0.95, // High confidence since it's from the real API
      }

      setAiResponses((prev) => [newResponse, ...prev.slice(0, 4)])
      toast.success(`${promptType.charAt(0).toUpperCase() + promptType.slice(1)} content generated!`)
    } catch (error) {
      console.error("AI Error:", error)
      toast.error("Failed to generate content. Please try again.")
    } finally {
      setIsLoading(false)
      setActivePrompt("")
    }
  }

  const generateSmartTags = async () => {
    if (!title && !description && !content) {
      toast.error("Please add a title, description, or content first")
      return
    }

    setIsLoading(true)
    try {
      const analysis = analyzeContext(title, description, content)

      // Make the actual API call to Gemini for tag generation
      const response = await fetch("/api/ai/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `
Title: ${title || "No title"}
Description: ${description || "No description"}
Content: ${content ? content.replace(/<[^>]*>/g, " ").substring(0, 1000) : "No content"}
Category: ${analysis.category}
Content Type: ${analysis.contentType}
`,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setSuggestedTags(data.tags)
      toast.success("Smart tags generated!")
    } catch (error) {
      console.error("Tag Generation Error:", error)
      toast.error("Failed to generate tags")
    } finally {
      setIsLoading(false)
    }
  }

  const generateSmartTitles = async () => {
    if (!description && !content && !title) {
      toast.error("Please add some content first")
      return
    }

    setIsLoading(true)
    try {
      const analysis = analyzeContext(title, description, content)

      // Make the actual API call to Gemini for title generation
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `As a professional blog title writer, generate 5 compelling title options for a ${analysis.category} blog post.
          
Content summary: ${content ? content.replace(/<[^>]*>/g, " ").substring(0, 500) : description || "No content"}

The titles should:
- Be attention-grabbing and clickable
- Include keywords for SEO
- Be appropriate for ${analysis.audience} audience
- Match the ${analysis.contentType} format
- Be between 40-60 characters
- Use power words and emotional triggers

Format the response as a numbered list of 5 titles.`,
          type: "titles",
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Parse the numbered list into an array of titles
      const titleText = data.suggestion
      const titleMatches = titleText.match(/\d+\.\s+(.*?)(?=\n\d+\.|\n\n|$)/gs)

      const parsedTitles = titleMatches
        ? titleMatches.map((match) => match.replace(/^\d+\.\s+/, "").trim())
        : titleText
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .slice(0, 5)

      setSuggestedTitles(parsedTitles)
      toast.success("Smart titles generated!")
    } catch (error) {
      console.error("Title Generation Error:", error)
      toast.error("Failed to generate titles")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
      toast.success("Copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const applyContent = (content: string) => {
    onSuggestion(content)
    toast.success("Content applied!")
  }

  const applyTags = () => {
    onTagSuggestion(suggestedTags)
    setSuggestedTags([])
    toast.success("Tags applied!")
  }

  const applyTitle = (title: string) => {
    onTitleSuggestion(title)
    toast.success("Title applied!")
  }

  // Generate contextual prompts
  const analysis = analyzeContext(title, description, content)
  const contextualPrompts = generateContextualPrompts(analysis)

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-4 w-4 mr-2 text-purple-600" />
            Smart AI Assistant
          </div>
          {analysis && (
            <Badge variant="outline" className="text-xs">
              {analysis.category} • {analysis.contentType}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-xs">
            <TabsTrigger value="content">Smart Content</TabsTrigger>
            <TabsTrigger value="titles">Titles</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-3 mt-3">
            {/* Context Analysis Display */}
            {analysis && (
              <div className="p-2 bg-muted/50 rounded-lg text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3 w-3 text-purple-600" />
                  <span className="font-medium">AI Analysis:</span>
                </div>
                <div className="text-muted-foreground">
                  Category: {analysis.category} • Type: {analysis.contentType} • Audience: {analysis.audience}
                </div>
              </div>
            )}

            {/* Smart Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(contextualPrompts).map(([key, prompt]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => generateIntelligentContent(key)}
                  disabled={isLoading}
                  className={`text-xs flex items-center gap-1 ${
                    activePrompt === key ? "bg-purple-100 dark:bg-purple-900" : ""
                  }`}
                  title={prompt.description}
                >
                  {prompt.icon}
                  {prompt.label}
                </Button>
              ))}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                <span className="ml-2 text-xs text-muted-foreground">Generating with Gemini AI...</span>
              </div>
            )}

            {/* AI Responses */}
            {aiResponses.length > 0 && (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {aiResponses.map((response, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-white/50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {response.type} • {Math.round(response.confidence * 100)}% confidence
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => applyContent(response.content)}
                            size="sm"
                            variant="outline"
                            className="text-xs h-6"
                          >
                            Apply
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(response.content, `response-${index}`)}
                            size="sm"
                            variant="outline"
                            className="text-xs h-6"
                          >
                            {copied === `response-${index}` ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-4">
                        {response.content.substring(0, 200)}...
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="titles" className="space-y-3 mt-3">
            <Button onClick={generateSmartTitles} disabled={isLoading} size="sm" className="w-full text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              {isLoading ? "Generating..." : "Generate Smart Titles"}
            </Button>

            {suggestedTitles.length > 0 && (
              <div className="space-y-2">
                {suggestedTitles.map((title, index) => (
                  <div key={index} className="p-2 border rounded-lg hover:bg-muted/50 cursor-pointer text-xs group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1" onClick={() => applyTitle(title)}>
                        {title}
                      </div>
                      <Button
                        onClick={() => copyToClipboard(title, `title-${index}`)}
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      >
                        {copied === `title-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tags" className="space-y-3 mt-3">
            <Button onClick={generateSmartTags} disabled={isLoading} size="sm" className="w-full text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {isLoading ? "Generating..." : "Generate Smart Tags"}
            </Button>

            {suggestedTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {suggestedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-purple-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button onClick={applyTags} size="sm" className="w-full text-xs">
                  Apply All Tags
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
