"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface ProgressBarProps {
  current: number
  total: number
  showPercentage?: boolean
  className?: string
}

/**
 * ProgressBar - Progress indicator for quiz completion
 * Shows percentage only (no "Question 3 of 10" per CONTEXT.md)
 * Uses brand-green fill with smooth animation
 */
export function ProgressBar({
  current,
  total,
  showPercentage = true,
  className,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Progress
        value={percentage}
        className="h-2 bg-muted [&>div]:bg-brand-green [&>div]:transition-all [&>div]:duration-500"
      />
      {showPercentage && (
        <div className="text-sm text-muted-foreground text-right">
          {percentage}%
        </div>
      )}
    </div>
  )
}
