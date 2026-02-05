"use client"

import * as React from "react"
import {
  QuestionCard,
  SingleChoice,
  MultipleChoice,
  YesNo,
  TextInput,
  ProfileSelect,
  RankingInput,
  ProgressBar,
} from "@/components/quiz"
import type { Question, QuestionOption } from "@/types/quiz"

// Mock data for testing components
const mockSingleChoiceOptions: QuestionOption[] = [
  { id: "chatgpt", label: "ChatGPT", value: "chatgpt" },
  { id: "claude", label: "Claude", value: "claude" },
  { id: "gemini", label: "Gemini", value: "gemini" },
  { id: "copilot", label: "GitHub Copilot", value: "copilot" },
]

const mockMultipleChoiceOptions: QuestionOption[] = [
  { id: "research", label: "Ricerca giuridica", value: "research" },
  { id: "writing", label: "Scrittura documenti", value: "writing" },
  { id: "review", label: "Revisione contratti", value: "review" },
  { id: "communication", label: "Comunicazione con clienti", value: "communication" },
  { id: "other", label: "Altro", value: "other" },
]

const mockProfiles: QuestionOption[] = [
  {
    id: "profile-a",
    label: "Profilo A - Base",
    value: "basic",
    description:
      "Uso strumenti base - email, Word, navigazione web. I nuovi software richiedono tempo per imparare.",
  },
  {
    id: "profile-b",
    label: "Profilo B - Intermedio",
    value: "intermediate",
    description:
      "Sono a mio agio con la tecnologia - uso strumenti cloud, imparo nuove app velocemente, risolvo problemi di base.",
  },
  {
    id: "profile-c",
    label: "Profilo C - Avanzato",
    value: "advanced",
    description:
      "Sono confidente con la tecnologia - adotto rapidamente nuovi strumenti, personalizzo il mio workflow, sono curioso di capire come funzionano le cose.",
  },
]

const mockRankingOptions: QuestionOption[] = [
  { id: "rank-research", label: "Ricerca giuridica", value: "research" },
  { id: "rank-writing", label: "Scrittura atti", value: "writing" },
  { id: "rank-review", label: "Revisione documenti", value: "review" },
  { id: "rank-communication", label: "Comunicazione clienti", value: "communication" },
  { id: "rank-analysis", label: "Analisi contratti", value: "analysis" },
]

const mockQuestion: Question = {
  id: "test-q1",
  surveyId: "test-survey",
  order: 1,
  type: "SINGLE_CHOICE",
  text: "Quale strumento AI hai usato di piu?",
  description: "Seleziona lo strumento che utilizzi con maggiore frequenza.",
  options: mockSingleChoiceOptions,
  isRequired: true,
  nextQuestionId: null,
  showCondition: null,
  createdAt: new Date(),
}

