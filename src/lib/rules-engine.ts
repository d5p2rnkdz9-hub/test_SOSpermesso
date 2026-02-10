/**
 * Rules Engine for AI Screening Quiz
 * Evaluates participant responses and detects knowledge gaps
 * to enable personalized course prompts
 */

// ============================================================
// Types
// ============================================================

export interface GapArea {
  area: string
  description: string // Italian description for Claude context
  severity: "minor" | "significant"
}

export interface RulesResult {
  // Profile summary
  awarenessLevel: "none" | "aware" | "user" | "active-user"
  pathTaken: "not-aware" | "aware-not-working" | "aware-working"

  // Detected characteristics
  toolsUsed: string[] // Which AI tools they've used
  workActivities: string[] // How they use AI for work
  usageFrequency: string | null // daily/weekly/monthly/rarely
  challenges: string[] // Difficulties encountered with AI
  usageTrend: string | null // increasing/stable/decreasing/stopped
  satisfaction: string | null // not-at-all/little/enough/very
  barriers: string[] // What's stopping them
  concerns: string[] // Privacy, ethics, reliability concerns
  priorities: string[] // What they want to focus on in course
  expectations: string | null // Free text expectations
  confidence: string | null // beginner/intermediate/advanced

  // Gap detection
  gaps: GapArea[] // Detected areas where course can help
}

interface AnswerInput {
  questionId: string
  value: unknown
  questionText: string
  questionOptions: unknown
}

// ============================================================
// Main Evaluation Function
// ============================================================

/**
 * Evaluate quiz responses to determine user profile and gaps
 */
export function evaluateResponses(answers: AnswerInput[]): RulesResult {
  // Extract key answer values
  const answersMap = new Map<string, unknown>()
  answers.forEach((a) => answersMap.set(a.questionId, a.value))

  // Parse responses
  const q1Aware = getSingleValue(answersMap.get("q1-aware")) === "true"
  const q1aTools = getMultipleValues(answersMap.get("q1a-tools"))
  const q1bWhyNot = getSingleValue(answersMap.get("q1b-whynot-aware"))
  const q2Work = getSingleValue(answersMap.get("q2-work")) === "true"
  const q2aActivities = getMultipleValues(answersMap.get("q2a-activities"))
  const q2a2Frequency = getSingleValue(answersMap.get("q2a2-frequency"))
  const q2a3Challenges = getMultipleValues(answersMap.get("q2a3-challenges"))
  const q2bTrend = getSingleValue(answersMap.get("q2b-trend"))
  const q2cSatisfaction = getSingleValue(answersMap.get("q2c-satisfaction"))
  const q2dBarriers = getMultipleValues(answersMap.get("q2d-barriers"))
  const q3Confidence = getSingleValue(answersMap.get("q3-confidence"))
  const q4Expectations = getTextValue(answersMap.get("q4-expectations"))
  const q5Concerns = getMultipleValues(answersMap.get("q5-concerns"))
  const q6Priorities = getRankedValues(answersMap.get("q6-priorities"))

  // Determine awareness level
  let awarenessLevel: RulesResult["awarenessLevel"]
  if (!q1Aware) {
    awarenessLevel = "none"
  } else if (!q2Work) {
    awarenessLevel = "aware"
  } else if (q3Confidence === "beginner") {
    awarenessLevel = "user"
  } else {
    awarenessLevel = "active-user"
  }

  // Determine path taken
  let pathTaken: RulesResult["pathTaken"]
  if (!q1Aware) {
    pathTaken = "not-aware"
  } else if (!q2Work) {
    pathTaken = "aware-not-working"
  } else {
    pathTaken = "aware-working"
  }

  // Detect gaps
  const gaps = detectGaps({
    q1Aware,
    q1aTools,
    q1bWhyNot,
    q2Work,
    q2aActivities,
    q2a2Frequency,
    q2a3Challenges,
    q2bTrend,
    q2cSatisfaction,
    q2dBarriers,
    q3Confidence,
    q5Concerns,
  })

  return {
    awarenessLevel,
    pathTaken,
    toolsUsed: q1aTools || [],
    workActivities: q2aActivities || [],
    usageFrequency: q2a2Frequency,
    challenges: q2a3Challenges || [],
    usageTrend: q2bTrend,
    satisfaction: q2cSatisfaction,
    barriers: q2dBarriers || [],
    concerns: q5Concerns || [],
    priorities: q6Priorities || [],
    expectations: q4Expectations,
    confidence: q3Confidence,
    gaps,
  }
}

// ============================================================
// Gap Detection Logic
// ============================================================

interface GapInputs {
  q1Aware: boolean
  q1aTools: string[] | null
  q1bWhyNot: string | null
  q2Work: boolean
  q2aActivities: string[] | null
  q2a2Frequency: string | null
  q2a3Challenges: string[] | null
  q2bTrend: string | null
  q2cSatisfaction: string | null
  q2dBarriers: string[] | null
  q3Confidence: string | null
  q5Concerns: string[] | null
}

