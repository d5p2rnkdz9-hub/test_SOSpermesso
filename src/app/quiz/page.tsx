"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { QuizPlayer } from "@/components/quiz"
import { useQuiz } from "@/hooks/useQuiz"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const DEFAULT_SURVEY_ID = "ai-screening-v1"

/**
 * Quiz Page - Entry point for quiz
 * Handles session initialization and resumption
 * Shows completion screen when quiz is done
 */
export default function QuizPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [initialized, setInitialized] = useState(false)

  const {
    sessionId,
    resumeToken,
    isLoading,
    isComplete,
    error,
    initSession,
    resumeSession,
    reset,
  } = useQuiz()

  // Initialize or resume session on mount
  useEffect(() => {
    if (initialized) return

    const init = async () => {
      // Check for resume token in URL
      const urlToken = searchParams.get("token")

      // Check for resume token in localStorage (from previous session)
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("quiz-session")
          : null
      let parsedStoredToken: string | null = null

      if (storedToken) {
        try {
          const parsed = JSON.parse(storedToken)
          parsedStoredToken = parsed?.state?.resumeToken || null
        } catch {
          // Invalid stored data
        }
      }

      const tokenToUse = urlToken || parsedStoredToken

      if (tokenToUse) {
        // Try to resume existing session
        await resumeSession(tokenToUse)
      } else {
        // Create new session
        await initSession(DEFAULT_SURVEY_ID)
      }

      setInitialized(true)
    }

    init()
  }, [searchParams, initSession, resumeSession, initialized])

  // Handle starting a new quiz after completion
  const handleStartNew = async () => {
    reset()
    await initSession(DEFAULT_SURVEY_ID)
  }

  // Show loading state during initialization
  if (!initialized || (isLoading && !sessionId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-blue mb-4" />
        <p className="text-lg text-muted-foreground">
          Caricamento questionario...
        </p>
      </div>
    )
  }

  // Show error state
  if (error && !sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Errore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => initSession(DEFAULT_SURVEY_ID)} className="w-full">
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to results when complete
  useEffect(() => {
    if (isComplete && initialized) {
      router.push("/quiz/results")
    }
  }, [isComplete, initialized, router])

  // Show quiz player
  return <QuizPlayer />
}
