/**
 * AI Adapter Service - Placeholder for AI/ML integration
 * 
 * This service provides an interface for AI-powered features:
 * - Player detection in video frames
 * - Player tracking across frames
 * - Automatic play segmentation
 * 
 * The current implementation returns mock data but is structured
 * to allow easy integration with a real AI service later.
 */

import type { AIDetectionResult, FieldPosition, PathPoint } from "@/types"

export interface AIServiceConfig {
  apiUrl: string
  apiKey: string
  timeout?: number
}

export interface DetectionRequest {
  frameUrl: string
  frameNumber: number
  timestamp: number
  previousDetections?: AIDetectionResult
}

export interface TrackingRequest {
  frameUrls: string[]
  initialDetections: AIDetectionResult
}

export interface SegmentationRequest {
  videoUrl: string
  duration: number
}

export interface SegmentationResult {
  segments: {
    startTime: number
    endTime: number
    confidence: number
    type?: "pre-snap" | "play" | "post-play"
  }[]
}

export interface AIAdapter {
  detectPlayers(request: DetectionRequest): Promise<AIDetectionResult>
  trackPlayers(request: TrackingRequest): Promise<AIDetectionResult[]>
  segmentPlays(request: SegmentationRequest): Promise<SegmentationResult>
  isAvailable(): Promise<boolean>
}

/**
 * Mock AI Adapter - Returns simulated detection results
 * Useful for UI development and testing without a real AI service
 */
class MockAIAdapter implements AIAdapter {
  private generateRandomPosition(): { x: number; y: number; width: number; height: number } {
    return {
      x: Math.random() * 80 + 10, // 10-90%
      y: Math.random() * 60 + 20, // 20-80%
      width: 5 + Math.random() * 3,
      height: 8 + Math.random() * 4,
    }
  }

  async detectPlayers(request: DetectionRequest): Promise<AIDetectionResult> {
    console.log(`[AI Adapter] Detecting players in frame ${request.frameNumber}`)
    
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    // Generate 11-15 random player detections (offense + defense)
    const numPlayers = 22 + Math.floor(Math.random() * 4)
    const detections = []
    
    for (let i = 0; i < numPlayers; i++) {
      const isOffense = i < 11
      const baseY = isOffense ? 30 : 70 // Offense on bottom, defense on top
      
      detections.push({
        id: `player-${request.frameNumber}-${i}`,
        type: "player" as const,
        boundingBox: {
          x: 10 + (i % 11) * 8 + Math.random() * 3,
          y: baseY + Math.random() * 15 - 7.5,
          width: 4 + Math.random() * 2,
          height: 6 + Math.random() * 3,
        },
        confidence: 0.7 + Math.random() * 0.25,
        trackingId: `track-${i}`,
      })
    }
    
    // Add ball detection
    detections.push({
      id: `ball-${request.frameNumber}`,
      type: "ball" as const,
      boundingBox: {
        x: 45 + Math.random() * 10,
        y: 45 + Math.random() * 10,
        width: 2,
        height: 1.5,
      },
      confidence: 0.85 + Math.random() * 0.1,
      trackingId: "ball",
    })
    
    return {
      frameNumber: request.frameNumber,
      timestamp: request.timestamp,
      detections,
    }
  }