function detectGaps(inputs: GapInputs): GapArea[] {
  const gaps: GapArea[] = []

  // Rule 1: No awareness
  if (!inputs.q1Aware) {
    gaps.push({
      area: "foundational-knowledge",
      description:
        "Non ha mai sentito parlare di strumenti AI. Ha bisogno di una introduzione alle basi prima di qualsiasi applicazione pratica.",
      severity: "significant",
    })
  }

  // Rule 2: Aware but never used for work
  if (inputs.q1Aware && !inputs.q2Work) {
    gaps.push({
      area: "practical-application",
      description:
        "Conosce gli strumenti AI ma non li ha mai applicati al lavoro legale. Ha bisogno di esempi concreti e casi d'uso.",
      severity: "significant",
    })
  }

  // Rule 3: Barriers include privacy or reliability fears
  if (
    inputs.q2dBarriers &&
    (inputs.q2dBarriers.includes("privacy") || inputs.q2dBarriers.includes("reliability"))
  ) {
    gaps.push({
      area: "risk-understanding",
      description:
        "Ha paure sulla riservatezza o affidabilità dell'AI. Ha bisogno di conoscere i rischi reali e come mitigarli.",
      severity: "minor",
    })
  }

  // Rule 4: No tools used or only one tool
  if (!inputs.q1aTools || inputs.q1aTools.length <= 1) {
    gaps.push({
      area: "tool-breadth",
      description:
        "Ha provato pochi strumenti AI. Beneficerebbe di vedere diversi strumenti e le loro specificità.",
      severity: "minor",
    })
  }

  // Rule 5: Confidence = beginner
  if (inputs.q3Confidence === "beginner") {
    gaps.push({
      area: "hands-on-practice",
      description:
        "Si considera principiante e non si fida dei risultati. Ha bisogno di pratica guidata per sviluppare competenza.",
      severity: "significant",
    })
  }

  // Rule 6: Concerns include ethics/deontological
  if (inputs.q5Concerns && inputs.q5Concerns.includes("ethics")) {
    gaps.push({
      area: "ethical-framework",
      description:
        "Preoccupato per le implicazioni deontologiche. Il corso copre questo tema - enfatizzarlo.",
      severity: "minor",
    })
  }

  // Rule 7: Satisfaction = frustrated or little
  if (inputs.q2cSatisfaction === "not-at-all" || inputs.q2cSatisfaction === "little") {
    gaps.push({
      area: "effective-usage",
      description:
        "Usa l'AI ma non è soddisfatto dei risultati. Ha bisogno di imparare strategie per ottenere valore.",
      severity: "significant",
    })
  }

  // Rule 8: Usage trend = decreasing or stopped
  if (inputs.q2bTrend === "decreasing" || inputs.q2bTrend === "stopped") {
    gaps.push({
      area: "re-engagement",
      description:
        "Ha provato l'AI ma ha smesso o lo usa meno. Ha bisogno di ritrovare motivazione e vedere casi di successo.",
      severity: "significant",
    })
  }

  // Rule 9: Rarely uses AI despite working with it
  if (inputs.q2a2Frequency === "rarely") {
    gaps.push({
      area: "habit-building",
      description:
        "Usa l'AI raramente nel lavoro. Ha bisogno di capire come integrarlo nelle attività quotidiane.",
      severity: "minor",
    })
  }

  // Rule 10: Struggles with prompts
  if (inputs.q2a3Challenges && inputs.q2a3Challenges.includes("prompts")) {
    gaps.push({
      area: "prompt-skills",
      description:
        "Ha difficoltà a formulare richieste efficaci all'AI. Ha bisogno di imparare tecniche di prompting.",
      severity: "significant",
    })
  }

  // Rule 11: Encountered hallucinations
  if (inputs.q2a3Challenges && inputs.q2a3Challenges.includes("hallucinations")) {
    gaps.push({
      area: "output-verification",
      description:
        "Ha riscontrato risposte imprecise o inventate. Ha bisogno di capire come verificare i risultati dell'AI.",
      severity: "minor",
    })
  }

  return gaps
}

// ============================================================
// Helper Functions
// ============================================================

function getSingleValue(value: unknown): string | null {
  if (!value || typeof value !== "object") return null
  const obj = value as Record<string, unknown>
  if ("selectedValue" in obj && typeof obj.selectedValue === "string") {
    return obj.selectedValue
  }
  return null
}

function getMultipleValues(value: unknown): string[] | null {
  if (!value || typeof value !== "object") return null
  const obj = value as Record<string, unknown>
  if ("selectedValues" in obj && Array.isArray(obj.selectedValues)) {
    return obj.selectedValues as string[]
  }
  return null
}

function getTextValue(value: unknown): string | null {
  if (!value || typeof value !== "object") return null
  const obj = value as Record<string, unknown>
  if ("text" in obj && typeof obj.text === "string") {
    return obj.text
  }
  return null
}

function getRankedValues(value: unknown): string[] | null {
  if (!value || typeof value !== "object") return null
  const obj = value as Record<string, unknown>
  if ("rankedOptionIds" in obj && Array.isArray(obj.rankedOptionIds)) {
    // Map IDs to values - need question options to do this properly
    // For now just return the IDs
    return obj.rankedOptionIds as string[]
  }
  return null
}
