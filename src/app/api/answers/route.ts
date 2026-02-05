import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * POST /api/answers - Save or update answer
 * Body: { sessionId, questionId, value } or { sessionId, updateIndex }
 * Returns: { success: true }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, questionId, value, updateIndex } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      )
    }

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // If only updating currentIndex
    if (typeof updateIndex === "number") {
      await prisma.session.update({
        where: { id: sessionId },
        data: { currentIndex: updateIndex },
      })

      return NextResponse.json({ success: true })
    }

    // Saving an answer
    if (!questionId || value === undefined) {
      return NextResponse.json(
        { error: "questionId and value are required" },
        { status: 400 }
      )
    }

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    // Upsert answer (create or update)
    await prisma.answer.upsert({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
      update: {
        value,
        answeredAt: new Date(),
      },
      create: {
        sessionId,
        questionId,
        value,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save answer:", error)
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    )
  }
}
