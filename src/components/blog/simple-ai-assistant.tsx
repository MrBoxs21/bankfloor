"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, Copy, Check, Sparkles, Zap, Globe } from "lucide-react"
import { toast } from "sonner"

interface SimpleAIAssistantProps {
  onContentGenerated: (content: string) => void
}

export default function SimpleAIAssistant({ onContentGenerated }: SimpleAIAssistantProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generationMethod, setGenerationMethod] = useState<string>("")

  const generateContent = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please enter both title and description")
      return
    }

    setIsLoading(true)
    setGenerationMethod("")

    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content")
      }

      if (!data.content || data.content.trim().length === 0) {
        throw new Error("Generated content is empty. Please try again.")
      }

      setGeneratedContent(data.content)
      setGenerationMethod(data.method || "AI Generated")
      toast.success("Content generated successfully!")
    } catch (error) {
      console.error("Content generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate content"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Content copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy content")
    }
  }

  const useContent = () => {
    onContentGenerated(generatedContent)
    toast.success("Content added to editor!")
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Free AI Content Assistant
          </div>
          <Badge variant="secondary" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            No API Key Required
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate content using free AI models from Hugging Face and local templates
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Models Info */}
        <div className="text-xs bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3 w-3 text-blue-600" />
            <span className="font-medium">Free AI Models Used:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <span>• Google FLAN-T5</span>
            <span>• Microsoft DialoGPT</span>
            <span>• GPT-2</span>
            <span>• Local Templates</span>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="ai-title" className="text-sm font-medium">
              Blog Title
            </Label>
            <Input
              id="ai-title"
              placeholder="Enter your blog title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="ai-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="ai-description"
              placeholder="Describe what you want to write about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[80px]"
            />
          </div>

          <Button
            onClick={generateContent}
            disabled={isLoading || !title.trim() || !description.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating with Free AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content (100% Free)
              </>
            )}
          </Button>
        </div>

        {/* Generated Content Section */}
        {generatedContent && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Generated Content</Label>
                {generationMethod && (
                  <Badge variant="outline" className="text-xs">
                    {generationMethod}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} size="sm" variant="outline">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button onClick={useContent} size="sm">
                  Use Content
                </Button>
              </div>
            </div>

            <ScrollArea className="h-64 w-full rounded-md border p-3 bg-white/50 dark:bg-slate-800/50">
              <div className="text-sm whitespace-pre-wrap">{generatedContent}</div>
            </ScrollArea>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Uses free Hugging Face AI models (no API key needed)</li>
            <li>Falls back to intelligent local templates if AI is unavailable</li>
            <li>Generates comprehensive, structured content</li>
            <li>Works 100% offline as backup</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
