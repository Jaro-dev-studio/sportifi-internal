/**
 * Job Queue Service - For video processing and background tasks
 * 
 * MVP implementation uses in-process queue with progress tracking.
 * Structure allows easy migration to Redis/BullMQ later.
 */

import { prisma } from "@/lib/prisma"
import type { JobStatus } from "@prisma/client"

export interface JobPayload {
  [key: string]: unknown
}

export interface JobResult {
  [key: string]: unknown
}

export interface Job {
  id: string
  type: string
  status: JobStatus
  progress: number
  payload: JobPayload
  result?: JobResult
  error?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

export type JobHandler = (
  job: Job,
  updateProgress: (progress: number) => Promise<void>
) => Promise<JobResult>

// Registry of job handlers
const jobHandlers = new Map<string, JobHandler>()

// Register a job handler
export function registerJobHandler(type: string, handler: JobHandler) {
  console.log(`[Job Queue] Registering handler for job type: ${type}`)
  jobHandlers.set(type, handler)
}

// Create a new job
export async function createJob(
  type: string,
  payload: JobPayload,
  priority: number = 0
): Promise<Job> {
  console.log(`[Job Queue] Creating job of type: ${type}`)
  
  const job = await prisma.processingJob.create({
    data: {
      type,
      payload: payload as object,
      priority,
      status: "PENDING",
    },
  })
  
  // In MVP, we process jobs immediately (in-process)
  // In production, this would be picked up by a worker
  processJobAsync(job.id)
  
  return {
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    payload: job.payload as JobPayload,
    createdAt: job.createdAt,
  }
}

// Get job status
export async function getJob(id: string): Promise<Job | null> {
  const job = await prisma.processingJob.findUnique({
    where: { id },
  })
  
  if (!job) return null
  
  return {
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    payload: job.payload as JobPayload,
    result: job.result as JobResult | undefined,
    error: job.error || undefined,
    createdAt: job.createdAt,
    startedAt: job.startedAt || undefined,
    completedAt: job.completedAt || undefined,
  }
}

// Update job progress
async function updateJobProgress(id: string, progress: number): Promise<void> {
  await prisma.processingJob.update({
    where: { id },
    data: { progress: Math.min(100, Math.max(0, progress)) },
  })
}

// Process job (in-process for MVP)
async function processJobAsync(jobId: string): Promise<void> {
  // Use setImmediate to process async
  setImmediate(async () => {
    try {
      const dbJob = await prisma.processingJob.findUnique({
        where: { id: jobId },
      })
      
      if (!dbJob || dbJob.status !== "PENDING") return
      
      const handler = jobHandlers.get(dbJob.type)
      
      if (!handler) {
        console.error(`[Job Queue] No handler registered for job type: ${dbJob.type}`)
        await prisma.processingJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            error: `No handler for job type: ${dbJob.type}`,
          },
        })
        return
      }
      
      // Mark as running
      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: "RUNNING",
          startedAt: new Date(),
          attempts: { increment: 1 },
        },
      })
      
      console.log(`[Job Queue] Processing job ${jobId} of type ${dbJob.type}`)
      
      const job: Job = {
        id: dbJob.id,
        type: dbJob.type,
        status: "RUNNING",
        progress: 0,
        payload: dbJob.payload as JobPayload,
        createdAt: dbJob.createdAt,
        startedAt: new Date(),
      }
      
      // Execute handler
      const result = await handler(job, async (progress) => {
        await updateJobProgress(jobId, progress)
      })
      
      // Mark as completed
      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          progress: 100,
          result: result as object,
          completedAt: new Date(),
        },
      })
      
      console.log(`[Job Queue] Job ${jobId} completed successfully`)
    } catch (error) {
      console.error(`[Job Queue] Job ${jobId} failed:`, error)
      
      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
    }
  })
}

// Cancel a job
export async function cancelJob(id: string): Promise<boolean> {
  const job = await prisma.processingJob.findUnique({
    where: { id },
  })
  
  if (!job || job.status !== "PENDING") {
    return false
  }
  
  await prisma.processingJob.update({
    where: { id },
    data: { status: "CANCELLED" },
  })
  
  return true
}

