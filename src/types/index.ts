import type { PlayCardType, TeamRole, VideoStatus, PlaySessionStatus, JobStatus } from "@prisma/client"

// Field position for play cards (normalized 0-100)
export interface FieldPosition {
  x: number
  y: number
}

// Path point for player movement
export interface PathPoint extends FieldPosition {
  timestamp: number
  isKeyframe?: boolean
}

// Player entity for play cards
export interface PlayerData {
  id: string
  jerseyNumber?: string
  label?: string // Position like QB, WR, etc.
  teamSide: "offense" | "defense" | "special"
  startPosition: FieldPosition
  path: PathPoint[]
  color?: string
  notes?: string
}

// Route/Arrow for play diagram
export interface RouteArrow {
  id: string
  playerId?: string
  startPosition: FieldPosition
  endPosition: FieldPosition
  controlPoints?: FieldPosition[] // For curved lines
  type: "solid" | "dashed" | "curved"
  color?: string
  label?: string
}

// Annotation for play card
export interface Annotation {
  id: string
  type: "text" | "circle" | "rectangle" | "freehand"
  position: FieldPosition
  text?: string
  width?: number
  height?: number
  color?: string
  points?: FieldPosition[] // For freehand
}

// Complete play card data structure
export interface PlayCardData {
  formation?: string
  playType?: string // Run, Pass, etc.
  players: PlayerData[]
  routes: RouteArrow[]
  annotations: Annotation[]
  fieldConfig: {
    showYardLines: boolean
    showHashMarks: boolean
    fieldSection: "full" | "redzone" | "custom"
    customStartYard?: number
    customEndYard?: number
  }
}

// Video upload state
export interface VideoUploadState {
  file: File
  progress: number
  status: "pending" | "uploading" | "processing" | "ready" | "failed"
  error?: string
  videoId?: string
}

// Play segmentation for analysis
export interface PlaySegment {
  id: string
  startTime: number
  endTime: number
  name?: string
  isAutoDetected: boolean
}

// AI Detection result (placeholder for future AI integration)
export interface AIDetectionResult {
  frameNumber: number
  timestamp: number
  detections: {
    id: string
    type: "player" | "ball" | "official"
    boundingBox: {
      x: number
      y: number
      width: number
      height: number
    }
    confidence: number
    trackingId?: string
  }[]
}

// Team permission configuration
export interface TeamPermissions {
  canEdit: boolean
  canInvite: boolean
  canDelete: boolean
  canUpload: boolean
  canAnalyze: boolean
}

// Dashboard stats
export interface DashboardStats {
  totalVideos: number
  totalPlayCards: number
  recentActivity: ActivityItem[]
  upcomingGames: GameSummary[]
}

export interface ActivityItem {
  id: string
  type: "upload" | "playcard_created" | "playcard_edited" | "share" | "invite"
  description: string
  userId: string
  userName: string
  timestamp: Date
  entityId?: string
}

export interface GameSummary {
  id: string
  name: string
  opponent?: string
  date?: Date
  videoCount: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Re-export Prisma enums
export { PlayCardType, TeamRole, VideoStatus, PlaySessionStatus, JobStatus }
