"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { QuestionOption } from "@/types/quiz"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface ProfileSelectProps {
  profiles: QuestionOption[]
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

/**
 * ProfileSelect - Large profile cards for PROFILE_SELECT questions
 * Used for Q3: tech proficiency self-assessment
 * Shows full profile description with clear selection indicator
 */
export function ProfileSelect({
  profiles,
  value,
  onChange,
  disabled = false,
  className,
}: ProfileSelectProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {profiles.map((profile) => {
        const isSelected = value === profile.id
        return (
          <Card
            key={profile.id}
            className={cn(
              "relative cursor-pointer transition-all",
              "hover:border-brand-blue/50 hover:shadow-md",
              isSelected && "border-brand-green ring-2 ring-brand-green shadow-md",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={() => !disabled && onChange(profile.id)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !disabled) {
                e.preventDefault()
                onChange(profile.id)
              }
            }}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2 pr-8">{profile.label}</h3>
              {profile.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {profile.description}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
