import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/db"

/**
 * POST /api/feedback
 * Generate personalized AI feedback for completed quiz session
 * Body: { sessionId: string }
 * Returns: { feedback: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY not configured")
      return NextResponse.json({
        feedback: `Grazie per aver completato il questionario!

Le tue risposte sono state registrate con successo. Il nostro sistema di feedback personalizzato non è attualmente disponibile, ma il team formativo analizzerà le tue risposte per personalizzare il corso in base alle tue esigenze.

Ti aspettiamo al corso "AI e professione forense" di DigiCrazy Lab!`,
      })
    }

    // Fetch session with all answers and questions
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // If feedback already exists, return it
    if (session.feedback) {
      return NextResponse.json({ feedback: session.feedback })
    }

    // Check if session is completed
    if (!session.completedAt) {
      return NextResponse.json(
        { error: "Quiz not completed" },
        { status: 400 }
      )
    }

    // Build context from answers
    const answersContext = buildAnswersContext(session.answers)

    // Call Claude Haiku to generate feedback
    const anthropic = new Anthropic()

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Sei un assistente per un corso di formazione sull'AI per avvocati italiani.

Basandoti sulle risposte del questionario di pre-valutazione, genera un feedback personalizzato in italiano.

Il feedback deve:
- Essere incoraggiante e professionale
- Riconoscere il loro attuale livello di esperienza con l'AI
- Collegare le loro aspettative (domanda sulle aspettative) con cosa impareranno nel corso
- Affrontare brevemente le loro preoccupazioni rassicurandoli
- Suggerire 2-3 aree specifiche su cui concentrarsi durante il corso
- Essere lungo circa 200-300 parole
- NON assegnare un "livello" - questo verrà fatto nel modulo successivo

Risposte del partecipante:
${answersContext}

Genera il feedback:`,
        },
      ],
    })

    // Extract the text from the response
    const feedbackText =
      message.content[0].type === "text"
        ? message.content[0].text
        : "Feedback non disponibile"

    // Save feedback to session
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        feedback: feedbackText,
      },
    })

    return NextResponse.json({ feedback: feedbackText })
  } catch (error) {
    console.error("Failed to generate feedback:", error)

    // Return graceful fallback message
    return NextResponse.json({
      feedback: `Grazie per aver completato il questionario!

Le tue risposte sono state registrate con successo. Purtroppo si è verificato un problema tecnico nella generazione del feedback personalizzato.

Il team formativo analizzerà comunque le tue risposte per personalizzare il corso in base alle tue esigenze e aspettative.

Ti aspettiamo al corso "AI e professione forense" di DigiCrazy Lab!`,
    })
  }
}

/**
 * Build a human-readable context from session answers
 */
function buildAnswersContext(
  answers: Array<{
    question: {
      id: string
      text: string
      options: unknown
      type: string
    }
    value: unknown
  }>
): string {
  const lines: string[] = []

  for (const answer of answers) {
    const { question, value } = answer
    const answerValue = value as Record<string, unknown>

    let formattedAnswer = ""

    // Format based on answer type
    if ("selectedValues" in answerValue && Array.isArray(answerValue.selectedValues)) {
      // Multiple choice - map values to labels
      const options = question.options as Array<{ value: string; label: string }> | null
      if (options) {
        const selectedLabels = (answerValue.selectedValues as string[]).map((val) => {
          const option = options.find((o) => o.value === val)
          return option ? option.label : val
        })
        formattedAnswer = selectedLabels.join(", ")
      } else {
        formattedAnswer = (answerValue.selectedValues as string[]).join(", ")
      }
    } else if ("selectedValue" in answerValue) {
      // Single choice / Yes-No / Profile
      const options = question.options as Array<{ value: string; label: string; description?: string }> | null
      if (options) {
        const option = options.find((o) => o.value === answerValue.selectedValue)
        if (option) {
          formattedAnswer = option.description || option.label
        } else {
          // Handle Yes/No
          if (answerValue.selectedValue === "true") {
            formattedAnswer = "Sì"
          } else if (answerValue.selectedValue === "false") {
            formattedAnswer = "No"
          } else {
            formattedAnswer = answerValue.selectedValue as string
          }
        }
      } else {
        formattedAnswer = answerValue.selectedValue as string
      }
    } else if ("text" in answerValue) {
      // Text answer
      formattedAnswer = answerValue.text as string
    } else if ("rankedOptionIds" in answerValue && Array.isArray(answerValue.rankedOptionIds)) {
      // Ranking
      const options = question.options as Array<{ id: string; label: string }> | null
      if (options) {
        const rankedLabels = (answerValue.rankedOptionIds as string[]).map((id, index) => {
          const option = options.find((o) => o.id === id)
          return `${index + 1}. ${option ? option.label : id}`
        })
        formattedAnswer = rankedLabels.join(", ")
      } else {
        formattedAnswer = (answerValue.rankedOptionIds as string[]).join(", ")
      }
    }

    if (formattedAnswer) {
      lines.push(`**${question.text}**\n${formattedAnswer}\n`)
    }
  }

  return lines.join("\n")
}
