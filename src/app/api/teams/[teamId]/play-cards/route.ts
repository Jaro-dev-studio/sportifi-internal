import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { playCardSchema } from "@/lib/validations"
import { logAuditEvent } from "@/services/audit-log"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = await params

    // Verify membership
    const membership = await prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a team member" }, { status: 403 })
    }

    console.log("[API] Fetching play cards for team:", teamId)

    const playCards = await prisma.playCard.findMany({
      where: { teamId, isArchived: false },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        playType: true,
        formation: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(playCards)
  } catch (error) {
    console.error("[API] Play cards fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = await params

    // Verify membership with edit permission
    const membership = await prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a team member" }, { status: 403 })
    }

    if (membership.role === "PLAYER") {
      return NextResponse.json({ error: "Players cannot create play cards" }, { status: 403 })
    }

    const body = await request.json()

    console.log("[API] Creating play card:", body.name)

    // Validate
    const validated = playCardSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const playCard = await prisma.playCard.create({
      data: {
        teamId,
        createdById: session.user.id,
        name: validated.data.name,
        description: validated.data.description,
        formation: validated.data.formation,
        playType: validated.data.playType,
        tags: validated.data.tags || [],
        data: validated.data.data,
        type: "MANUAL",
      },
    })

    await logAuditEvent({
      userId: session.user.id,
      teamId,
      action: "play_card.create",
      entityType: "PlayCard",
      entityId: playCard.id,
      metadata: { cardName: playCard.name },
    })

    console.log("[API] Play card created:", playCard.id)

    return NextResponse.json(playCard, { status: 201 })
  } catch (error) {
    console.error("[API] Play card create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
