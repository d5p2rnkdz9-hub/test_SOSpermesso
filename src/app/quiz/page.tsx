import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import QuizContent from "./QuizContent"

/**
 * Quiz Page - Entry point for quiz
 * Wraps QuizContent in Suspense for Next.js 15 static generation compatibility
 */
export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Caricamento...</p>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  )
}
