"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

export interface FeedbackDisplayProps {
  feedback: string
  className?: string
}

/**
 * FeedbackDisplay - Renders AI-generated personalized feedback
 * With nice typography and brand styling
 */
export function FeedbackDisplay({ feedback, className }: FeedbackDisplayProps) {
  // Split feedback into paragraphs for better rendering
  const paragraphs = feedback.split("\n\n").filter(Boolean)

  return (
    <Card
      className={cn(
        "border-2 border-brand-blue/20 bg-gradient-to-br from-white to-brand-blue/5",
        className
      )}
    >
      <CardContent className="pt-6">
        {/* Header with AI indicator */}
        <div className="flex items-center gap-2 mb-4 text-brand-blue">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">Feedback personalizzato</span>
        </div>

        {/* Feedback content */}
        <div className="space-y-4 text-gray-700 leading-relaxed">
          {paragraphs.map((paragraph, index) => {
            // Check if paragraph looks like a heading (starts with ** or is short)
            const isHeading =
              paragraph.startsWith("**") || (paragraph.length < 60 && !paragraph.includes("."))

            if (isHeading) {
              // Remove markdown bold markers if present
              const cleanText = paragraph.replace(/\*\*/g, "")
              return (
                <h3
                  key={index}
                  className="font-semibold text-brand-blue text-lg mt-4"
                >
                  {cleanText}
                </h3>
              )
            }

            // Handle bullet points
            if (paragraph.includes("\n-") || paragraph.startsWith("-")) {
              const items = paragraph.split("\n").filter(Boolean)
              return (
                <ul key={index} className="list-disc list-inside space-y-1 ml-2">
                  {items.map((item, i) => (
                    <li key={i} className="text-gray-600">
                      {item.replace(/^-\s*/, "")}
                    </li>
                  ))}
                </ul>
              )
            }

            // Regular paragraph
            return (
              <p key={index} className="text-gray-600">
                {paragraph}
              </p>
            )
          })}
        </div>

        {/* Optional download placeholder */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Generato con AI per personalizzare la tua esperienza formativa
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