  async trackPlayers(request: TrackingRequest): Promise<AIDetectionResult[]> {
    console.log(`[AI Adapter] Tracking players across ${request.frameUrls.length} frames`)
    
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, request.frameUrls.length * 50))
    
    const results: AIDetectionResult[] = []
    let currentDetections = request.initialDetections.detections
    
    for (let i = 0; i < request.frameUrls.length; i++) {
      // Simulate player movement
      const movedDetections = currentDetections.map((det) => ({
        ...det,
        id: `player-${i}-${det.trackingId}`,
        boundingBox: {
          ...det.boundingBox,
          x: det.boundingBox.x + (Math.random() - 0.5) * 2,
          y: det.boundingBox.y + (Math.random() - 0.5) * 2,
        },
        confidence: Math.max(0.5, det.confidence + (Math.random() - 0.5) * 0.1),
      }))
      
      results.push({
        frameNumber: i,
        timestamp: i * 0.033, // ~30fps
        detections: movedDetections,
      })
      
      currentDetections = movedDetections
    }
    
    return results
  }

  async segmentPlays(request: SegmentationRequest): Promise<SegmentationResult> {
    console.log(`[AI Adapter] Segmenting plays for video of ${request.duration}s`)
    
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Generate mock play segments
    const segments = []
    let currentTime = 0
    
    while (currentTime < request.duration) {
      // Random pre-snap duration (5-15 seconds)
      const preSnapDuration = 5 + Math.random() * 10
      segments.push({
        startTime: currentTime,
        endTime: Math.min(currentTime + preSnapDuration, request.duration),
        confidence: 0.75 + Math.random() * 0.2,
        type: "pre-snap" as const,
      })
      currentTime += preSnapDuration
      
      if (currentTime >= request.duration) break
      
      // Random play duration (3-8 seconds)
      const playDuration = 3 + Math.random() * 5
      segments.push({
        startTime: currentTime,
        endTime: Math.min(currentTime + playDuration, request.duration),
        confidence: 0.85 + Math.random() * 0.1,
        type: "play" as const,
      })
      currentTime += playDuration
      
      if (currentTime >= request.duration) break
      
      // Random post-play duration (2-5 seconds)
      const postPlayDuration = 2 + Math.random() * 3
      segments.push({
        startTime: currentTime,
        endTime: Math.min(currentTime + postPlayDuration, request.duration),
        confidence: 0.7 + Math.random() * 0.2,
        type: "post-play" as const,
      })
      currentTime += postPlayDuration
    }
    
    return { segments }
  }

  async isAvailable(): Promise<boolean> {
    return true
  }
}

/**
 * Real AI Service Adapter - Connects to external AI service
 * Placeholder implementation - requires actual API integration
 */
class RealAIAdapter implements AIAdapter {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  async detectPlayers(request: DetectionRequest): Promise<AIDetectionResult> {
    console.log(`[AI Adapter] Would call real AI service for detection`)
    // TODO: Implement actual API call
    throw new Error("Real AI service not configured - using mock adapter")
  }

  async trackPlayers(request: TrackingRequest): Promise<AIDetectionResult[]> {
    console.log(`[AI Adapter] Would call real AI service for tracking`)
    throw new Error("Real AI service not configured - using mock adapter")
  }

  async segmentPlays(request: SegmentationRequest): Promise<SegmentationResult> {
    console.log(`[AI Adapter] Would call real AI service for segmentation`)
    throw new Error("Real AI service not configured - using mock adapter")
  }

  async isAvailable(): Promise<boolean> {
    // TODO: Check if service is reachable
    return false
  }
}

// Factory function
function createAIAdapter(): AIAdapter {
  const apiUrl = process.env.AI_SERVICE_URL
  const apiKey = process.env.AI_SERVICE_API_KEY
  
  if (apiUrl && apiKey && process.env.NODE_ENV === "production") {
    console.log("[AI Adapter] Using real AI service adapter")
    return new RealAIAdapter({ apiUrl, apiKey })
  }
  
  console.log("[AI Adapter] Using mock AI adapter")
  return new MockAIAdapter()
}

// Singleton instance
export const aiAdapter = createAIAdapter()

// Helper function to convert AI detections to field positions
export function detectionsToFieldPositions(
  detections: AIDetectionResult,
  fieldWidth: number,
  fieldHeight: number
): FieldPosition[] {
  return detections.detections
    .filter((d) => d.type === "player")
    .map((d) => ({
      x: d.boundingBox.x + d.boundingBox.width / 2,
      y: d.boundingBox.y + d.boundingBox.height / 2,
    }))
}

// Helper function to build player paths from tracking results
export function buildPlayerPaths(
  trackingResults: AIDetectionResult[]
): Map<string, PathPoint[]> {
  const paths = new Map<string, PathPoint[]>()
  
  for (const result of trackingResults) {
    for (const detection of result.detections) {
      if (!detection.trackingId || detection.type !== "player") continue
      
      const trackId = detection.trackingId
      const point: PathPoint = {
        x: detection.boundingBox.x + detection.boundingBox.width / 2,
        y: detection.boundingBox.y + detection.boundingBox.height / 2,
        timestamp: result.timestamp,
      }
      
      if (!paths.has(trackId)) {
        paths.set(trackId, [])
      }
      paths.get(trackId)!.push(point)
    }
  }
  
  return paths
}
