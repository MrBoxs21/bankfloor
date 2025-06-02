"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
          <p className="text-muted-foreground mb-6">
            {error.message || "Failed to load the blog post. Please try again."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/blogs">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
