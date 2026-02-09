"use client"

import { useMemo } from "react"
import { useQuizStore } from "@/store/quiz-store"
import type { Question, ShowCondition, AnswerValue, QuestionOption, SingleAnswerValue } from "@/types/quiz"

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
  questionPath: Question[]
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

  // Build the actual path the user will take (or has taken) based on answers and branching
  const questionPath = useMemo(() => {
    const path: Question[] = []
    let currentQ: Question | undefined = questions[0]

    while (currentQ) {
      // Check if this question is visible
      if (!evaluateShowCondition(currentQ.showCondition, answers)) {
        // Skip invisible, move to next in order
        const skipIdx: number = questions.indexOf(currentQ) + 1
        currentQ = skipIdx < questions.length ? questions[skipIdx] : undefined
        continue
      }

      path.push(currentQ)

      // Determine next question
      const answer = answers[currentQ.id]
      let nextId: string | null = null

      // Check option-level jump (for SINGLE_CHOICE, YES_NO, PROFILE_SELECT)
      if (answer && "selectedOptionId" in answer && currentQ.options) {
        const selectedOption = (currentQ.options as QuestionOption[]).find(
          o => o.id === (answer as SingleAnswerValue).selectedOptionId
        )
        if (selectedOption?.nextQuestionId) {
          nextId = selectedOption.nextQuestionId
        }
      }

      // Check question-level jump
      if (!nextId && currentQ.nextQuestionId) {
        nextId = currentQ.nextQuestionId
      }

      if (nextId) {
        currentQ = questions.find(q => q.id === nextId)
      } else {
        // Scan forward for next visible
        const currentIdx = questions.indexOf(currentQ)
        let nextIdx = currentIdx + 1
        while (nextIdx < questions.length) {
          if (evaluateShowCondition(questions[nextIdx].showCondition, answers)) {
            break
          }
          nextIdx++
        }
        currentQ = nextIdx < questions.length ? questions[nextIdx] : undefined
      }

      // Safety: prevent infinite loops
      if (path.length > questions.length) break
    }

    return path
  }, [questions, answers])

  // Get current question
  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null
  }, [questions, currentIndex])

  // Find current question's index in path
  const currentVisibleIndex = useMemo(() => {
    if (!currentQuestion) return 0
    return questionPath.findIndex((q) => q.id === currentQuestion.id)
  }, [questionPath, currentQuestion])

  // Calculate progress (0-100) based on actual path
  const progress = useMemo(() => {
    if (questionPath.length === 0) return 0
    // Count answered questions in path
    const answeredCount = questionPath.filter((q) => answers[q.id]).length
    return Math.round((answeredCount / questionPath.length) * 100)
  }, [questionPath, answers])

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
    return currentVisibleIndex === questionPath.length - 1
  }, [currentVisibleIndex, questionPath.length])

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
    questionPath,
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
