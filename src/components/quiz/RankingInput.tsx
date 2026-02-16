"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { QuestionOption } from "@/types/quiz"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface RankingInputProps {
  options: QuestionOption[]
  value: string[]
  onChange: (value: string[]) => void
  maxSelections?: number
  disabled?: boolean
  className?: string
}

/**
 * RankingInput - Click-to-rank for RANKING questions
 * Used for Q6: rank top 3 AI use cases
 * Click to add to ranking, click X to remove
 * No drag-drop for simplicity
 */
export function RankingInput({
  options,
  value,
  onChange,
  maxSelections = 3,
  disabled = false,
  className,
}: RankingInputProps) {
  const handleAdd = (optionId: string) => {
    if (disabled) return
    if (value.includes(optionId)) return
    if (value.length >= maxSelections) return
    onChange([...value, optionId])
  }

  const handleRemove = (optionId: string) => {
    if (disabled) return
    onChange(value.filter((id) => id !== optionId))
  }

  // Get option by ID
  const getOption = (id: string) => options.find((o) => o.id === id)

  // Get unselected options
  const unselectedOptions = options.filter((o) => !value.includes(o.id))

  return (
    <div className={cn("space-y-6", className)}>
      {/* Selected items - ranked list */}
      {value.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            La tua classifica ({value.length}/{maxSelections}):
          </h4>
          <div className="flex flex-col gap-2">
            {value.map((optionId, index) => {
              const option = getOption(optionId)
              if (!option) return null
              return (
                <Card
                  key={optionId}
                  className={cn(
                    "border-primary bg-primary/5",
                    disabled && "opacity-50"
                  )}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-base">{option.label}</span>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(optionId)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Rimuovi ${option.label}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Available options */}
      {unselectedOptions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            {value.length < maxSelections
              ? `Clicca per aggiungere${value.length > 0 ? " (fino a " + maxSelections + ")" : ""}:`
              : "Altre opzioni:"}
          </h4>
          <div className="flex flex-col gap-2">
            {unselectedOptions.map((option) => {
              const canAdd = value.length < maxSelections
              return (
                <Card
                  key={option.id}
                  className={cn(
                    "transition-all",
                    canAdd && "cursor-pointer hover:border-primary/50 hover:bg-accent/50",
                    !canAdd && "opacity-50",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => canAdd && handleAdd(option.id)}
                  role={canAdd ? "button" : undefined}
                  tabIndex={canAdd && !disabled ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && canAdd && !disabled) {
                      e.preventDefault()
                      handleAdd(option.id)
                    }
                  }}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground/50 shrink-0">
                      +
                    </span>
                    <span className="flex-1 text-base">{option.label}</span>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
