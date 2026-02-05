"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Question } from "@/types/quiz"
import { cn } from "@/lib/utils"

export interface QuestionCardProps {
  question: Question
  children: React.ReactNode
  questionNumber?: number
  className?: string
}

/**
 * QuestionCard - Wrapper component for all question types
 * Provides consistent styling with conversational feel (not test-like)
 */
export function QuestionCard({
  question,
  children,
  questionNumber,
  className,
}: QuestionCardProps) {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="space-y-3 pb-4">
        {questionNumber !== undefined && (
          <span className="text-sm text-muted-foreground">
            {questionNumber}
          </span>
        )}
        <h2 className="text-xl font-semibold text-foreground leading-relaxed">
          {question.text}
        </h2>
        {question.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {question.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  )
}
