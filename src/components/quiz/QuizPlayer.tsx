"use client"

import { useCallback } from "react"
import { useQuiz } from "@/hooks/useQuiz"
import { QuestionCard } from "./QuestionCard"
import { SingleChoice } from "./SingleChoice"
import { MultipleChoice } from "./MultipleChoice"
import { YesNo } from "./YesNo"
import { TextInput } from "./TextInput"
import { ProfileSelect } from "./ProfileSelect"
import { RankingInput } from "./RankingInput"
import { ProgressBar } from "./ProgressBar"
import { NavigationButtons } from "./NavigationButtons"
import type {
  Question,
  QuestionOption,
  SingleAnswerValue,
  MultipleAnswerValue,
  TextAnswerValue,
  RankingAnswerValue,
} from "@/types/quiz"
import { cn } from "@/lib/utils"
import { AlertCircle, Loader2 } from "lucide-react"

export interface QuizPlayerProps {
  className?: string
}

/**
 * QuizPlayer - Main quiz orchestrator component
 * Renders current question with appropriate input component
 * Handles navigation and answer persistence
 */
export function QuizPlayer({ className }: QuizPlayerProps) {
  const {
    currentQuestion,
    questionPath,
    currentVisibleIndex,
    progress,
    canGoBack,
    canGoNext,
    isLastQuestion,
    isLoading,
    error,
    answers,
    setAnswer,
    nextQuestion,
    prevQuestion,
    completeQuiz,
  } = useQuiz()

  // Get current answer value for the current question
  const getCurrentAnswerValue = useCallback(() => {
    if (!currentQuestion) return null
    return answers[currentQuestion.id] || null
  }, [currentQuestion, answers])

  // Handle answer change for different question types
  const handleSingleChoiceChange = useCallback(
    (value: string) => {
      if (!currentQuestion) return
      const answerValue: SingleAnswerValue = {
        selectedOptionId: value,
        selectedValue: (currentQuestion.options as QuestionOption[])?.find(
          (o) => o.id === value
        )?.value || value,
      }
      setAnswer(currentQuestion.id, answerValue)
    },
    [currentQuestion, setAnswer]
  )

  const handleMultipleChoiceChange = useCallback(
    (values: string[]) => {
      if (!currentQuestion) return
      const options = currentQuestion.options as QuestionOption[]
      const answerValue: MultipleAnswerValue = {
        selectedOptionIds: values,
        selectedValues: values
          .map((id) => options?.find((o) => o.id === id)?.value || id)
          .filter(Boolean),
      }
      setAnswer(currentQuestion.id, answerValue)
    },
    [currentQuestion, setAnswer]
  )

  const handleYesNoChange = useCallback(
    (value: boolean) => {
      if (!currentQuestion) return
      const answerValue: SingleAnswerValue = {
        selectedOptionId: value ? "yes" : "no",
        selectedValue: value ? "true" : "false",
      }
      setAnswer(currentQuestion.id, answerValue)
    },
    [currentQuestion, setAnswer]
  )

  const handleTextChange = useCallback(
    (value: string) => {
      if (!currentQuestion) return
      const answerValue: TextAnswerValue = {
        text: value,
      }
      setAnswer(currentQuestion.id, answerValue)
    },
    [currentQuestion, setAnswer]
  )

  const handleRankingChange = useCallback(
    (values: string[]) => {
      if (!currentQuestion) return
      const answerValue: RankingAnswerValue = {
        rankedOptionIds: values,
      }
      setAnswer(currentQuestion.id, answerValue)
    },
    [currentQuestion, setAnswer]
  )

  // Render the appropriate input component based on question type
  const renderQuestionInput = (question: Question) => {
    const answer = getCurrentAnswerValue()
    const options = question.options as QuestionOption[] | null

    switch (question.type) {
      case "SINGLE_CHOICE":
        return (
          <SingleChoice
            options={options || []}
            value={
              answer && "selectedOptionId" in answer
                ? answer.selectedOptionId
                : null
            }
            onChange={handleSingleChoiceChange}
          />
        )

      case "MULTIPLE_CHOICE":
        return (
          <MultipleChoice
            options={options || []}
            value={
              answer && "selectedOptionIds" in answer
                ? answer.selectedOptionIds
                : []
            }
            onChange={handleMultipleChoiceChange}
          />
        )

      case "YES_NO":
        const yesNoValue =
          answer && "selectedValue" in answer
            ? answer.selectedValue === "true"
              ? true
              : answer.selectedValue === "false"
              ? false
              : null
            : null
        return <YesNo value={yesNoValue} onChange={handleYesNoChange} />

      case "TEXT":
        return (
          <TextInput
            value={answer && "text" in answer ? answer.text : ""}
            onChange={handleTextChange}
          />
        )

      case "PROFILE_SELECT":
        return (
          <ProfileSelect
            profiles={options || []}
            value={
              answer && "selectedOptionId" in answer
                ? answer.selectedOptionId
                : null
            }
            onChange={handleSingleChoiceChange}
          />
        )

      case "RANKING":
        return (
          <RankingInput
            options={options || []}
            value={
              answer && "rankedOptionIds" in answer
                ? answer.rankedOptionIds
                : []
            }
            onChange={handleRankingChange}
            maxSelections={3}
          />
        )

      default:
        return (
          <div className="text-muted-foreground">
            Tipo di domanda non supportato: {question.type}
          </div>
        )
    }
  }

  // Loading state
  if (isLoading && !currentQuestion) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue mb-4" />
        <p className="text-muted-foreground">Caricamento questionario...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-destructive font-medium">Errore</p>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }

  // No question state
  if (!currentQuestion) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <p className="text-muted-foreground">Nessuna domanda disponibile</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Progress bar at top */}
      <ProgressBar
        current={currentVisibleIndex + 1}
        total={questionPath.length}
        showPercentage
      />

      {/* Question card with input */}
      <QuestionCard question={currentQuestion}>
        {renderQuestionInput(currentQuestion)}
      </QuestionCard>

      {/* Navigation buttons */}
      <NavigationButtons
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        isLastQuestion={isLastQuestion}
        isLoading={isLoading}
        onBack={prevQuestion}
        onNext={nextQuestion}
        onComplete={completeQuiz}
      />
    </div>
  )
}
