"use server"

import { hash } from "bcryptjs"
import { v4 as uuid } from "uuid"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { logAuditEvent } from "@/services/audit-log"
import { 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations"
import { generateSlug, generateToken } from "@/lib/utils"

export interface ActionResult {
  success: boolean
  error?: string
  data?: unknown
}

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  try {
    console.log("[Auth] Starting user registration...")
    
    // Validate input
    const validated = registerSchema.safeParse(input)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }
    
    const { name, email, password } = validated.data
    
    // Check if user exists
    console.log("[Auth] Checking if user already exists...")
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return { success: false, error: "An account with this email already exists" }
    }
    
    // Hash password
    console.log("[Auth] Hashing password...")
    const passwordHash = await hash(password, 12)
    
    // Create user
    console.log("[Auth] Creating user account...")
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    })
    
    console.log("[Auth] User registered successfully:", user.id)
    
    return { success: true, data: { userId: user.id } }
  } catch (error) {
    console.error("[Auth] Registration error:", error)
    return { success: false, error: "Failed to create account. Please try again." }
  }
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    console.log("[Auth] Attempting login for:", email)
    
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    
    // Log the event
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    
    if (user) {
      await logAuditEvent({
        userId: user.id,
        action: "user.login",
        metadata: { method: "credentials" },
      })
    }
    
    console.log("[Auth] Login successful")
    return { success: true }
  } catch (error) {
    console.error("[Auth] Login error:", error)
    return { success: false, error: "Invalid email or password" }
  }
}

export async function sendMagicLink(email: string): Promise<ActionResult> {
  try {
    console.log("[Auth] Sending magic link to:", email)
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      // Create a new user for magic link
      user = await prisma.user.create({
        data: { email },
      })
    }
    
    // Generate verification token
    const token = generateToken(64)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })
    
    // In production, send email here
    // For MVP, log the magic link
    const magicLink = `${process.env.AUTH_URL}/api/auth/callback/email?token=${token}&email=${encodeURIComponent(email)}`
    console.log("[Auth] Magic link (DEV):", magicLink)
    
    // TODO: Send actual email
    // await sendEmail({
    //   to: email,
    //   subject: "Sign in to PlayCard",
    //   html: `<a href="${magicLink}">Click here to sign in</a>`,
    // })
    
    return { success: true, data: { message: "Magic link sent! Check your email." } }
  } catch (error) {
    console.error("[Auth] Magic link error:", error)
    return { success: false, error: "Failed to send magic link. Please try again." }
  }
}

export async function sendPasswordResetEmail(input: ForgotPasswordInput): Promise<ActionResult> {
  try {
    console.log("[Auth] Processing password reset request...")
    
    const validated = forgotPasswordSchema.safeParse(input)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }
    
    const { email } = validated.data
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      // Don't reveal if user exists
      console.log("[Auth] No user found for email, but returning success for security")
      return { success: true, data: { message: "If an account exists, you will receive a reset email." } }
    }
    
    // Generate reset token
    const token = generateToken(64)
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    })
    
    // In production, send email here
    const resetLink = `${process.env.AUTH_URL}/reset-password?token=${token}`
    console.log("[Auth] Password reset link (DEV):", resetLink)
    
    // TODO: Send actual email
    
    console.log("[Auth] Password reset token created for user:", user.id)
    
    return { success: true, data: { message: "If an account exists, you will receive a reset email." } }
  } catch (error) {
    console.error("[Auth] Password reset error:", error)
    return { success: false, error: "Failed to process request. Please try again." }
  }
}

export async function resetPassword(input: ResetPasswordInput): Promise<ActionResult> {
  try {
    console.log("[Auth] Processing password reset...")
    
    const validated = resetPasswordSchema.safeParse(input)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }
    
    const { token, password } = validated.data
    
    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expires: { gt: new Date() },
      },
    })
    
    if (!resetRecord) {
      return { success: false, error: "Invalid or expired reset link" }
    }
    
    // Hash new password
    console.log("[Auth] Hashing new password...")
    const passwordHash = await hash(password, 12)
    
    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ])
    
    await logAuditEvent({
      userId: resetRecord.userId,
      action: "user.password_reset",
    })
    
    console.log("[Auth] Password reset successful for user:", resetRecord.userId)
    
    return { success: true, data: { message: "Password reset successful. You can now log in." } }
  } catch (error) {
    console.error("[Auth] Password reset error:", error)
    return { success: false, error: "Failed to reset password. Please try again." }
  }
}

export async function createTeam(
  userId: string,
  name: string,
  description?: string
): Promise<ActionResult> {
  try {
    console.log("[Auth] Creating team for user:", userId)
    
    // Generate unique slug
    let slug = generateSlug(name)
    let slugExists = await prisma.team.findUnique({ where: { slug } })
    let counter = 1
    
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`
      slugExists = await prisma.team.findUnique({ where: { slug } })
      counter++
    }
    
    // Create team and membership in transaction
    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          slug,
          description,
        },
      })
      
      // Add creator as COACH
      await tx.teamMembership.create({
        data: {
          userId,
          teamId: newTeam.id,
          role: "COACH",
          permissions: {
            canEdit: true,
            canInvite: true,
            canDelete: true,
            canUpload: true,
            canAnalyze: true,
          },
        },
      })
      
      // Create default playbook folders
      await tx.playbookFolder.createMany({
        data: [
          { teamId: newTeam.id, name: "Offense", playType: "offense", sortOrder: 0 },
          { teamId: newTeam.id, name: "Defense", playType: "defense", sortOrder: 1 },
          { teamId: newTeam.id, name: "Special Teams", playType: "special", sortOrder: 2 },
        ],
      })
      
      return newTeam
    })
    
    await logAuditEvent({
      userId,
      teamId: team.id,
      action: "team.create",
      entityType: "Team",
      entityId: team.id,
      metadata: { teamName: name },
    })
    
    console.log("[Auth] Team created successfully:", team.id)
    
    return { success: true, data: { teamId: team.id, slug: team.slug } }
  } catch (error) {
    console.error("[Auth] Team creation error:", error)
    return { success: false, error: "Failed to create team. Please try again." }
  }
}

export async function joinTeamWithInvite(
  userId: string,
  token: string
): Promise<ActionResult> {
  try {
    console.log("[Auth] Processing team invite...")
    
    // Find valid invite
    const invite = await prisma.invite.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { team: true },
    })
    
    if (!invite) {
      return { success: false, error: "Invalid or expired invite link" }
    }
    
    // Check if user is already a member
    const existingMembership = await prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: invite.teamId,
        },
      },
    })
    
    if (existingMembership) {
      return { success: false, error: "You are already a member of this team" }
    }
    
    // Create membership and mark invite as used
    await prisma.$transaction([
      prisma.teamMembership.create({
        data: {
          userId,
          teamId: invite.teamId,
          role: invite.role,
          permissions: invite.role === "ASSISTANT" 
            ? { canEdit: true, canUpload: true, canAnalyze: true }
            : undefined,
        },
      }),
      prisma.invite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      }),
    ])
    
    await logAuditEvent({
      userId,
      teamId: invite.teamId,
      action: "invite.accept",
      entityType: "Team",
      entityId: invite.teamId,
      metadata: { role: invite.role },
    })
    
    console.log("[Auth] User joined team:", invite.teamId)
    
    return { 
      success: true, 
      data: { 
        teamId: invite.teamId, 
        teamName: invite.team.name,
        slug: invite.team.slug,
      } 
    }
  } catch (error) {
    console.error("[Auth] Join team error:", error)
    return { success: false, error: "Failed to join team. Please try again." }
  }
}
