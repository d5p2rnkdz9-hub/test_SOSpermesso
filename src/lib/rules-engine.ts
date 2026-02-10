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
  awarenessLevel: "none" | "aware" | "active-user"
  pathTaken: "not-aware" | "aware-not-working" | "aware-working"

  // Detected characteristics
  toolsUsed: string[] // Which AI tools they've used
  workActivities: string[] // How they use AI for work
  usageFrequency: string | null // daily/weekly/monthly/rarely
  challenges: string[] // Difficulties encountered with AI
  satisfaction: string | null // not-at-all/little/enough/very
  barriers: string[] // What's stopping them
  concerns: string[] // Privacy, ethics, reliability concerns
  priorities: string[] // What they want to focus on in course
  expectations: string | null // Free text expectations

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
  const q1aTools = getMultipleValues(answersMap.get("q1a-tools"))
  const q1bWhyNot = getSingleValue(answersMap.get("q1b-whynot-aware"))
  const isNotAware = q1aTools !== null && q1aTools.includes("none")
  const q2Work = getSingleValue(answersMap.get("q2-work")) === "true"
  const q2aActivities = getMultipleValues(answersMap.get("q2a-activities"))
  const q2a2Frequency = getSingleValue(answersMap.get("q2a2-frequency"))
  const q2a3Challenges = getMultipleValues(answersMap.get("q2a3-challenges"))
  const q2cSatisfaction = getSingleValue(answersMap.get("q2c-satisfaction"))
  const q2dBarriers = getMultipleValues(answersMap.get("q2d-barriers"))
  const q4Expectations = getTextValue(answersMap.get("q4-expectations"))
  const q5Concerns = getMultipleValues(answersMap.get("q5-concerns"))
  const q6Priorities = getRankedValues(answersMap.get("q6-priorities"))

  // Determine awareness level
  let awarenessLevel: RulesResult["awarenessLevel"]
  if (isNotAware) {
    awarenessLevel = "none"
  } else if (!q2Work) {
    awarenessLevel = "aware"
  } else {
    awarenessLevel = "active-user"
  }

  // Determine path taken
  let pathTaken: RulesResult["pathTaken"]
  if (isNotAware) {
    pathTaken = "not-aware"
  } else if (!q2Work) {
    pathTaken = "aware-not-working"
  } else {
    pathTaken = "aware-working"
  }

  // Detect gaps
  const gaps = detectGaps({
    isNotAware,
    q1aTools,
    q1bWhyNot,
    q2Work,
    q2aActivities,
    q2a2Frequency,
    q2a3Challenges,
    q2cSatisfaction,
    q2dBarriers,
    q5Concerns,
  })

  return {
    awarenessLevel,
    pathTaken,
    toolsUsed: (q1aTools || []).filter(t => t !== "none"),
    workActivities: q2aActivities || [],
    usageFrequency: q2a2Frequency,
    challenges: q2a3Challenges || [],
    satisfaction: q2cSatisfaction,
    barriers: q2dBarriers || [],
    concerns: q5Concerns || [],
    priorities: q6Priorities || [],
    expectations: q4Expectations,
    gaps,
  }
}

// ============================================================
// Gap Detection Logic
// ============================================================

interface GapInputs {
  isNotAware: boolean
  q1aTools: string[] | null
  q1bWhyNot: string | null
  q2Work: boolean
  q2aActivities: string[] | null
  q2a2Frequency: string | null
  q2a3Challenges: string[] | null
  q2cSatisfaction: string | null
  q2dBarriers: string[] | null
  q5Concerns: string[] | null
}

function detectGaps(inputs: GapInputs): GapArea[] {
  const gaps: GapArea[] = []

  // Rule 1: No awareness (selected "Nessuno" in Q1a)
  if (inputs.isNotAware) {
    gaps.push({
      area: "foundational-knowledge",
      description:
        "Non ha mai provato strumenti AI. Ha bisogno di una introduzione alle basi prima di qualsiasi applicazione pratica.",
      severity: "significant",
    })
  }

  // Rule 2: Aware but never used for work
  if (!inputs.isNotAware && !inputs.q2Work) {
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
  if (!inputs.q1aTools || inputs.q1aTools.filter(t => t !== "none").length <= 1) {
    gaps.push({
      area: "tool-breadth",
      description:
        "Ha provato pochi strumenti AI. Beneficerebbe di vedere diversi strumenti e le loro specificità.",
      severity: "minor",
    })
  }

  // Rule 5: Concerns include ethics/deontological
  if (inputs.q5Concerns && inputs.q5Concerns.includes("ethics")) {
    gaps.push({
      area: "ethical-framework",
      description:
        "Preoccupato per le implicazioni deontologiche. Il corso copre questo tema - enfatizzarlo.",
      severity: "minor",
    })
  }

  // Rule 6: Satisfaction = frustrated or little
  if (inputs.q2cSatisfaction === "not-at-all" || inputs.q2cSatisfaction === "little") {
    gaps.push({
      area: "effective-usage",
      description:
        "Usa l'AI ma non è soddisfatto dei risultati. Ha bisogno di imparare strategie per ottenere valore.",
      severity: "significant",
    })
  }

  // Rule 7: Rarely uses AI despite working with it
  if (inputs.q2a2Frequency === "rarely") {
    gaps.push({
      area: "habit-building",
      description:
        "Usa l'AI raramente nel lavoro. Ha bisogno di capire come integrarlo nelle attività quotidiane.",
      severity: "minor",
    })
  }

  // Rule 8: Struggles with prompts
  if (inputs.q2a3Challenges && inputs.q2a3Challenges.includes("prompts")) {
    gaps.push({
      area: "prompt-skills",
      description:
        "Ha difficoltà a formulare richieste efficaci all'AI. Ha bisogno di imparare tecniche di prompting.",
      severity: "significant",
    })
  }

  // Rule 9: Encountered hallucinations
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
    return obj.rankedOptionIds as string[]
  }
  return null
}
