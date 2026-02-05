"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  className?: string
}

/**
 * TextInput - Open text input for TEXT questions
 * Textarea with character count and Italian placeholder
 */
export function TextInput({
  value,
  onChange,
  placeholder = "Scrivi la tua risposta qui...",
  maxLength = 1000,
  disabled = false,
  className,
}: TextInputProps) {
  const characterCount = value.length
  const isNearLimit = maxLength && characterCount > maxLength * 0.9
  const isAtLimit = maxLength && characterCount >= maxLength

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        value={value}
        onChange={(e) => {
          if (maxLength && e.target.value.length > maxLength) {
            return
          }
          onChange(e.target.value)
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={5}
        className={cn(
          "resize-none text-base leading-relaxed",
          "focus:border-brand-blue focus:ring-brand-blue",
          disabled && "cursor-not-allowed opacity-50"
        )}
      />
      {maxLength && (
        <div
          className={cn(
            "text-sm text-right",
            isAtLimit && "text-destructive font-medium",
            isNearLimit && !isAtLimit && "text-amber-600",
            !isNearLimit && "text-muted-foreground"
          )}
        >
          {characterCount} / {maxLength} caratteri
        </div>
      )}
    </div>
  )
}
