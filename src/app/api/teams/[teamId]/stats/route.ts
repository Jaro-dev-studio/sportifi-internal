import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Verify user is member of team
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

    // Get stats
    const [totalVideos, totalPlayCards, totalPlays, recentActivity] = await Promise.all([
      prisma.videoAsset.count({ where: { teamId } }),
      prisma.playCard.count({ where: { teamId } }),
      prisma.play.count({
        where: {
          session: {
            video: { teamId },
          },
        },
      }),
      prisma.auditLog.findMany({
        where: { teamId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ])

    // Get recent videos
    const recentVideos = await prisma.videoAsset.findMany({
      where: { teamId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        originalName: true,
        status: true,
        createdAt: true,
      },
    })

    // Get recent play cards
    const recentPlayCards = await prisma.playCard.findMany({
      where: { teamId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      totalVideos,
      totalPlayCards,
      totalPlays,
      recentActivity: recentActivity.map((log: { id: string; action: string; createdAt: Date; user: { id: string; name: string | null; email: string } | null }) => ({
        id: log.id,
        type: log.action.split(".")[0],
        description: log.action,
        userName: log.user?.name || log.user?.email || "Unknown",
        timestamp: log.createdAt.toISOString(),
      })),
      recentVideos: recentVideos.map((v: { id: string; originalName: string; status: string; createdAt: Date }) => ({
        id: v.id,
        name: v.originalName,
        status: v.status,
        createdAt: v.createdAt.toISOString(),
      })),
      recentPlayCards: recentPlayCards.map((c: { id: string; name: string; type: string; createdAt: Date }) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        createdAt: c.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("[API] Stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
