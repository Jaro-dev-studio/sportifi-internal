/**
 * Audit Log Service - Tracks key actions for compliance and activity feeds
 */

import { prisma } from "@/lib/prisma"

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.password_reset"
  | "team.create"
  | "team.update"
  | "team.delete"
  | "invite.send"
  | "invite.accept"
  | "invite.revoke"
  | "member.role_change"
  | "member.remove"
  | "video.upload"
  | "video.delete"
  | "video.process"
  | "play_session.create"
  | "play_session.update"
  | "play_session.delete"
  | "play.create"
  | "play.update"
  | "play.delete"
  | "play_card.create"
  | "play_card.update"
  | "play_card.delete"
  | "play_card.share"
  | "playbook.create"
  | "playbook.update"
  | "playbook.delete"
  | "share_link.create"
  | "share_link.access"
  | "share_link.revoke"

export interface AuditLogEntry {
  userId?: string
  teamId?: string
  action: AuditAction
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    console.log(`[Audit] ${entry.action} - User: ${entry.userId || "system"}, Team: ${entry.teamId || "none"}`)
    
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        teamId: entry.teamId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadata: entry.metadata as object,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    })
  } catch (error) {
    // Don't let audit logging failures break the main flow
    console.error("[Audit] Failed to log event:", error)
  }
}

/**
 * Get audit logs for a team (activity feed)
 */
export async function getTeamAuditLogs(
  teamId: string,
  options: {
    limit?: number
    offset?: number
    actions?: AuditAction[]
  } = {}
) {
  const { limit = 50, offset = 0, actions } = options
  
  const where: Record<string, unknown> = { teamId }
  
  if (actions && actions.length > 0) {
    where.action = { in: actions }
  }
  
  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })
  
  return logs.map((log) => ({
    id: log.id,
    action: log.action as AuditAction,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata as Record<string, unknown> | null,
    createdAt: log.createdAt,
    user: log.user
      ? {
          id: log.user.id,
          name: log.user.name,
          email: log.user.email,
          image: log.user.image,
        }
      : null,
  }))
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  options: {
    limit?: number
    offset?: number
  } = {}
) {
  const { limit = 50, offset = 0 } = options
  
  const logs = await prisma.auditLog.findMany({
    where: { userId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })
  
  return logs.map((log) => ({
    id: log.id,
    action: log.action as AuditAction,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata as Record<string, unknown> | null,
    createdAt: log.createdAt,
    team: log.team
      ? {
          id: log.team.id,
          name: log.team.name,
          slug: log.team.slug,
        }
      : null,
  }))
}

/**
 * Get action description for display
 */
export function getActionDescription(
  action: AuditAction,
  metadata?: Record<string, unknown>
): string {
  const descriptions: Record<AuditAction, string | ((m?: Record<string, unknown>) => string)> = {
    "user.login": "logged in",
    "user.logout": "logged out",
    "user.password_reset": "reset password",
    "team.create": (m) => `created team "${m?.teamName || "Unknown"}"`,
    "team.update": "updated team settings",
    "team.delete": "deleted team",
    "invite.send": (m) => `invited ${m?.email || "someone"} as ${m?.role || "member"}`,
    "invite.accept": "accepted team invitation",
    "invite.revoke": "revoked an invitation",
    "member.role_change": (m) => `changed role to ${m?.newRole || "member"}`,
    "member.remove": "removed a team member",
    "video.upload": (m) => `uploaded video "${m?.videoName || "Unknown"}"`,
    "video.delete": "deleted a video",
    "video.process": "processed a video",
    "play_session.create": "created a play analysis session",
    "play_session.update": "updated a play session",
    "play_session.delete": "deleted a play session",
    "play.create": "created a new play",
    "play.update": "updated a play",
    "play.delete": "deleted a play",
    "play_card.create": (m) => `created play card "${m?.cardName || "Unknown"}"`,
    "play_card.update": (m) => `updated play card "${m?.cardName || "Unknown"}"`,
    "play_card.delete": "deleted a play card",
    "play_card.share": "shared a play card",
    "playbook.create": (m) => `created playbook folder "${m?.folderName || "Unknown"}"`,
    "playbook.update": "updated playbook",
    "playbook.delete": "deleted playbook folder",
    "share_link.create": "created a share link",
    "share_link.access": "accessed a shared play card",
    "share_link.revoke": "revoked a share link",
  }
  
  const desc = descriptions[action]
  
  if (typeof desc === "function") {
    return desc(metadata)
  }
  
  return desc
}
