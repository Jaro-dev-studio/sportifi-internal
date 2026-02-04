import { z } from "zod"

// Auth validations
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// Team validations
export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
})

export const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["COACH", "ASSISTANT", "PLAYER"]),
})

export const joinTeamSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
})

// Video validations
export const videoMetadataSchema = z.object({
  name: z.string().min(1, "Video name is required").max(200),
  gameId: z.string().optional(),
  opponent: z.string().max(100).optional(),
  gameDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

export const clipSchema = z.object({
  videoId: z.string(),
  name: z.string().max(200).optional(),
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  notes: z.string().max(1000).optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
})

// Play validations
export const playSchema = z.object({
  name: z.string().max(200).optional(),
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  formationType: z.string().max(100).optional(),
  playType: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
})

export const playerEntitySchema = z.object({
  jerseyNumber: z.string().max(10).optional(),
  label: z.string().max(50).optional(),
  teamSide: z.enum(["offense", "defense", "special"]).optional(),
  startX: z.number().min(0).max(100),
  startY: z.number().min(0).max(100),
  color: z.string().optional(),
  notes: z.string().max(500).optional(),
})

// Play Card validations
export const playCardSchema = z.object({
  name: z.string().min(1, "Play card name is required").max(200),
  description: z.string().max(1000).optional(),
  formation: z.string().max(100).optional(),
  playType: z.enum(["offense", "defense", "special"]).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  data: z.object({
    formation: z.string().optional(),
    playType: z.string().optional(),
    players: z.array(z.any()),
    routes: z.array(z.any()),
    annotations: z.array(z.any()),
    fieldConfig: z.object({
      showYardLines: z.boolean(),
      showHashMarks: z.boolean(),
      fieldSection: z.enum(["full", "redzone", "custom"]),
      customStartYard: z.number().optional(),
      customEndYard: z.number().optional(),
    }),
  }),
})

// Playbook validations
export const playbookFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
  playType: z.enum(["offense", "defense", "special"]).optional(),
})

// Share validations
export const shareLinkSchema = z.object({
  playCardId: z.string(),
  permission: z.enum(["VIEW", "EDIT", "COMMENT"]).default("VIEW"),
  expiresInDays: z.number().min(1).max(365).optional(),
  maxUses: z.number().min(1).max(1000).optional(),
  password: z.string().max(100).optional(),
})

// Roster validations
export const rosterPlayerSchema = z.object({
  jerseyNumber: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  position: z.string().max(50).optional(),
  height: z.string().max(20).optional(),
  weight: z.string().max(20).optional(),
  year: z.string().max(20).optional(),
})

// Game validations
export const gameSchema = z.object({
  name: z.string().min(1).max(200),
  opponent: z.string().max(100).optional(),
  gameDate: z.string().optional(),
  location: z.string().max(200).optional(),
  result: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type InviteInput = z.infer<typeof inviteSchema>
export type VideoMetadataInput = z.infer<typeof videoMetadataSchema>
export type ClipInput = z.infer<typeof clipSchema>
export type PlayInput = z.infer<typeof playSchema>
export type PlayCardInput = z.infer<typeof playCardSchema>
export type PlaybookFolderInput = z.infer<typeof playbookFolderSchema>
export type ShareLinkInput = z.infer<typeof shareLinkSchema>
export type RosterPlayerInput = z.infer<typeof rosterPlayerSchema>
export type GameInput = z.infer<typeof gameSchema>