export default function TestComponentsPage() {
  // State for each component
  const [singleValue, setSingleValue] = React.useState<string | null>(null)
  const [multipleValue, setMultipleValue] = React.useState<string[]>([])
  const [yesNoValue, setYesNoValue] = React.useState<boolean | null>(null)
  const [textValue, setTextValue] = React.useState("")
  const [profileValue, setProfileValue] = React.useState<string | null>(null)
  const [rankingValue, setRankingValue] = React.useState<string[]>([])
  const [progress, setProgress] = React.useState(3)

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-center text-foreground">
          Test Componenti Quiz
        </h1>

        {/* Progress Bar */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">ProgressBar</h2>
          <ProgressBar current={progress} total={10} />
          <div className="flex gap-2">
            <button
              onClick={() => setProgress(Math.max(0, progress - 1))}
              className="px-3 py-1 bg-muted rounded"
            >
              -1
            </button>
            <button
              onClick={() => setProgress(Math.min(10, progress + 1))}
              className="px-3 py-1 bg-muted rounded"
            >
              +1
            </button>
          </div>
        </section>

        {/* QuestionCard with SingleChoice */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">QuestionCard + SingleChoice</h2>
          <QuestionCard question={mockQuestion} questionNumber={1}>
            <SingleChoice
              options={mockSingleChoiceOptions}
              value={singleValue}
              onChange={setSingleValue}
            />
          </QuestionCard>
          <p className="text-sm text-muted-foreground">
            Selected: {singleValue ?? "nessuna selezione"}
          </p>
        </section>

        {/* MultipleChoice */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">MultipleChoice</h2>
          <QuestionCard
            question={{
              ...mockQuestion,
              id: "test-q2",
              type: "MULTIPLE_CHOICE",
              text: "Per cosa hai usato l'AI nel lavoro legale?",
              description: "Seleziona tutte le opzioni applicabili.",
            }}
            questionNumber={2}
          >
            <MultipleChoice
              options={mockMultipleChoiceOptions}
              value={multipleValue}
              onChange={setMultipleValue}
            />
          </QuestionCard>
          <p className="text-sm text-muted-foreground">
            Selected: {multipleValue.length > 0 ? multipleValue.join(", ") : "nessuna selezione"}
          </p>
        </section>

        {/* YesNo */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">YesNo</h2>
          <QuestionCard
            question={{
              ...mockQuestion,
              id: "test-q3",
              type: "YES_NO",
              text: "Hai mai usato l'AI per il lavoro legale?",
              description: null,
            }}
            questionNumber={3}
          >
            <YesNo value={yesNoValue} onChange={setYesNoValue} />
          </QuestionCard>
          <p className="text-sm text-muted-foreground">
            Selected: {yesNoValue === null ? "nessuna selezione" : yesNoValue ? "Si" : "No"}
          </p>
        </section>

        {/* TextInput */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">TextInput</h2>
          <QuestionCard
            question={{
              ...mockQuestion,
              id: "test-q4",
              type: "TEXT",
              text: "Cosa ti aspetti da questo corso?",
              description: "Descrivi le tue aspettative e obiettivi di apprendimento.",
            }}
            questionNumber={4}
          >
            <TextInput
              value={textValue}
              onChange={setTextValue}
              maxLength={500}
            />
          </QuestionCard>
          <p className="text-sm text-muted-foreground">
            Characters: {textValue.length}
          </p>
        </section>

        {/* ProfileSelect */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">ProfileSelect</h2>
          <QuestionCard
            question={{
              ...mockQuestion,
              id: "test-q5",
              type: "PROFILE_SELECT",
              text: "Quale profilo ti descrive meglio?",
              description: "Seleziona il profilo che corrisponde al tuo livello di confidenza con la tecnologia.",
            }}
            questionNumber={5}
          >
            <ProfileSelect
              profiles={mockProfiles}
              value={profileValue}
              onChange={setProfileValue}
            />
          </QuestionCard>
          <p className="text-sm text-muted-foreground">
            Selected: {profileValue ?? "nessuna selezione"}
          </p>
        </section>

        {/* RankingInput */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">RankingInput</h2>
          <QuestionCard
            question={{
              ...mockQuestion,
              id: "test-q6",
              type: "RANKING",
              text: "Per cosa vorresti usare l'AI nella tua pratica?",
              description: "Seleziona e ordina le tue prime 3 preferenze.",
            }}
            questionNumber={6}
          >
            <RankingInput
              options={mockRankingOptions}
              value={rankingValue}
              onChange={setRankingValue}
              maxSelections={3}
            />
          </QuestionCard>
          <p className="text-sm text-muted-foreground">
            Ranking: {rankingValue.length > 0 ? rankingValue.join(" > ") : "nessuna selezione"}
          </p>
        </section>

        {/* Disabled states */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Disabled States (Review Mode)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">SingleChoice (disabled)</h3>
              <SingleChoice
                options={mockSingleChoiceOptions.slice(0, 2)}
                value="chatgpt"
                onChange={() => {}}
                disabled
              />
            </div>
            <div>
              <h3 className="font-medium mb-2">YesNo (disabled)</h3>
              <YesNo value={true} onChange={() => {}} disabled />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
