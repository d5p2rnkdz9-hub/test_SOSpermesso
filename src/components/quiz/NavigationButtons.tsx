"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

export interface NavigationButtonsProps {
  canGoBack: boolean
  canGoNext: boolean
  isLastQuestion: boolean
  isLoading?: boolean
  onBack: () => void
  onNext: () => void
  onComplete: () => void
  className?: string
}

/**
 * NavigationButtons - Back/Next/Complete buttons for quiz navigation
 * Uses brand styling (blue buttons)
 * Shows "Completa" on last question instead of "Avanti"
 */
export function NavigationButtons({
  canGoBack,
  canGoNext,
  isLastQuestion,
  isLoading = false,
  onBack,
  onNext,
  onComplete,
  className,
}: NavigationButtonsProps) {
  return (
    <div className={cn("flex justify-between items-center gap-4 mt-8", className)}>
      {/* Back button */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={!canGoBack || isLoading}
        onClick={onBack}
        className={cn(
          "flex items-center gap-2 px-6",
          !canGoBack && "invisible"
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        Indietro
      </Button>

      {/* Next / Complete button */}
      {isLastQuestion ? (
        <Button
          type="button"
          variant="default"
          size="lg"
          disabled={!canGoNext || isLoading}
          onClick={onComplete}
          className="flex items-center gap-2 px-8"
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Completamento...
            </>
          ) : (
            <>
              Completa
              <CheckCircle className="h-4 w-4" />
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          variant="default"
          size="lg"
          disabled={!canGoNext || isLoading}
          onClick={onNext}
          className="flex items-center gap-2 px-8"
        >
          Avanti
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
