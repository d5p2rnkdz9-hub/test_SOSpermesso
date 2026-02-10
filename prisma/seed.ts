import { PrismaClient, QuestionType, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seed database with Italian questions for AI screening survey (Phase 2)
 * Adaptive questionnaire with branching logic based on answers
 */
async function main() {
  console.log("Seeding database with adaptive questionnaire...")

  // Create or update the AI Screening Survey
  const survey = await prisma.survey.upsert({
    where: { id: "ai-screening-v1" },
    update: {
      title: "Questionario di screening AI",
      description: "Valutazione delle competenze e aspettative sull'uso dell'AI nella professione forense",
    },
    create: {
      id: "ai-screening-v1",
      title: "Questionario di screening AI",
      description: "Valutazione delle competenze e aspettative sull'uso dell'AI nella professione forense",
      isActive: true,
    },
  })

  console.log(`Survey created/updated: ${survey.id}`)

  // Delete existing data for clean seed (cascade from questions)
  // First delete answers, then questions
  const existingQuestions = await prisma.question.findMany({
    where: { surveyId: survey.id },
    select: { id: true },
  })

  if (existingQuestions.length > 0) {
    const questionIds = existingQuestions.map(q => q.id)
    await prisma.answer.deleteMany({
      where: { questionId: { in: questionIds } },
    })
    await prisma.question.deleteMany({
      where: { surveyId: survey.id },
    })
  }

  // Create adaptive questions with branching logic
  const questions = [
    // Q1: Awareness check (gates entire flow)
    {
      id: "q1-aware",
      surveyId: survey.id,
      order: 1,
      type: QuestionType.YES_NO,
      text: "Hai mai sentito parlare di strumenti di intelligenza artificiale come ChatGPT, Claude o Gemini?",
      description: undefined,
      options: [
        { id: "yes", label: "Sì", value: "true" }, // No nextQuestionId - continue to Q1a
        { id: "no", label: "No", value: "false", nextQuestionId: "q1b-whynot-aware" }, // Jump to Q1b
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: Prisma.JsonNull,
    },

    // Q1a: Tools tried (if aware)
    {
      id: "q1a-tools",
      surveyId: survey.id,
      order: 2,
      type: QuestionType.MULTIPLE_CHOICE,
      text: "Quali strumenti AI hai provato?",
      description: "Seleziona tutti quelli che conosci",
      options: [
        { id: "chatgpt", label: "ChatGPT", value: "chatgpt" },
        { id: "claude", label: "Claude", value: "claude" },
        { id: "gemini", label: "Gemini", value: "gemini" },
        { id: "copilot", label: "Copilot", value: "copilot" },
        { id: "legal-ai", label: "Banca dati giuridica con AI", value: "legal-ai" },
        { id: "other", label: "Altro", value: "other" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q1-aware", operator: "equals", value: "true" },
    },

    // Q1b: Why not aware (if not aware)
    {
      id: "q1b-whynot-aware",
      surveyId: survey.id,
      order: 3,
      type: QuestionType.SINGLE_CHOICE,
      text: "Come mai non li hai ancora provati?",
      description: undefined,
      options: [
        { id: "didnt-know", label: "Non sapevo cosa fossero", value: "didnt-know" },
        { id: "not-useful", label: "Non mi sembravano utili", value: "not-useful" },
        { id: "no-occasion", label: "Non ho avuto occasione", value: "no-occasion" },
        { id: "prefer-traditional", label: "Preferisco metodi tradizionali", value: "prefer-traditional" },
      ],
      isRequired: true,
      nextQuestionId: "q5-concerns", // Skip work section, jump to concerns
      showCondition: { questionId: "q1-aware", operator: "equals", value: "false" },
    },

    // Q2: Work usage (branch trigger)
    {
      id: "q2-work",
      surveyId: survey.id,
      order: 4,
      type: QuestionType.YES_NO,
      text: "Hai usato strumenti AI per il tuo lavoro legale?",
      description: "Anche solo per prove o esperimenti",
      options: [
        { id: "yes", label: "Sì", value: "true" }, // Continue to Q2a
        { id: "no", label: "No", value: "false" }, // Continue to Q2d
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q1-aware", operator: "equals", value: "true" },
    },

    // Q2a: Activities (if work=yes)
    {
      id: "q2a-activities",
      surveyId: survey.id,
      order: 5,
      type: QuestionType.MULTIPLE_CHOICE,
      text: "Per quali attività hai usato l'AI nel lavoro?",
      description: "Seleziona tutte le attività pertinenti",
      options: [
        { id: "research", label: "Ricerca giuridica", value: "research" },
        { id: "study", label: "Studio di documenti", value: "study" },
        { id: "writing", label: "Scrittura/redazione atti", value: "writing" },
        { id: "clients", label: "Comunicazione con clienti", value: "clients" },
        { id: "management", label: "Organizzazione studio", value: "management" },
        { id: "other", label: "Altro", value: "other" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "true" },
    },

    // Q2a2: Usage frequency (if work=yes) - experience depth
    {
      id: "q2a2-frequency",
      surveyId: survey.id,
      order: 6,
      type: QuestionType.SINGLE_CHOICE,
      text: "Con quale frequenza utilizzi strumenti AI nel tuo lavoro?",
      description: undefined,
      options: [
        { id: "daily", label: "Ogni giorno", value: "daily" },
        { id: "weekly", label: "Più volte a settimana", value: "weekly" },
        { id: "monthly", label: "Qualche volta al mese", value: "monthly" },
        { id: "rarely", label: "Raramente", value: "rarely" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "true" },
    },

    // Q2a3: Challenges encountered (if work=yes) - experience depth
    {
      id: "q2a3-challenges",
      surveyId: survey.id,
      order: 7,
      type: QuestionType.MULTIPLE_CHOICE,
      text: "Quali difficoltà hai incontrato nell'uso dell'AI per il lavoro legale?",
      description: "Seleziona tutte quelle pertinenti",
      options: [
        { id: "hallucinations", label: "Risposte imprecise o inventate (allucinazioni)", value: "hallucinations" },
        { id: "prompts", label: "Difficoltà a formulare richieste efficaci", value: "prompts" },
        { id: "relevance", label: "Risultati non rilevanti per il diritto italiano", value: "relevance" },
        { id: "confidentiality", label: "Preoccupazioni sulla riservatezza dei dati", value: "confidentiality" },
        { id: "time", label: "Richiede troppo tempo rispetto ai metodi tradizionali", value: "time" },
        { id: "none", label: "Nessuna difficoltà significativa", value: "none" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "true" },
    },

    // Q2b: Usage trend (if work=yes)
    {
      id: "q2b-trend",
      surveyId: survey.id,
      order: 8,
      type: QuestionType.SINGLE_CHOICE,
      text: "Come sta cambiando il tuo utilizzo dell'AI?",
      description: undefined,
      options: [
        { id: "increasing", label: "Lo uso sempre di più", value: "increasing" },
        { id: "stable", label: "Stabile", value: "stable" },
        { id: "decreasing", label: "Lo uso meno di prima", value: "decreasing" },
        { id: "stopped", label: "Ho smesso di usarlo", value: "stopped" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "true" },
    },

    // Q2c: Satisfaction (if work=yes)
    {
      id: "q2c-satisfaction",
      surveyId: survey.id,
      order: 9,
      type: QuestionType.SINGLE_CHOICE,
      text: "Quanto sei soddisfatto dei risultati ottenuti con l'AI?",
      description: undefined,
      options: [
        { id: "not-at-all", label: "Per niente", value: "not-at-all" },
        { id: "little", label: "Poco", value: "little" },
        { id: "enough", label: "Abbastanza", value: "enough" },
        { id: "very", label: "Molto", value: "very" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "true" },
    },

    // Q2d: Barriers (if work=no)
    {
      id: "q2d-barriers",
      surveyId: survey.id,
      order: 10,
      type: QuestionType.MULTIPLE_CHOICE,
      text: "Cosa ti ha frenato dall'usare l'AI nel lavoro?",
      description: "Seleziona i motivi principali",
      options: [
        { id: "privacy", label: "Dubbi sulla riservatezza dei dati", value: "privacy" },
        { id: "where-start", label: "Non saprei da dove iniziare", value: "where-start" },
        { id: "reliability", label: "Timore di risultati inaffidabili", value: "reliability" },
        { id: "not-useful", label: "Non credo sia utile per il mio lavoro", value: "not-useful" },
        { id: "no-time", label: "Non ho avuto tempo di provare", value: "no-time" },
      ],
      isRequired: true,
      nextQuestionId: "q4-expectations", // Skip confidence, jump to expectations
      showCondition: { questionId: "q2-work", operator: "equals", value: "false" },
    },

    // Q3: Confidence level (only for those who have used AI)
    {
      id: "q3-confidence",
      surveyId: survey.id,
      order: 11,
      type: QuestionType.SINGLE_CHOICE,
      text: "Come descriveresti il tuo livello di confidenza con gli strumenti AI?",
      description: undefined,
      options: [
        { id: "beginner", label: "Principiante - li provo ma non mi fido dei risultati", value: "beginner" },
        { id: "intermediate", label: "Intermedio - li uso regolarmente per alcuni compiti", value: "intermediate" },
        { id: "advanced", label: "Avanzato - li integro nel mio flusso di lavoro quotidiano", value: "advanced" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "true" },
    },

    // Q4: Expectations (everyone sees this)
    {
      id: "q4-expectations",
      surveyId: survey.id,
      order: 12,
      type: QuestionType.TEXT,
      text: "Cosa ti aspetti da questo corso?",
      description: "Le tue aspettative e obiettivi",
      options: Prisma.JsonNull,
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: Prisma.JsonNull,
    },

    // Q5: Concerns (everyone sees this)
    {
      id: "q5-concerns",
      surveyId: survey.id,
      order: 13,
      type: QuestionType.MULTIPLE_CHOICE,
      text: "Quali aspetti dell'AI ti preoccupano di più nel contesto legale?",
      description: "Seleziona tutte quelle rilevanti",
      options: [
        { id: "privacy", label: "Privacy e riservatezza dei dati dei clienti", value: "privacy" },
        { id: "errors", label: "Rischio di errori e allucinazioni", value: "errors" },
        { id: "ethics", label: "Implicazioni deontologiche", value: "ethics" },
        { id: "impact", label: "Impatto sulla professione a lungo termine", value: "impact" },
        { id: "dependency", label: "Dipendenza dalla tecnologia", value: "dependency" },
        { id: "none", label: "Nessuna preoccupazione particolare", value: "none" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: Prisma.JsonNull,
    },

    // Q6: Course priorities (everyone sees this)
    {
      id: "q6-priorities",
      surveyId: survey.id,
      order: 14,
      type: QuestionType.RANKING,
      text: "Su quali temi vorresti concentrarti durante il corso?",
      description: "Seleziona fino a 3 opzioni in ordine di priorità",
      options: [
        { id: "practical", label: "Uso pratico degli strumenti AI", value: "practical" },
        { id: "risks", label: "Rischi e limiti dell'AI", value: "risks" },
        { id: "ethics", label: "Aspetti deontologici", value: "ethics" },
        { id: "data", label: "Protezione dei dati", value: "data" },
        { id: "usecases", label: "Casi d'uso per avvocati", value: "usecases" },
        { id: "prompts", label: "Scrivere prompt efficaci", value: "prompts" },
        { id: "other", label: "Altro", value: "other" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: Prisma.JsonNull,
    },
  ]

  // Create all questions
  for (const question of questions) {
    await prisma.question.create({
      data: question,
    })
    console.log(`Question created: ${question.id} - ${question.text}`)
  }

  console.log(`\nSeeding complete! Created ${questions.length} questions.`)
  console.log("\nBranching paths:")
  console.log("1. Not aware: Q1(No) → Q1b → Q5 → Q6 (4 questions)")
  console.log("2. Aware, not working: Q1(Yes) → Q1a → Q2(No) → Q2d → Q4 → Q5 → Q6 (7 questions)")
  console.log("3. Aware, working: Q1(Yes) → Q1a → Q2(Yes) → Q2a → Q2a2 → Q2a3 → Q2b → Q2c → Q3 → Q4 → Q5 → Q6 (12 questions)")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
