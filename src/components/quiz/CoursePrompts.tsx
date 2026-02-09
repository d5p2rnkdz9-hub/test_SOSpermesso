"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Lightbulb } from "lucide-react"
import type { CoursePrompt } from "@/types/quiz"

export interface CoursePromptsProps {
  prompts: CoursePrompt[]
  className?: string
}

/**
 * CoursePrompts - Displays actionable course prompts for participants
 * Only renders when prompts are available
 */
export function CoursePrompts({ prompts, className }: CoursePromptsProps) {
  // Don't render if no prompts
  if (!prompts || prompts.length === 0) {
    return null
  }

  return (
    <Card
      className={cn(
        "border-2 border-amber-500/30 bg-gradient-to-br from-white to-amber-50/50",
        className
      )}
    >
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Suggerimenti per il corso
          </h3>
        </div>

        {/* Prompts list */}
        <div className="space-y-3">
          {prompts.map((prompt, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200/50"
            >
              <div className="mt-0.5 flex-shrink-0">
                <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{prompt.text}</p>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-4 pt-3 border-t border-amber-100">
          <p className="text-xs text-amber-700/70 text-center">
            Questi suggerimenti sono personalizzati in base alle tue risposte
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
