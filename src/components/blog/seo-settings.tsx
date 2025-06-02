"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Globe, X, Plus } from "lucide-react"

interface SEOData {
  metaTitle: string
  metaDescription: string
  canonicalUrl: string
  keywords: string[]
}

interface SEOSettingsProps {
  seoData: SEOData
  onChange: (seoData: SEOData) => void
  title: string
  content: string
}

export default function SEOSettings({ seoData, onChange, title, content }: SEOSettingsProps) {
  const [newKeyword, setNewKeyword] = useState("")

  // Auto-generate meta title from blog title
  useEffect(() => {
    if (title && !seoData.metaTitle) {
      onChange({
        ...seoData,
        metaTitle: title,
      })
    }
  }, [title, seoData, onChange])

  // Auto-generate meta description from content
  useEffect(() => {
    if (content && !seoData.metaDescription) {
      const plainText = content.replace(/<[^>]*>/g, "").substring(0, 150)
      onChange({
        ...seoData,
        metaDescription: plainText + (plainText.length >= 150 ? "..." : ""),
      })
    }
  }, [content, seoData, onChange])

  const addKeyword = () => {
    if (newKeyword.trim() && !seoData.keywords.includes(newKeyword.trim())) {
      onChange({
        ...seoData,
        keywords: [...seoData.keywords, newKeyword.trim()],
      })
      setNewKeyword("")
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    onChange({
      ...seoData,
      keywords: seoData.keywords.filter((keyword) => keyword !== keywordToRemove),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Search className="h-5 w-5 mr-2 text-green-600" />
          SEO Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Meta Title</Label>
          <Input
            value={seoData.metaTitle}
            onChange={(e) => onChange({ ...seoData, metaTitle: e.target.value })}
            placeholder="SEO optimized title..."
            maxLength={60}
          />
          <div className="text-xs text-muted-foreground mt-1">{seoData.metaTitle.length}/60 characters</div>
        </div>

        <div>
          <Label className="text-sm font-medium">Meta Description</Label>
          <Textarea
            value={seoData.metaDescription}
            onChange={(e) => onChange({ ...seoData, metaDescription: e.target.value })}
            placeholder="Brief description for search engines..."
            className="min-h-[80px]"
            maxLength={160}
          />
          <div className="text-xs text-muted-foreground mt-1">{seoData.metaDescription.length}/160 characters</div>
        </div>

        <div>
          <Label className="text-sm font-medium">Canonical URL</Label>
          <Input
            value={seoData.canonicalUrl}
            onChange={(e) => onChange({ ...seoData, canonicalUrl: e.target.value })}
            placeholder="https://yourdomain.com/blog/post-slug"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Keywords</Label>
          <div className="flex space-x-2">
            <Input
              placeholder="Add keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={addKeyword} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {seoData.keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(keyword)} />
              </Badge>
            ))}
          </div>
        </div>

        {/* SEO Preview */}
        <div className="mt-6 p-4 border rounded-lg bg-muted/30">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            Search Engine Preview
          </h4>
          <div className="space-y-1">
            <div className="text-blue-600 text-lg font-medium line-clamp-1">
              {seoData.metaTitle || title || "Your Blog Title"}
            </div>
            <div className="text-green-700 text-sm">
              {seoData.canonicalUrl || "https://yourdomain.com/blog/post-slug"}
            </div>
            <div className="text-gray-600 text-sm line-clamp-2">
              {seoData.metaDescription || "Your meta description will appear here..."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
