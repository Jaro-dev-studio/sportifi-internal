import { PrismaClient } from "@prisma/client/default"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { hash } from "bcryptjs"

// Create Prisma client with adapter for Prisma 7.x
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is required")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Import enums from the generated client
type TeamRole = "COACH" | "ASSISTANT" | "PLAYER"
type VideoStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED"
type PlayCardType = "ACTUAL" | "COACHING" | "MANUAL"

async function main() {
  console.log("Seeding database...")

  // Create demo users
  const coachPassword = await hash("coach123!", 12)
  const assistantPassword = await hash("assistant123!", 12)
  const playerPassword = await hash("player123!", 12)

  const coach = await prisma.user.upsert({
    where: { email: "coach@demo.com" },
    update: {},
    create: {
      email: "coach@demo.com",
      name: "Coach Smith",
      passwordHash: coachPassword,
      emailVerified: new Date(),
    },
  })

  const assistant = await prisma.user.upsert({
    where: { email: "assistant@demo.com" },
    update: {},
    create: {
      email: "assistant@demo.com",
      name: "Coach Johnson",
      passwordHash: assistantPassword,
      emailVerified: new Date(),
    },
  })

  const player = await prisma.user.upsert({
    where: { email: "player@demo.com" },
    update: {},
    create: {
      email: "player@demo.com",
      name: "Mike Williams",
      passwordHash: playerPassword,
      emailVerified: new Date(),
    },
  })

  console.log("Created users:", { coach: coach.id, assistant: assistant.id, player: player.id })

  // Create demo team
  const team = await prisma.team.upsert({
    where: { slug: "riverside-eagles" },
    update: {},
    create: {
      name: "Riverside Eagles",
      slug: "riverside-eagles",
      description: "Riverside High School Football Team",
    },
  })

  console.log("Created team:", team.id)

  // Create team memberships
  await prisma.teamMembership.upsert({
    where: { userId_teamId: { userId: coach.id, teamId: team.id } },
    update: {},
    create: {
      userId: coach.id,
      teamId: team.id,
      role: "COACH" as TeamRole,
      permissions: {
        canEdit: true,
        canInvite: true,
        canDelete: true,
        canUpload: true,
        canAnalyze: true,
      },
    },
  })

  await prisma.teamMembership.upsert({
    where: { userId_teamId: { userId: assistant.id, teamId: team.id } },
    update: {},
    create: {
      userId: assistant.id,
      teamId: team.id,
      role: "ASSISTANT" as TeamRole,
      permissions: {
        canEdit: true,
        canInvite: false,
        canDelete: false,
        canUpload: true,
        canAnalyze: true,
      },
    },
  })

  await prisma.teamMembership.upsert({
    where: { userId_teamId: { userId: player.id, teamId: team.id } },
    update: {},
    create: {
      userId: player.id,
      teamId: team.id,
      role: "PLAYER" as TeamRole,
    },
  })

  console.log("Created team memberships")

  // Create playbook folders
  const offenseFolder = await prisma.playbookFolder.upsert({
    where: { id: "offense-folder" },
    update: {},
    create: {
      id: "offense-folder",
      teamId: team.id,
      name: "Offense",
      playType: "offense",
      sortOrder: 0,
    },
  })

  const defenseFolder = await prisma.playbookFolder.upsert({
    where: { id: "defense-folder" },
    update: {},
    create: {
      id: "defense-folder",
      teamId: team.id,
      name: "Defense",
      playType: "defense",
      sortOrder: 1,
    },
  })

  const specialFolder = await prisma.playbookFolder.upsert({
    where: { id: "special-folder" },
    update: {},
    create: {
      id: "special-folder",
      teamId: team.id,
      name: "Special Teams",
      playType: "special",
      sortOrder: 2,
    },
  })

  console.log("Created playbook folders")

  // Create sample game
  const game = await prisma.game.upsert({
    where: { id: "demo-game-1" },
    update: {},
    create: {
      id: "demo-game-1",
      teamId: team.id,
      name: "Week 5 vs Central High",
      opponent: "Central High",
      gameDate: new Date(Date.now() - 86400000 * 7),
      location: "Home",
      result: "W 28-14",
    },
  })

  console.log("Created game:", game.id)

  // Create sample video
  const video = await prisma.videoAsset.upsert({
    where: { id: "demo-video-1" },
    update: {},
    create: {
      id: "demo-video-1",
      teamId: team.id,
      uploaderId: coach.id,
      gameId: game.id,
      status: "READY" as VideoStatus,
      storageKey: "teams/demo/videos/game-film-1.mp4",
      originalName: "Week 5 Game Film.mp4",
      mimeType: "video/mp4",
      fileSize: 524288000, // 500MB
      duration: 3600, // 1 hour
      width: 1920,
      height: 1080,
    },
  })

  console.log("Created video:", video.id)

  // Create sample play cards
  const slantRightData = {
    formation: "Shotgun",
    playType: "offense",
    players: [
      { id: "p1", jerseyNumber: "12", label: "QB", teamSide: "offense", startPosition: { x: 50, y: 62 }, path: [], color: "#3b82f6" },
      { id: "p2", jerseyNumber: "25", label: "RB", teamSide: "offense", startPosition: { x: 45, y: 68 }, path: [], color: "#3b82f6" },
      { id: "p3", jerseyNumber: "88", label: "WR1", teamSide: "offense", startPosition: { x: 15, y: 55 }, path: [{ x: 25, y: 45, timestamp: 1 }], color: "#3b82f6" },
      { id: "p4", jerseyNumber: "81", label: "WR2", teamSide: "offense", startPosition: { x: 85, y: 55 }, path: [{ x: 75, y: 45, timestamp: 1 }], color: "#3b82f6" },
      { id: "p5", jerseyNumber: "72", label: "LT", teamSide: "offense", startPosition: { x: 38, y: 55 }, path: [], color: "#3b82f6" },
      { id: "p6", jerseyNumber: "65", label: "LG", teamSide: "offense", startPosition: { x: 44, y: 55 }, path: [], color: "#3b82f6" },
      { id: "p7", jerseyNumber: "52", label: "C", teamSide: "offense", startPosition: { x: 50, y: 55 }, path: [], color: "#3b82f6" },
      { id: "p8", jerseyNumber: "68", label: "RG", teamSide: "offense", startPosition: { x: 56, y: 55 }, path: [], color: "#3b82f6" },
      { id: "p9", jerseyNumber: "75", label: "RT", teamSide: "offense", startPosition: { x: 62, y: 55 }, path: [], color: "#3b82f6" },
      { id: "p10", jerseyNumber: "85", label: "TE", teamSide: "offense", startPosition: { x: 68, y: 55 }, path: [], color: "#3b82f6" },
    ],
    routes: [
      { id: "r1", startPosition: { x: 15, y: 55 }, endPosition: { x: 30, y: 40 }, type: "solid", color: "#fbbf24", label: "Slant" },
      { id: "r2", startPosition: { x: 85, y: 55 }, endPosition: { x: 70, y: 40 }, type: "solid", color: "#fbbf24", label: "Slant" },
    ],
    annotations: [],
    fieldConfig: { showYardLines: true, showHashMarks: true, fieldSection: "full" },
  }

  const playCard1 = await prisma.playCard.upsert({
    where: { id: "demo-playcard-1" },
    update: {},
    create: {
      id: "demo-playcard-1",
      teamId: team.id,
      createdById: coach.id,
      type: "MANUAL" as PlayCardType,
      name: "Slant Right",
      description: "Quick slant routes to both outside receivers",
      formation: "Shotgun",
      playType: "offense",
      tags: ["passing", "quick", "slant"],
      data: slantRightData,
    },
  })

  const zoneReadData = {
    formation: "Shotgun",
    playType: "offense",
    players: [
      { id: "p1", jerseyNumber: "12", label: "QB", teamSide: "offense", startPosition: { x: 50, y: 62 }, path: [{ x: 55, y: 55, timestamp: 1 }], color: "#3b82f6" },
      { id: "p2", jerseyNumber: "25", label: "RB", teamSide: "offense", startPosition: { x: 45, y: 62 }, path: [{ x: 40, y: 50, timestamp: 1 }], color: "#3b82f6" },
    ],
    routes: [
      { id: "r1", startPosition: { x: 50, y: 62 }, endPosition: { x: 60, y: 50 }, type: "dashed", color: "#22c55e", label: "Read" },
      { id: "r2", startPosition: { x: 45, y: 62 }, endPosition: { x: 35, y: 45 }, type: "solid", color: "#22c55e", label: "Zone" },
    ],
    annotations: [],
    fieldConfig: { showYardLines: true, showHashMarks: true, fieldSection: "full" },
  }

  const playCard2 = await prisma.playCard.upsert({
    where: { id: "demo-playcard-2" },
    update: {},
    create: {
      id: "demo-playcard-2",
      teamId: team.id,
      createdById: coach.id,
      type: "MANUAL" as PlayCardType,
      name: "Zone Read Left",
      description: "Zone read option to the left side",
      formation: "Shotgun",
      playType: "offense",
      tags: ["run", "zone", "read option"],
      data: zoneReadData,
    },
  })

  const cover3Data = {
    formation: "4-3",
    playType: "defense",
    players: [
      { id: "d1", jerseyNumber: "55", label: "MLB", teamSide: "defense", startPosition: { x: 50, y: 35 }, path: [], color: "#ef4444" },
      { id: "d2", jerseyNumber: "52", label: "WLB", teamSide: "defense", startPosition: { x: 35, y: 35 }, path: [], color: "#ef4444" },
      { id: "d3", jerseyNumber: "58", label: "SLB", teamSide: "defense", startPosition: { x: 65, y: 35 }, path: [], color: "#ef4444" },
      { id: "d4", jerseyNumber: "99", label: "DE", teamSide: "defense", startPosition: { x: 30, y: 45 }, path: [], color: "#ef4444" },
      { id: "d5", jerseyNumber: "95", label: "DT", teamSide: "defense", startPosition: { x: 42, y: 45 }, path: [], color: "#ef4444" },
      { id: "d6", jerseyNumber: "93", label: "DT", teamSide: "defense", startPosition: { x: 58, y: 45 }, path: [], color: "#ef4444" },
      { id: "d7", jerseyNumber: "91", label: "DE", teamSide: "defense", startPosition: { x: 70, y: 45 }, path: [], color: "#ef4444" },
      { id: "d8", jerseyNumber: "21", label: "CB", teamSide: "defense", startPosition: { x: 15, y: 40 }, path: [], color: "#ef4444" },
      { id: "d9", jerseyNumber: "24", label: "CB", teamSide: "defense", startPosition: { x: 85, y: 40 }, path: [], color: "#ef4444" },
      { id: "d10", jerseyNumber: "29", label: "FS", teamSide: "defense", startPosition: { x: 50, y: 20 }, path: [], color: "#ef4444" },
      { id: "d11", jerseyNumber: "32", label: "SS", teamSide: "defense", startPosition: { x: 60, y: 28 }, path: [], color: "#ef4444" },
    ],
    routes: [],
    annotations: [
      { id: "a1", type: "text", position: { x: 25, y: 15 }, text: "Deep 1/3", color: "#ffffff" },
      { id: "a2", type: "text", position: { x: 50, y: 15 }, text: "Deep 1/3", color: "#ffffff" },
      { id: "a3", type: "text", position: { x: 75, y: 15 }, text: "Deep 1/3", color: "#ffffff" },
    ],
    fieldConfig: { showYardLines: true, showHashMarks: true, fieldSection: "full" },
  }

  const playCard3 = await prisma.playCard.upsert({
    where: { id: "demo-playcard-3" },
    update: {},
    create: {
      id: "demo-playcard-3",
      teamId: team.id,
      createdById: coach.id,
      type: "MANUAL" as PlayCardType,
      name: "Cover 3 Zone",
      description: "Basic Cover 3 zone defense alignment",
      formation: "4-3",
      playType: "defense",
      tags: ["zone", "coverage", "base"],
      data: cover3Data,
    },
  })

  console.log("Created play cards:", { playCard1: playCard1.id, playCard2: playCard2.id, playCard3: playCard3.id })

  // Add play cards to playbook
  await prisma.playbookItem.upsert({
    where: { folderId_playCardId: { folderId: offenseFolder.id, playCardId: playCard1.id } },
    update: {},
    create: {
      folderId: offenseFolder.id,
      playCardId: playCard1.id,
      sortOrder: 0,
    },
  })

  await prisma.playbookItem.upsert({
    where: { folderId_playCardId: { folderId: offenseFolder.id, playCardId: playCard2.id } },
    update: {},
    create: {
      folderId: offenseFolder.id,
      playCardId: playCard2.id,
      sortOrder: 1,
    },
  })

  await prisma.playbookItem.upsert({
    where: { folderId_playCardId: { folderId: defenseFolder.id, playCardId: playCard3.id } },
    update: {},
    create: {
      folderId: defenseFolder.id,
      playCardId: playCard3.id,
      sortOrder: 0,
    },
  })

  console.log("Added play cards to playbook")

  // Create sample roster
  const rosterPlayers = [
    { jerseyNumber: "12", name: "John Davis", position: "QB", year: "Senior" },
    { jerseyNumber: "25", name: "Marcus Johnson", position: "RB", year: "Junior" },
    { jerseyNumber: "88", name: "Tyler Smith", position: "WR", year: "Senior" },
    { jerseyNumber: "81", name: "Chris Williams", position: "WR", year: "Junior" },
    { jerseyNumber: "85", name: "Brandon Lee", position: "TE", year: "Senior" },
    { jerseyNumber: "72", name: "David Brown", position: "LT", year: "Senior" },
    { jerseyNumber: "65", name: "James Wilson", position: "LG", year: "Junior" },
    { jerseyNumber: "52", name: "Michael Taylor", position: "C", year: "Senior" },
    { jerseyNumber: "68", name: "Robert Anderson", position: "RG", year: "Junior" },
    { jerseyNumber: "75", name: "William Thomas", position: "RT", year: "Senior" },
  ]

  for (const rp of rosterPlayers) {
    await prisma.rosterPlayer.upsert({
      where: { teamId_jerseyNumber: { teamId: team.id, jerseyNumber: rp.jerseyNumber } },
      update: {},
      create: {
        teamId: team.id,
        ...rp,
      },
    })
  }

  console.log("Created roster players")

  // Create some audit logs
  await prisma.auditLog.create({
    data: {
      teamId: team.id,
      userId: coach.id,
      action: "play_card.create",
      entityType: "PlayCard",
      entityId: playCard1.id,
      metadata: { cardName: "Slant Right" },
    },
  })

  await prisma.auditLog.create({
    data: {
      teamId: team.id,
      userId: coach.id,
      action: "video.upload",
      entityType: "VideoAsset",
      entityId: video.id,
      metadata: { videoName: "Week 5 Game Film" },
    },
  })

  console.log("Created audit logs")

  console.log("Seed completed successfully!")
  console.log("\nDemo Accounts:")
  console.log("  Coach: coach@demo.com / coach123!")
  console.log("  Assistant: assistant@demo.com / assistant123!")
  console.log("  Player: player@demo.com / player123!")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
