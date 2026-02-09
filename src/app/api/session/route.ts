import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * POST /api/session - Create new quiz session
 * Body: { surveyId: string }
 * Returns: { sessionId, resumeToken, questions, currentIndex }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { surveyId } = body

    if (!surveyId) {
      return NextResponse.json(
        { error: "surveyId is required" },
        { status: 400 }
      )
    }

    // Check if survey exists
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found" },
        { status: 404 }
      )
    }

    // Create new session
    const session = await prisma.session.create({
      data: {
        surveyId,
        currentIndex: 0,
      },
    })

    // Transform questions for client
    const clientQuestions = survey.questions.map((q) => ({
      id: q.id,
      surveyId: q.surveyId,
      order: q.order,
      type: q.type,
      text: q.text,
      description: q.description,
      options: q.options,
      isRequired: q.isRequired,
      nextQuestionId: q.nextQuestionId,
      showCondition: q.showCondition,
      createdAt: q.createdAt,
    }))

    return NextResponse.json({
      sessionId: session.id,
      resumeToken: session.resumeToken,
      questions: clientQuestions,
      currentIndex: 0,
    })
  } catch (error) {
    console.error("Failed to create session:", error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Failed to create session", details: message },
      { status: 500 }
    )
  }
}
