import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/session/[resumeToken] - Resume existing session
 * Returns session with all questions and existing answers
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: resumeToken } = await params

    // Find session by resumeToken
    const session = await prisma.session.findUnique({
      where: { resumeToken },
      include: {
        survey: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
        answers: true,
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Check if session is complete
    if (session.completedAt) {
      return NextResponse.json({
        sessionId: session.id,
        resumeToken: session.resumeToken,
        isComplete: true,
        feedback: session.feedback,
        coursePrompts: session.coursePrompts,
      })
    }

    // Transform questions for client
    const clientQuestions = session.survey.questions.map((q) => ({
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

    // Transform answers for client
    const clientAnswers = session.answers.map((a) => ({
      questionId: a.questionId,
      value: a.value,
    }))

    return NextResponse.json({
      sessionId: session.id,
      resumeToken: session.resumeToken,
      questions: clientQuestions,
      currentIndex: session.currentIndex,
      answers: clientAnswers,
      isComplete: false,
    })
  } catch (error) {
    console.error("Failed to resume session:", error)
    return NextResponse.json(
      { error: "Failed to resume session" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/session/[resumeToken] - Update session (complete quiz)
 * Body: { complete: boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: resumeToken } = await params
    const body = await request.json()
    const { complete } = body

    // Find session
    const session = await prisma.session.findUnique({
      where: { resumeToken },
    })

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    if (complete) {
      // Mark session as complete
      const updatedSession = await prisma.session.update({
        where: { resumeToken },
        data: {
          completedAt: new Date(),
        },
      })

      return NextResponse.json({
        sessionId: updatedSession.id,
        isComplete: true,
        completedAt: updatedSession.completedAt,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update session:", error)
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    )
  }
}
