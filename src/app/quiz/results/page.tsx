"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/hooks/useQuiz"
import { FeedbackDisplay, CoursePrompts } from "@/components/quiz"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, ArrowLeft, RotateCcw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { CoursePrompt } from "@/types/quiz"

/**
 * Results Page - Display personalized AI feedback after quiz completion
 * Fetches from /api/feedback if not yet generated
 */
export default function ResultsPage() {
  const router = useRouter()
  const { sessionId, resumeToken, isComplete, reset } = useQuiz()

  const [feedback, setFeedback] = useState<string | null>(null)
  const [coursePrompts, setCoursePrompts] = useState<CoursePrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Handler to restart the quiz with a fresh session
  const handleRestart = () => {
    reset()
    // Clear localStorage directly to ensure clean slate
    if (typeof window !== "undefined") {
      localStorage.removeItem("quiz-session")
    }
    router.push("/quiz")
  }

  useEffect(() => {
    const fetchFeedback = async () => {
      // Check for session token in localStorage
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("quiz-session")
          : null
      let parsedToken: string | null = null
      let storedSessionId: string | null = null

      if (storedToken) {
        try {
          const parsed = JSON.parse(storedToken)
          parsedToken = parsed?.state?.resumeToken || null
        } catch {
          // Invalid stored data
        }
      }

      const tokenToUse = resumeToken || parsedToken

      // If no token, redirect to quiz start
      if (!tokenToUse) {
        router.push("/quiz")
        return
      }

      try {
        // First, check session status
        const sessionResponse = await fetch(`/api/session/${tokenToUse}`)

        if (!sessionResponse.ok) {
          throw new Error("Session not found")
        }

        const sessionData = await sessionResponse.json()

        // If session is not complete, redirect to quiz
        if (!sessionData.isComplete) {
          router.push("/quiz")
          return
        }

        // If feedback already exists in session, use it
        if (sessionData.feedback) {
          setFeedback(sessionData.feedback)
          setCoursePrompts(sessionData.coursePrompts || [])
          setIsLoading(false)
          return
        }

        // Generate feedback via API
        const feedbackResponse = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionData.sessionId }),
        })

        if (!feedbackResponse.ok) {
          throw new Error("Failed to generate feedback")
        }

        const feedbackData = await feedbackResponse.json()
        setFeedback(feedbackData.feedback)
        setCoursePrompts(feedbackData.coursePrompts || [])
      } catch (err) {
        console.error("Error fetching feedback:", err)
        setError("Si è verificato un errore nel caricamento del feedback.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [sessionId, resumeToken, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="DigiCrazy Lab - TrAIn your BrAIn"
            width={240}
            height={135}
            priority
            className="h-auto"
          />
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-brand-blue" />
              <p className="text-lg text-center text-muted-foreground">
                Stiamo preparando il tuo feedback personalizzato...
              </p>
              <p className="text-sm text-center text-gray-400">
                L&apos;AI sta analizzando le tue risposte
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Errore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button asChild className="w-full">
              <Link href="/quiz">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna al questionario
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state with feedback
  return (
    <div className="flex flex-col items-center min-h-[60vh] p-4">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="DigiCrazy Lab - TrAIn your BrAIn"
          width={240}
          height={135}
          priority
          className="h-auto"
        />
      </div>

      {/* Success header */}
      <div className="w-full max-w-2xl mb-6">
        <Card className="border-brand-green/30 bg-brand-green/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-brand-green" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Grazie per aver completato il questionario!
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Ecco il tuo feedback personalizzato basato sulle tue risposte.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback display */}
      <div className="w-full max-w-2xl mb-6">
        {feedback && <FeedbackDisplay feedback={feedback} />}
      </div>

      {/* Course prompts (if any) */}
      {coursePrompts.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <CoursePrompts prompts={coursePrompts} />
        </div>
      )}

      {/* Actions */}
      <div className="w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleRestart} variant="default" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            Ricomincia il test
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400">
          TrAIn your BrAIn - DigiCrazy Lab
        </p>
      </div>
    </div>
  )
}
