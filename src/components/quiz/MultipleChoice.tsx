"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { QuestionOption } from "@/types/quiz"
import { cn } from "@/lib/utils"

export interface MultipleChoiceProps {
  options: QuestionOption[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  className?: string
}

/**
 * MultipleChoice - Checkbox selection for MULTIPLE_CHOICE questions
 * Card-style clickable options with primary highlight when selected
 */
export function MultipleChoice({
  options,
  value,
  onChange,
  disabled = false,
  className,
}: MultipleChoiceProps) {
  const handleToggle = (optionId: string) => {
    if (disabled) return

    const option = options.find((o) => o.id === optionId)
    const noneOption = options.find((o) => o.value === "none")

    if (option?.value === "none") {
      // Clicking "none" option: toggle it exclusively (deselect all others)
      if (value.includes(optionId)) {
        onChange(value.filter((id) => id !== optionId))
      } else {
        onChange([optionId])
      }
    } else {
      // Clicking a regular option: remove "none" if present
      let newValues = noneOption ? value.filter((id) => id !== noneOption.id) : [...value]
      if (newValues.includes(optionId)) {
        newValues = newValues.filter((id) => id !== optionId)
      } else {
        newValues = [...newValues, optionId]
      }
      onChange(newValues)
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {options.map((option) => {
        const isSelected = value.includes(option.id)
        return (
          <div
            key={option.id}
            className={cn(
              "flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all",
              "hover:border-primary/50 hover:bg-accent/50",
              isSelected && "border-primary bg-primary/5 ring-1 ring-primary",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={() => handleToggle(option.id)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !disabled) {
                e.preventDefault()
                handleToggle(option.id)
              }
            }}
          >
            <Checkbox
              id={`checkbox-${option.id}`}
              checked={isSelected}
              disabled={disabled}
              className={cn(
                "shrink-0 pointer-events-none",
                isSelected && "border-primary bg-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              )}
            />
            <Label
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
    </div>
  )
}
