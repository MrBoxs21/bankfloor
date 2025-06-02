"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { createLowlight } from "lowlight"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  LinkIcon,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Highlighter,
  Link2Off,
} from "lucide-react"

// Create lowlight instance
const lowlight = createLowlight()

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [mode, setMode] = useState<"wysiwyg" | "markdown">("wysiwyg")
  const [markdownContent, setMarkdownContent] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [showLinkDialog, setShowLinkDialog] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "tiptap-heading",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "tiptap-paragraph",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your amazing blog post...",
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline cursor-pointer",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "highlight",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto",
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none min-h-[400px] p-6 prose prose-lg max-w-none dark:prose-invert",
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value)
    const htmlContent = value
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(/\n/gim, "<br>")
    onChange(htmlContent)
  }

  const addLink = () => {
    if (linkUrl && linkText) {
      editor
        ?.chain()
        .focus()
        .insertContent(
          `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${linkText}</a>`,
        )
        .run()
      setLinkUrl("")
      setLinkText("")
      setShowLinkDialog(false)
    }
  }

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run()
  }

  const addImage = () => {
    const url = window.prompt("Image URL")
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }

  const colors = [
    "#000000",
    "#374151",
    "#6B7280",
    "#9CA3AF",
    "#D1D5DB",
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#F43F5E",
    "#06B6D4",
    "#84CC16",
  ]

  if (!editor && mode === "wysiwyg") {
    return <div className="p-6">Loading editor...</div>
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      {/* Custom CSS for proper heading sizes */}
      <style jsx global>{`
        .tiptap-editor h1 {
          font-size: 2.25rem !important;
          font-weight: 700 !important;
          line-height: 2.5rem !important;
          margin: 1.5rem 0 1rem 0 !important;
          color: inherit !important;
        }
        .tiptap-editor h2 {
          font-size: 1.875rem !important;
          font-weight: 600 !important;
          line-height: 2.25rem !important;
          margin: 1.25rem 0 0.75rem 0 !important;
          color: inherit !important;
        }
        .tiptap-editor h3 {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          line-height: 2rem !important;
          margin: 1rem 0 0.5rem 0 !important;
          color: inherit !important;
        }
        .tiptap-editor p {
          margin: 0.75rem 0 !important;
          line-height: 1.75 !important;
        }
        .tiptap-editor ul, .tiptap-editor ol {
          margin: 1rem 0 !important;
          padding-left: 1.5rem !important;
        }
        .tiptap-editor blockquote {
          border-left: 4px solid #e5e7eb !important;
          padding-left: 1rem !important;
          margin: 1rem 0 !important;
          font-style: italic !important;
          color: #6b7280 !important;
        }
        .tiptap-editor code {
          background-color: #f3f4f6 !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important;
        }
        .highlight {
          background-color: #fef08a !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
        }
      `}</style>

      <Tabs value={mode} onValueChange={(value: any) => setMode(value)} className="w-full">
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="wysiwyg">Visual</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="wysiwyg" className="m-0">
          {/* Enhanced Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-muted/20">
            {/* Headings */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor?.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor?.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor?.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Text Formatting */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive("bold") ? "bg-muted" : ""}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={editor?.isActive("italic") ? "bg-muted" : ""}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={editor?.isActive("underline") ? "bg-muted" : ""}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                className={editor?.isActive("strike") ? "bg-muted" : ""}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Colors */}
            <div className="flex items-center gap-1 mr-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" title="Text Color">
                    <Palette className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                        onClick={() => editor?.chain().focus().setColor(color).run()}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => editor?.chain().focus().unsetColor().run()}
                  >
                    Remove Color
                  </Button>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" title="Highlight">
                    <Highlighter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                        onClick={() => editor?.chain().focus().setHighlight({ color }).run()}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => editor?.chain().focus().unsetHighlight().run()}
                  >
                    Remove Highlight
                  </Button>
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Lists and Quotes */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={editor?.isActive("bulletList") ? "bg-muted" : ""}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={editor?.isActive("orderedList") ? "bg-muted" : ""}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={editor?.isActive("blockquote") ? "bg-muted" : ""}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Alignment */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                className={editor?.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                className={editor?.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                className={editor?.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Media and Links */}
            <div className="flex items-center gap-1">
              <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={editor?.isActive("link") ? "bg-muted" : ""}
                    title="Add Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="link-text">Link Text</Label>
                      <Input
                        id="link-text"
                        placeholder="Enter link text"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="link-url">URL</Label>
                      <Input
                        id="link-url"
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addLink} size="sm" className="flex-1">
                        Add Link
                      </Button>
                      <Button onClick={removeLink} variant="outline" size="sm">
                        <Link2Off className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="sm" onClick={addImage} title="Add Image">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={editor?.isActive("codeBlock") ? "bg-muted" : ""}
                title="Code Block"
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Editor */}
          <EditorContent editor={editor} />

          {/* Bubble Menu */}
          {editor && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="bg-white dark:bg-slate-800 shadow-lg rounded-md p-1 flex items-center gap-1 border"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "bg-muted" : ""}
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "bg-muted" : ""}
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive("underline") ? "bg-muted" : ""}
              >
                <UnderlineIcon className="h-3 w-3" />
              </Button>
            </BubbleMenu>
          )}

          {/* Floating Menu */}
          {editor && (
            <FloatingMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="bg-white dark:bg-slate-800 shadow-lg rounded-md p-1 flex items-center gap-1 border"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List className="h-3 w-3" />
              </Button>
            </FloatingMenu>
          )}
        </TabsContent>

        <TabsContent value="markdown" className="m-0">
          <Textarea
            value={markdownContent}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            placeholder="Write your content in Markdown..."
            className="min-h-[500px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
