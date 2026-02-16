"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface YesNoProps {
  value: boolean | null
  onChange: (value: boolean) => void
  yesLabel?: string
  noLabel?: string
  disabled?: boolean
  className?: string
}

/**
 * YesNo - Binary choice for YES_NO questions
 * Two large buttons side by side with Italian labels by default
 */
export function YesNo({
  value,
  onChange,
  yesLabel = "Si",
  noLabel = "No",
  disabled = false,
  className,
}: YesNoProps) {
  return (
    <div className={cn("flex gap-4 w-full", className)}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={cn(
          "flex-1 h-16 text-lg font-medium transition-all",
          value === true && "border-primary bg-primary/10 text-primary ring-2 ring-primary hover:bg-primary/20",
          value === true && "hover:text-primary",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {yesLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={cn(
          "flex-1 h-16 text-lg font-medium transition-all",
          value === false && "border-primary bg-primary/10 text-primary ring-2 ring-primary hover:bg-primary/20",
          value === false && "hover:text-primary",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {noLabel}
      </Button>
    </div>
  )
}
