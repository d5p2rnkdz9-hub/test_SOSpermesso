"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { QuizPlayer, StartScreen } from "@/components/quiz"
import { useQuiz } from "@/hooks/useQuiz"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const DEFAULT_SURVEY_ID = "ai-screening-v1"

/**
 * Quiz Page - Entry point for quiz
 * Shows StartScreen for new users, QuizPlayer for in-progress, redirects to results when complete
 */
export default function QuizPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [initialized, setInitialized] = useState(false)
  const [showStartScreen, setShowStartScreen] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

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
        // No existing session - show start screen
        setShowStartScreen(true)
      }

      setInitialized(true)
    }

    init()
  }, [searchParams, resumeSession, initialized])

  // Redirect to results when complete
  useEffect(() => {
    if (isComplete && initialized) {
      router.push("/quiz/results")
    }
  }, [isComplete, initialized, router])

  // Handle starting a new quiz from start screen
  const handleStart = async () => {
    setIsStarting(true)
    // Clear any old session data
    reset()
    // Create new session
    await initSession(DEFAULT_SURVEY_ID)
    setShowStartScreen(false)
    setIsStarting(false)
  }

  // Show loading state during initialization
  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-blue mb-4" />
        <p className="text-lg text-muted-foreground">
          Caricamento...
        </p>
      </div>
    )
  }

  // Show error state
  if (error && !sessionId && !showStartScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Errore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleStart} className="w-full">
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show start screen for new users
  if (showStartScreen && !sessionId) {
    return <StartScreen onStart={handleStart} isLoading={isStarting} />
  }

  // Show loading state while creating session
  if (isLoading && !sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-blue mb-4" />
        <p className="text-lg text-muted-foreground">
          Preparazione questionario...
        </p>
      </div>
    )
  }

  // Show quiz player
  return <QuizPlayer />
}
