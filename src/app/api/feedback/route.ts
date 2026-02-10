import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/db"
import { evaluateResponses } from "@/lib/rules-engine"
import type { CoursePrompt } from "@/types/quiz"
import { Prisma } from "@prisma/client"

/**
 * POST /api/feedback
 * Generate personalized AI feedback for completed quiz session
 * Body: { sessionId: string }
 * Returns: { feedback: string, coursePrompts: CoursePrompt[] }
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
        coursePrompts: [],
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

    // If feedback already exists, return it with course prompts
    if (session.feedback) {
      return NextResponse.json({
        feedback: session.feedback,
        coursePrompts: (session.coursePrompts as CoursePrompt[] | null) || [],
      })
    }

    // Check if session is completed
    if (!session.completedAt) {
      return NextResponse.json(
        { error: "Quiz not completed" },
        { status: 400 }
      )
    }

    // Evaluate responses using rules engine
    const rulesResult = evaluateResponses(
      session.answers.map((a) => ({
        questionId: a.questionId,
        value: a.value,
        questionText: a.question.text,
        questionOptions: a.question.options,
      }))
    )

    // Build enhanced prompt using rules result
    const claudePrompt = buildEnhancedPrompt(rulesResult)

    // Call Claude Haiku to generate feedback
    const anthropic = new Anthropic()

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: claudePrompt,
        },
      ],
    })

    // Extract the text from the response
    const responseText =
      message.content[0].type === "text"
        ? message.content[0].text
        : "Feedback non disponibile"

    // Parse JSON response with fallback
    let feedbackText = responseText
    let coursePrompts: CoursePrompt[] = []
    let facilitatorNotes = ""

    try {
      // Strip markdown code blocks if present (```json ... ```)
      let jsonText = responseText.trim()
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim()
      }
      const parsed = JSON.parse(jsonText)
      feedbackText = parsed.feedback || responseText
      coursePrompts = parsed.coursePrompts || []
      facilitatorNotes = parsed.facilitatorNotes || ""
    } catch {
      // If parsing fails, try to extract JSON object from the text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          feedbackText = parsed.feedback || responseText
          coursePrompts = parsed.coursePrompts || []
          facilitatorNotes = parsed.facilitatorNotes || ""
        } catch {
          feedbackText = responseText
          coursePrompts = []
          facilitatorNotes = ""
        }
      } else {
        feedbackText = responseText
        coursePrompts = []
        facilitatorNotes = ""
      }
    }

    // Save feedback, course prompts, and facilitator notes to session
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        feedback: feedbackText,
        coursePrompts: coursePrompts as unknown as Prisma.InputJsonValue,
        facilitatorNotes: facilitatorNotes,
      },
    })

    // Return to client (do NOT expose facilitatorNotes)
    return NextResponse.json({
      feedback: feedbackText,
      coursePrompts: coursePrompts,
    })
  } catch (error) {
    console.error("Failed to generate feedback:", error)

    // Return graceful fallback message
    return NextResponse.json({
      feedback: `Grazie per aver completato il questionario!

Le tue risposte sono state registrate con successo. Purtroppo si è verificato un problema tecnico nella generazione del feedback personalizzato.

Il team formativo analizzerà comunque le tue risposte per personalizzare il corso in base alle tue esigenze e aspettative.

Ti aspettiamo al corso "AI e professione forense" di DigiCrazy Lab!`,
      coursePrompts: [],
    })
  }
}

/**
 * Build enhanced Claude prompt using rules engine analysis
 */
function buildEnhancedPrompt(rulesResult: ReturnType<typeof evaluateResponses>): string {
  const gapsText =
    rulesResult.gaps.length > 0
      ? rulesResult.gaps.map((g) => `- ${g.area} (${g.severity}): ${g.description}`).join("\n")
      : "Nessun gap significativo rilevato."

  return `Sei un assistente per un corso di formazione sull'AI per avvocati italiani.

Basandoti sull'analisi del questionario di pre-valutazione, genera un feedback personalizzato in italiano.

**PROFILO PARTECIPANTE:**
- Livello di consapevolezza: ${rulesResult.awarenessLevel}
- Percorso: ${rulesResult.pathTaken}
- Strumenti usati: ${rulesResult.toolsUsed.join(", ") || "Nessuno"}
- Attività lavorative: ${rulesResult.workActivities.join(", ") || "Nessuna"}
- Soddisfazione: ${rulesResult.satisfaction || "N/A"}
- Barriere: ${rulesResult.barriers.join(", ") || "Nessuna"}
- Preoccupazioni: ${rulesResult.concerns.join(", ") || "Nessuna"}
- Aspettative: ${rulesResult.expectations || "Non specificate"}

**GAP RILEVATI:**
${gapsText}

**COMPITO:**
Genera una risposta JSON con questa struttura:
{
  "feedback": "...(feedback principale)...",
  "coursePrompts": [{"text": "...", "category": "..."}],
  "facilitatorNotes": "..."
}

**FEEDBACK PRINCIPALE:**
- 1 paragrafo breve (60-80 parole massimo)
- Tono diretto e incoraggiante, dai del "tu"
- Riconosci brevemente il loro livello e collega con il corso
- NON assegnare un "livello" o score
- NON usare liste puntate - solo prosa
- NON essere prolisso o ripetitivo

**COURSE PROMPTS:**
- Genera SOLO se ci sono gap significativi (severity="significant")
- Massimo 2 prompts
- Phrasing: "Durante il corso, chiedi ai docenti di..." o "Presta attenzione quando si parlerà di..."
- Azionabili e specifici
- Category: usa l'area del gap (es: "practical-application", "hands-on-practice")
- Se non ci sono gap significativi, restituisci array vuoto

**FACILITATOR NOTES:**
- 1 paragrafo breve (50-80 parole)
- Riassunto per l'istruttore su cosa questo partecipante ha bisogno
- Menziona eventuali punti di attenzione o aree su cui concentrarsi durante il corso
- In italiano

Restituisci SOLO il JSON, senza altri testi.`
}
