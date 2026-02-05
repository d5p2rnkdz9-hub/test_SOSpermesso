"use client"

import { useMemo } from "react"
import { useQuizStore } from "@/store/quiz-store"
import type { Question, ShowCondition, AnswerValue } from "@/types/quiz"

/**
 * Check if a question should be visible based on its showCondition
 */
function evaluateShowCondition(
  condition: ShowCondition | null,
  answers: Record<string, AnswerValue>
): boolean {
  if (!condition) return true

  const answer = answers[condition.questionId]
  if (!answer) return false

  // Get the actual value to compare (always string or string[])
  let answerValue: string | string[] | number | undefined

  if ("selectedValue" in answer) {
    // SingleAnswerValue - for YES_NO, stores "true"/"false" strings
    answerValue = answer.selectedValue
  } else if ("selectedValues" in answer) {
    // MultipleAnswerValue
    answerValue = answer.selectedValues
  } else if ("text" in answer) {
    // TextAnswerValue
    answerValue = answer.text
  } else if ("rankedOptionIds" in answer) {
    // RankingAnswerValue
    answerValue = answer.rankedOptionIds
  }

  // Normalize condition value for boolean comparison
  const conditionValue = condition.value === true ? "true"
    : condition.value === false ? "false"
    : condition.value

  switch (condition.operator) {
    case "equals":
      // Handle boolean string comparison for YES_NO questions
      if (conditionValue === "true") {
        return answerValue === "true"
      }
      if (conditionValue === "false") {
        return answerValue === "false"
      }
      return answerValue === conditionValue
    case "notEquals":
      if (conditionValue === "true") {
        return answerValue !== "true"
      }
      if (conditionValue === "false") {
        return answerValue !== "false"
      }
      return answerValue !== conditionValue
    case "contains":
      if (Array.isArray(answerValue) && typeof condition.value === "string") {
        return answerValue.includes(condition.value)
      }
      return false
    case "greaterThan":
      if (typeof answerValue === "number" && typeof condition.value === "number") {
        return answerValue > condition.value
      }
      return false
    case "lessThan":
      if (typeof answerValue === "number" && typeof condition.value === "number") {
        return answerValue < condition.value
      }
      return false
    default:
      return true
  }
}

export interface UseQuizReturn {
  // State
  sessionId: string | null
  resumeToken: string | null
  isLoading: boolean
  isComplete: boolean
  error: string | null
  answers: Record<string, AnswerValue>

  // Computed values
  currentQuestion: Question | null
  visibleQuestions: Question[]
  currentVisibleIndex: number
  progress: number
  canGoBack: boolean
  canGoNext: boolean
  isLastQuestion: boolean
  hasCurrentAnswer: boolean

  // Actions
  initSession: (surveyId: string) => Promise<void>
  resumeSession: (resumeToken: string) => Promise<void>
  setAnswer: (questionId: string, value: AnswerValue) => Promise<void>
  nextQuestion: () => void
  prevQuestion: () => void
  completeQuiz: () => Promise<void>
  reset: () => void
}

/**
 * useQuiz - Hook wrapping quiz store with computed values
 * Handles question visibility based on showCondition (branching logic)
 */
export function useQuiz(): UseQuizReturn {
  const store = useQuizStore()

  const {
    sessionId,
    resumeToken,
    questions,
    currentIndex,
    answers,
    isLoading,
    isComplete,
    error,
    initSession,
    resumeSession,
    setAnswer,
    nextQuestion,
    prevQuestion,
    completeQuiz,
    reset,
  } = store

  // Build visible question list based on answers (branching logic)
  const visibleQuestions = useMemo(() => {
    return questions.filter((question) =>
      evaluateShowCondition(question.showCondition, answers)
    )
  }, [questions, answers])

  // Get current question
  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null
  }, [questions, currentIndex])

  // Find current question's index in visible questions
  const currentVisibleIndex = useMemo(() => {
    if (!currentQuestion) return 0
    return visibleQuestions.findIndex((q) => q.id === currentQuestion.id)
  }, [visibleQuestions, currentQuestion])

  // Calculate progress (0-100) based on visible questions
  const progress = useMemo(() => {
    if (visibleQuestions.length === 0) return 0
    // Count answered visible questions
    const answeredCount = visibleQuestions.filter((q) => answers[q.id]).length
    return Math.round((answeredCount / visibleQuestions.length) * 100)
  }, [visibleQuestions, answers])

  // Navigation state
  const canGoBack = useMemo(() => {
    return currentVisibleIndex > 0
  }, [currentVisibleIndex])

  const canGoNext = useMemo(() => {
    if (!currentQuestion) return false
    // Can go next if current question has an answer
    return !!answers[currentQuestion.id]
  }, [currentQuestion, answers])

  const isLastQuestion = useMemo(() => {
    return currentVisibleIndex === visibleQuestions.length - 1
  }, [currentVisibleIndex, visibleQuestions.length])

  const hasCurrentAnswer = useMemo(() => {
    if (!currentQuestion) return false
    return !!answers[currentQuestion.id]
  }, [currentQuestion, answers])

  return {
    // State
    sessionId,
    resumeToken,
    isLoading,
    isComplete,
    error,
    answers,

    // Computed values
    currentQuestion,
    visibleQuestions,
    currentVisibleIndex,
    progress,
    canGoBack,
    canGoNext,
    isLastQuestion,
    hasCurrentAnswer,

    // Actions
    initSession,
    resumeSession,
    setAnswer,
    nextQuestion,
    prevQuestion,
    completeQuiz,
    reset,
  }
}
