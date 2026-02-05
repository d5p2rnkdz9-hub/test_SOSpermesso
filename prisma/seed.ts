import { PrismaClient, QuestionType, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seed database with Italian questions for AI screening survey
 * Based on CONTEXT.md specifications for "AI e professione forense" course
 */
async function main() {
  console.log("Seeding database...")

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

  // Delete existing questions for clean seed
  await prisma.question.deleteMany({
    where: { surveyId: survey.id },
  })

  // Create questions based on CONTEXT.md
  const questions = [
    // Question 1: AI tools used
    {
      id: "q1-tools",
      surveyId: survey.id,
      order: 1,
      type: QuestionType.MULTIPLE_CHOICE,
      text: "Quali strumenti AI hai usato?",
      description: "Seleziona tutti quelli che hai provato almeno una volta",
      options: [
        { id: "chatgpt", label: "ChatGPT", value: "chatgpt" },
        { id: "claude", label: "Claude", value: "claude" },
        { id: "gemini", label: "Gemini", value: "gemini" },
        { id: "copilot", label: "Copilot", value: "copilot" },
        { id: "legal-ai", label: "Banca dati giuridica con AI", value: "legal-ai" },
        { id: "none", label: "Nessuno", value: "none" },
        { id: "other", label: "Altro", value: "other" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: Prisma.JsonNull,
    },
    // Question 2: Used AI for legal work (branch trigger)
    {
      id: "q2-work",
      surveyId: survey.id,
      order: 2,
      type: QuestionType.YES_NO,
      text: "Hai usato AI per il lavoro legale?",
      description: "Anche solo per prove o esperimenti",
      options: [
        { id: "yes", label: "Si", value: "true" },
        { id: "no", label: "No", value: "false" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: Prisma.JsonNull,
    },
    // Question 2a: How used (if YES)
    {
      id: "q2a-howused",
      surveyId: survey.id,
      order: 3,
      type: QuestionType.MULTIPLE_CHOICE,
      text: "Per cosa hai usato l'AI nel lavoro?",
      description: "Seleziona tutte le attivita pertinenti",
      options: [
        { id: "research", label: "Ricerca giuridica", value: "research" },
        { id: "study", label: "Studio di documenti", value: "study" },
        { id: "writing", label: "Scrittura/redazione", value: "writing" },
        { id: "other", label: "Altro", value: "other" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "true" },
    },
    // Question 2b: Usage trend (if YES)
    {
      id: "q2b-trend",
      surveyId: survey.id,
      order: 4,
      type: QuestionType.SINGLE_CHOICE,
      text: "Come sta cambiando il tuo utilizzo?",
      description: "Rispetto a quando hai iniziato",
      options: [
        { id: "increasing", label: "In aumento", value: "increasing" },
        { id: "stable", label: "Stabile", value: "stable" },
        { id: "decreasing", label: "In diminuzione", value: "decreasing" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "true" },
    },
    // Question 2c: Satisfaction (if YES)
    {
      id: "q2c-satisfaction",
      surveyId: survey.id,
      order: 5,
      type: QuestionType.SINGLE_CHOICE,
      text: "Come ti trovi con questi strumenti?",
      description: "La tua esperienza complessiva",
      options: [
        { id: "frustrated", label: "Frustrato", value: "frustrated" },
        { id: "neutral", label: "Neutrale", value: "neutral" },
        { id: "satisfied", label: "Soddisfatto", value: "satisfied" },
        { id: "enthusiastic", label: "Entusiasta", value: "enthusiastic" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "true" },
    },
    // Question 2d: Why not (if NO)
    {
      id: "q2d-whynot",
      surveyId: survey.id,
      order: 6,
      type: QuestionType.MULTIPLE_CHOICE,
      text: "Perche non hai usato AI nel lavoro?",
      description: "Seleziona i motivi principali",
      options: [
        { id: "privacy", label: "Preoccupazioni sulla privacy", value: "privacy" },
        { id: "time", label: "Non ho avuto tempo", value: "time" },
        { id: "errors", label: "Paura di commettere errori", value: "errors" },
        { id: "no-value", label: "Non ne vedo il valore", value: "no-value" },
        { id: "other", label: "Altro", value: "other" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: { questionId: "q2-work", operator: "equals", value: "false" },
    },
    // Question 3: Profile selection
    {
      id: "q3-profile",
      surveyId: survey.id,
      order: 7,
      type: QuestionType.PROFILE_SELECT,
      text: "Quale profilo ti descrive meglio?",
      description: "Scegli quello che si avvicina di piu alla tua situazione",
      options: [
        {
          id: "profile-a",
          label: "Profilo A",
          value: "basic",
          description: "Uso strumenti base - email, Word, navigazione web. I nuovi software richiedono tempo per imparare.",
        },
        {
          id: "profile-b",
          label: "Profilo B",
          value: "comfortable",
          description: "Sono a mio agio con la tecnologia - uso strumenti cloud, imparo nuove app velocemente, risolvo problemi di base.",
        },
        {
          id: "profile-c",
          label: "Profilo C",
          value: "confident",
          description: "Sono confidente con la tecnologia - adotto rapidamente nuovi strumenti, personalizzo il mio workflow, sono curioso di capire come funzionano le cose.",
        },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: Prisma.JsonNull,
    },
    // Question 4: Expectations
    {
      id: "q4-expectations",
      surveyId: survey.id,
      order: 8,
      type: QuestionType.TEXT,
      text: "Cosa speri di imparare da questo corso?",
      description: "Le tue aspettative e obiettivi",
      options: Prisma.JsonNull,
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: Prisma.JsonNull,
    },
    // Question 5: Concerns
    {
      id: "q5-concerns",
      surveyId: survey.id,
      order: 9,
      type: QuestionType.MULTIPLE_CHOICE,
      text: "Quali sono le tue preoccupazioni sull'uso dell'AI?",
      description: "Seleziona tutte quelle rilevanti per te",
      options: [
        { id: "privacy", label: "Privacy e riservatezza dei dati", value: "privacy" },
        { id: "ethics", label: "Implicazioni etiche e deontologiche", value: "ethics" },
        { id: "reliability", label: "Affidabilita e accuratezza", value: "reliability" },
        { id: "other", label: "Altro (con campo testo opzionale)", value: "other" },
      ],
      isRequired: true,
      nextQuestionId: undefined,
      showCondition: Prisma.JsonNull,
    },
    // Question 6: Use cases ranking
    {
      id: "q6-usecases",
      surveyId: survey.id,
      order: 10,
      type: QuestionType.RANKING,
      text: "Per cosa vorresti usare l'AI nel tuo lavoro?",
      description: "Seleziona le 3 attivita piu importanti per te (in ordine di priorita)",
      options: [
        { id: "research", label: "Ricerca giuridica", value: "research" },
        { id: "writing", label: "Scrittura documenti", value: "writing" },
        { id: "contracts", label: "Revisione contratti", value: "contracts" },
        { id: "clients", label: "Comunicazione con i clienti", value: "clients" },
        { id: "management", label: "Gestione dello studio", value: "management" },
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
