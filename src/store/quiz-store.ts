"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Question, AnswerValue, ShowCondition, QuestionOption, SingleAnswerValue } from "@/types/quiz"

interface QuizState {
  // Session
  sessionId: string | null
  resumeToken: string | null

  // Quiz progress
  questions: Question[]
  currentIndex: number
  answers: Record<string, AnswerValue> // questionId -> answer value
  navigationHistory: number[] // Stack of visited indices for correct back navigation

  // Status
  isLoading: boolean
  isComplete: boolean
  error: string | null

  // Actions
  initSession: (surveyId: string) => Promise<void>
  resumeSession: (resumeToken: string) => Promise<void>
  setAnswer: (questionId: string, value: AnswerValue) => Promise<void>
  nextQuestion: () => void
  prevQuestion: () => void
  completeQuiz: () => Promise<void>
  reset: () => void
}

// Debounce helper for auto-saving answers
let saveTimeout: ReturnType<typeof setTimeout> | null = null

// Check if a question should be visible based on its showCondition
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
    // SingleAnswerValue - stores "true"/"false" strings for YES_NO
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
      if (conditionValue === "true") {
        return answerValue === "true"
      }
      if (conditionValue === "false") {
        return answerValue === "false"
      }
      return answerValue === conditionValue
    case "notEquals":
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

const initialState = {
  sessionId: null,
  resumeToken: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  navigationHistory: [] as number[],
  isLoading: false,
  isComplete: false,
  error: null,
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initSession: async (surveyId: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ surveyId }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to create session")
          }

          const data = await response.json()

          set({
            sessionId: data.sessionId,
            resumeToken: data.resumeToken,
            questions: data.questions,
            currentIndex: data.currentIndex,
            answers: {},
            isLoading: false,
            isComplete: false,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to create session",
          })
        }
      },

      resumeSession: async (resumeToken: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`/api/session/${resumeToken}`)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to resume session")
          }

          const data = await response.json()

          if (data.isComplete) {
            set({
              isLoading: false,
              isComplete: true,
              sessionId: data.sessionId,
              resumeToken: data.resumeToken,
            })
            return
          }

          // Convert answers array to record
          const answersRecord: Record<string, AnswerValue> = {}
          if (data.answers) {
            for (const answer of data.answers) {
              answersRecord[answer.questionId] = answer.value
            }
          }

          set({
            sessionId: data.sessionId,
            resumeToken: data.resumeToken,
            questions: data.questions,
            currentIndex: data.currentIndex,
            answers: answersRecord,
            isLoading: false,
            isComplete: false,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to resume session",
          })
        }
      },

      setAnswer: async (questionId: string, value: AnswerValue) => {
        const { sessionId, answers } = get()

        // Update local state immediately
        set({
          answers: { ...answers, [questionId]: value },
        })

        // Debounced save to API (500ms)
        if (saveTimeout) {
          clearTimeout(saveTimeout)
        }

        saveTimeout = setTimeout(async () => {
          if (!sessionId) return

          try {
            const response = await fetch("/api/answers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                questionId,
                value,
              }),
            })

            if (!response.ok) {
              console.error("Failed to save answer")
            }
          } catch (error) {
            console.error("Failed to save answer:", error)
          }
        }, 500)
      },

      nextQuestion: () => {
        const { questions, currentIndex, answers, navigationHistory } = get()
        const currentQuestion = questions[currentIndex]
        if (!currentQuestion) return

        const currentAnswer = answers[currentQuestion.id]
        let jumpToId: string | null = null

        // Check option-level nextQuestionId (for SINGLE_CHOICE, YES_NO, PROFILE_SELECT)
        if (currentAnswer && "selectedOptionId" in currentAnswer && currentQuestion.options) {
          const selectedOption = (currentQuestion.options as QuestionOption[]).find(
            o => o.id === (currentAnswer as SingleAnswerValue).selectedOptionId
          )
          if (selectedOption?.nextQuestionId) {
            jumpToId = selectedOption.nextQuestionId
          }
        }

        // Check question-level nextQuestionId (fallback)
        if (!jumpToId && currentQuestion.nextQuestionId) {
          jumpToId = currentQuestion.nextQuestionId
        }

        // If we have a jump target, find its index
        if (jumpToId) {
          const targetIndex = questions.findIndex(q => q.id === jumpToId)
          if (targetIndex !== -1) {
            set({
              currentIndex: targetIndex,
              navigationHistory: [...navigationHistory, currentIndex],
            })

            // Update server-side currentIndex
            const { sessionId } = get()
            if (sessionId) {
              fetch("/api/answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId,
                  updateIndex: targetIndex,
                }),
              }).catch(console.error)
            }
            return
          }
        }

        // Fall through to existing scan-forward behavior
        let nextIndex = currentIndex + 1
        while (nextIndex < questions.length) {
          const question = questions[nextIndex]
          if (evaluateShowCondition(question.showCondition, answers)) {
            break
          }
          nextIndex++
        }

        // Check if we've reached the end
        if (nextIndex >= questions.length) {
          // Don't advance past the last question
          return
        }

        set({
          currentIndex: nextIndex,
          navigationHistory: [...navigationHistory, currentIndex],
        })

        // Update server-side currentIndex
        const { sessionId } = get()
        if (sessionId) {
          fetch("/api/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              updateIndex: nextIndex,
            }),
          }).catch(console.error)
        }
      },

      prevQuestion: () => {
        const { navigationHistory } = get()

        // Pop from navigation history to go back to the exact previous question
        if (navigationHistory.length === 0) return

        const newHistory = [...navigationHistory]
        const prevIndex = newHistory.pop()!

        set({
          currentIndex: prevIndex,
          navigationHistory: newHistory,
        })

        // Update server-side currentIndex
        const { sessionId } = get()
        if (sessionId) {
          fetch("/api/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              updateIndex: prevIndex,
            }),
          }).catch(console.error)
        }
      },

      completeQuiz: async () => {
        const { sessionId } = get()
        if (!sessionId) return

        set({ isLoading: true })

        try {
          const response = await fetch(`/api/session/${get().resumeToken}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ complete: true }),
          })

          if (!response.ok) {
            throw new Error("Failed to complete quiz")
          }

          set({ isComplete: true, isLoading: false })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to complete quiz",
          })
        }
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: "quiz-session",
      partialize: (state) => ({
        resumeToken: state.resumeToken,
      }),
    }
  )
)
