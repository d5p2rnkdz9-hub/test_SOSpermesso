"use client"

import * as React from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { QuestionOption } from "@/types/quiz"
import { cn } from "@/lib/utils"

export interface SingleChoiceProps {
  options: QuestionOption[]
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

/**
 * SingleChoice - Radio button selection for SINGLE_CHOICE questions
 * Card-style clickable options with brand-green highlight when selected
 */
export function SingleChoice({
  options,
  value,
  onChange,
  disabled = false,
  className,
}: SingleChoiceProps) {
  return (
    <RadioGroup
      value={value ?? undefined}
      onValueChange={onChange}
      disabled={disabled}
      className={cn("flex flex-col gap-3", className)}
    >
      {options.map((option) => {
        const isSelected = value === option.id
        return (
          <div
            key={option.id}
            className={cn(
              "flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all",
              "hover:border-brand-blue/50 hover:bg-accent/50",
              isSelected && "border-brand-green bg-brand-green/5 ring-1 ring-brand-green",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={() => !disabled && onChange(option.id)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !disabled) {
                e.preventDefault()
                onChange(option.id)
              }
            }}
          >
            <RadioGroupItem
              value={option.id}
              id={`option-${option.id}`}
              className={cn(
                "shrink-0 pointer-events-none",
                isSelected && "border-brand-green text-brand-green"
              )}
            />
            <Label
              htmlFor={`option-${option.id}`}
              className={cn(
                "flex-1 cursor-pointer text-base leading-relaxed",
                disabled && "cursor-not-allowed"
              )}
            >
              {option.label}
              {option.description && (
                <span className="block text-sm text-muted-foreground mt-1">
                  {option.description}
                </span>
              )}
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}
