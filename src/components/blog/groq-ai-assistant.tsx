"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Copy,
  Check,
  Sparkles,
  Zap,
  TrendingUp,
  Lightbulb,
  Tag,
  FileText,
  Wand2,
  Brain,
  Clock,
} from "lucide-react"
import { toast } from "sonner"

interface GroqAIAssistantProps {
  onContentGenerated: (content: string) => void
  onTagsGenerated: (tags: string[]) => void
  onTitleGenerated: (title: string) => void
  currentContent?: string
  currentTitle?: string
}

export default function GroqAIAssistant({
  onContentGenerated,
  onTagsGenerated,
  onTitleGenerated,
  currentContent = "",
  currentTitle = "",
}: GroqAIAssistantProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [generatedTags, setGeneratedTags] = useState<string[]>([])
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")
  const [copied, setCopied] = useState<string | null>(null)
  const [generationTime, setGenerationTime] = useState<number | null>(null)

  const generateContent = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please enter both title and description")
      return
    }

    setIsLoading(true)
    const startTime = Date.now()

    try {
      const response = await fetch("/api/ai/groq/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const endTime = Date.now()
      setGenerationTime(endTime - startTime)
      setGeneratedContent(data.content)
      toast.success(`Content generated in ${((endTime - startTime) / 1000).toFixed(1)}s!`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate content")
    } finally {
      setIsLoading(false)
    }
  }

  const generateTags = async () => {
    const content = currentContent || generatedContent
    if (!content) {
      toast.error("Please add some content first")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/groq/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setGeneratedTags(data.tags)
      toast.success("Tags generated with Groq AI!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate tags")
    } finally {
      setIsLoading(false)
    }
  }

  const generateTitles = async () => {
    if (!description.trim()) {
      toast.error("Please enter a description first")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/groq/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setGeneratedTitles(data.titles)
      toast.success("Titles generated with Groq AI!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate titles")
    } finally {
      setIsLoading(false)
    }
  }

  const improveContent = async () => {
    const content = currentContent || generatedContent
    if (!content) {
      toast.error("Please add some content first")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/groq/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setGeneratedContent(data.content)
      toast.success("Content improved with Groq AI!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to improve content")
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
      toast.error("Failed to copy")
    }
  }

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg mr-3">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold">Groq AI Assistant</div>
              <div className="text-sm opacity-90 font-normal">Lightning-fast content generation</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Zap className="h-3 w-3 mr-1" />
              Ultra Fast
            </Badge>
            {generationTime && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Clock className="h-3 w-3 mr-1" />
                {(generationTime / 1000).toFixed(1)}s
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/50 dark:bg-slate-800/50">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="improve" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Improve
            </TabsTrigger>
            <TabsTrigger value="titles" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Titles
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="groq-title" className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Blog Title
                </Label>
                <Input
                  id="groq-title"
                  placeholder="Enter your compelling blog title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-2 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groq-description" className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Description & Context
                </Label>
                <Textarea
                  id="groq-description"
                  placeholder="Describe what you want to write about, your target audience, and key points to cover..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] border-2 focus:border-purple-500 transition-colors"
                />
              </div>

              <Button
                onClick={generateContent}
                disabled={isLoading || !title.trim() || !description.trim()}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating with Groq AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Professional Content
                  </>
                )}
              </Button>
            </div>

            {generatedContent && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Generated Content
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(generatedContent, "content")}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {copied === "content" ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => onContentGenerated(generatedContent)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Use Content
                    </Button>
                  </div>
                </div>

                <Card className="border-2 border-green-200 bg-green-50/50 dark:bg-green-950/20">
                  <CardContent className="p-4">
                    <ScrollArea className="h-64 w-full">
                      <div
                        className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: generatedContent }}
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="improve" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg border-2 border-orange-200">
                <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Enhance Your Content</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Improve existing content with advanced AI analysis and enhancement
                </p>
              </div>

              <Button
                onClick={improveContent}
                disabled={isLoading || (!currentContent && !generatedContent)}
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Enhancing Content...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Improve Current Content
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="titles" className="space-y-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border-2 border-yellow-200">
                <Lightbulb className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Generate compelling, SEO-optimized titles for your content
                </p>
              </div>

              <Button
                onClick={generateTitles}
                disabled={isLoading || !description.trim()}
                className="w-full h-12 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Titles...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Generate Title Ideas
                  </>
                )}
              </Button>
            </div>

            {generatedTitles.length > 0 && (
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Generated Titles</Label>
                {generatedTitles.map((title, index) => (
                  <Card
                    key={index}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-yellow-300"
                    onClick={() => onTitleGenerated(title)}
                  >
                    <div className="flex items-center justify-between group">
                      <span className="flex-1 font-medium text-sm">{title}</span>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(title, `title-${index}`)
                        }}
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copied === `title-${index}` ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tags" className="space-y-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 rounded-lg border-2 border-green-200">
                <Tag className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Extract relevant SEO tags from your content automatically
                </p>
              </div>

              <Button
                onClick={generateTags}
                disabled={isLoading || (!currentContent && !generatedContent)}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Tag className="h-5 w-5 mr-2" />
                    Generate SEO Tags
                  </>
                )}
              </Button>
            </div>

            {generatedTags.length > 0 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Generated Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {generatedTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      onClick={() => copyToClipboard(tag, `tag-${index}`)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={() => onTagsGenerated(generatedTags)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Tag className="h-4 w-4 mr-2" />
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