// Get pending jobs for a type
export async function getPendingJobs(type?: string): Promise<Job[]> {
  const where = type
    ? { type, status: "PENDING" as JobStatus }
    : { status: "PENDING" as JobStatus }
  
  const jobs = await prisma.processingJob.findMany({
    where,
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  })
  
  return jobs.map((job) => ({
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    payload: job.payload as JobPayload,
    createdAt: job.createdAt,
  }))
}

// ============================================================================
// Built-in Job Handlers
// ============================================================================

// Video processing job handler
registerJobHandler("video.process", async (job, updateProgress) => {
  console.log(`[Video Process] Starting video processing for job ${job.id}`)
  
  const { videoId } = job.payload as { videoId: string }
  
  // Step 1: Validate video exists
  updateProgress(10)
  const video = await prisma.videoAsset.findUnique({
    where: { id: videoId },
  })
  
  if (!video) {
    throw new Error(`Video not found: ${videoId}`)
  }
  
  // Step 2: Update status to processing
  updateProgress(20)
  await prisma.videoAsset.update({
    where: { id: videoId },
    data: { status: "PROCESSING" },
  })
  
  // Step 3: Simulate video analysis (in real implementation, this would use ffmpeg)
  console.log(`[Video Process] Analyzing video metadata...`)
  updateProgress(40)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  
  // Step 4: Generate thumbnail (mock)
  console.log(`[Video Process] Generating thumbnail...`)
  updateProgress(60)
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  // Step 5: Extract metadata
  console.log(`[Video Process] Extracting metadata...`)
  updateProgress(80)
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  // Step 6: Mark as ready
  await prisma.videoAsset.update({
    where: { id: videoId },
    data: {
      status: "READY",
      duration: 120 + Math.random() * 180, // Mock duration 2-5 minutes
      width: 1920,
      height: 1080,
    },
  })
  
  updateProgress(100)
  console.log(`[Video Process] Video ${videoId} processing completed`)
  
  return { videoId, status: "READY" }
})

// Frame extraction job handler
registerJobHandler("frames.extract", async (job, updateProgress) => {
  console.log(`[Frame Extract] Starting frame extraction for job ${job.id}`)
  
  const { sessionId, startTime, endTime, fps = 5 } = job.payload as {
    sessionId: string
    startTime: number
    endTime: number
    fps?: number
  }
  
  const duration = endTime - startTime
  const totalFrames = Math.ceil(duration * fps)
  
  console.log(`[Frame Extract] Extracting ${totalFrames} frames at ${fps} fps`)
  
  const frames = []
  
  for (let i = 0; i < totalFrames; i++) {
    const timestamp = startTime + i / fps
    
    // In real implementation, extract frame from video using ffmpeg
    // For mock, we just create database records
    
    const frame = await prisma.frameExtraction.create({
      data: {
        playSessionId: sessionId,
        frameNumber: i,
        timestamp,
        storageKey: `sessions/${sessionId}/frames/frame-${i.toString().padStart(6, "0")}.jpg`,
      },
    })
    
    frames.push(frame.id)
    
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 50))
    updateProgress(Math.round((i / totalFrames) * 100))
  }
  
  console.log(`[Frame Extract] Extracted ${frames.length} frames for session ${sessionId}`)
  
  return { sessionId, frameCount: frames.length, frameIds: frames }
})

// AI detection job handler
registerJobHandler("ai.detect", async (job, updateProgress) => {
  const { sessionId, frameIds } = job.payload as {
    sessionId: string
    frameIds: string[]
  }
  
  console.log(`[AI Detect] Running detection on ${frameIds.length} frames`)
  
  // Import AI adapter (avoid circular dependency)
  const { aiAdapter } = await import("./ai-adapter")
  
  const results = []
  
  for (let i = 0; i < frameIds.length; i++) {
    const frame = await prisma.frameExtraction.findUnique({
      where: { id: frameIds[i] },
    })
    
    if (!frame) continue
    
    const detection = await aiAdapter.detectPlayers({
      frameUrl: frame.storageKey,
      frameNumber: frame.frameNumber,
      timestamp: frame.timestamp,
    })
    
    // Save detection results
    await prisma.frameExtraction.update({
      where: { id: frame.id },
      data: { aiData: detection as object },
    })
    
    results.push(detection)
    updateProgress(Math.round((i / frameIds.length) * 100))
  }
  
  console.log(`[AI Detect] Completed detection for ${results.length} frames`)
  
  return { sessionId, detectionsCount: results.length }
})
