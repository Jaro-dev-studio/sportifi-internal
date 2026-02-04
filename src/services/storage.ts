/**
 * Storage Service - S3-compatible storage abstraction
 * 
 * This service provides a unified interface for file storage operations.
 * For MVP, it includes both a mock implementation and an S3 adapter structure.
 */

export interface StorageUploadOptions {
  contentType?: string
  metadata?: Record<string, string>
}

export interface StorageObject {
  key: string
  size: number
  lastModified: Date
  contentType?: string
  url: string
}

export interface PresignedUrlOptions {
  expiresIn?: number // seconds
}

export interface StorageProvider {
  upload(key: string, data: Buffer | Blob | File, options?: StorageUploadOptions): Promise<string>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, options?: PresignedUrlOptions): Promise<string>
  getSignedUploadUrl(key: string, options?: StorageUploadOptions & PresignedUrlOptions): Promise<string>
  exists(key: string): Promise<boolean>
  list(prefix: string): Promise<StorageObject[]>
}

/**
 * Mock Storage Provider - For development/testing
 * Stores files in memory (not persistent)
 */
class MockStorageProvider implements StorageProvider {
  private storage: Map<string, { data: Buffer; contentType?: string; metadata?: Record<string, string> }> = new Map()

  async upload(key: string, data: Buffer | Blob | File, options?: StorageUploadOptions): Promise<string> {
    console.log(`[Storage] Uploading file to key: ${key}`)
    
    let buffer: Buffer
    if (data instanceof Buffer) {
      buffer = data
    } else if (data instanceof Blob || data instanceof File) {
      const arrayBuffer = await data.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else {
      throw new Error("Unsupported data type for upload")
    }
    
    this.storage.set(key, {
      data: buffer,
      contentType: options?.contentType,
      metadata: options?.metadata,
    })
    
    console.log(`[Storage] File uploaded successfully: ${key}`)
    return key
  }

  async download(key: string): Promise<Buffer> {
    console.log(`[Storage] Downloading file: ${key}`)
    const item = this.storage.get(key)
    if (!item) {
      throw new Error(`File not found: ${key}`)
    }
    return item.data
  }

  async delete(key: string): Promise<void> {
    console.log(`[Storage] Deleting file: ${key}`)
    this.storage.delete(key)
  }

  async getSignedUrl(key: string, options?: PresignedUrlOptions): Promise<string> {
    // In mock mode, return a fake URL
    const expiresIn = options?.expiresIn || 3600
    console.log(`[Storage] Generating signed URL for: ${key}, expires in: ${expiresIn}s`)
    return `/api/storage/${key}?expires=${Date.now() + expiresIn * 1000}`
  }

  async getSignedUploadUrl(key: string, options?: StorageUploadOptions & PresignedUrlOptions): Promise<string> {
    const expiresIn = options?.expiresIn || 3600
    console.log(`[Storage] Generating signed upload URL for: ${key}`)
    return `/api/storage/upload/${key}?expires=${Date.now() + expiresIn * 1000}`
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key)
  }

  async list(prefix: string): Promise<StorageObject[]> {
    console.log(`[Storage] Listing files with prefix: ${prefix}`)
    const objects: StorageObject[] = []
    
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(prefix)) {
        objects.push({
          key,
          size: value.data.length,
          lastModified: new Date(),
          contentType: value.contentType,
          url: await this.getSignedUrl(key),
        })
      }
    }
    
    return objects
  }
}

/**
 * S3 Storage Provider - For production use
 * Requires AWS SDK to be installed and configured
 */
class S3StorageProvider implements StorageProvider {
  private bucket: string
  private endpoint: string
  private region: string

  constructor() {
    this.bucket = process.env.S3_BUCKET || "playcard-assets"
    this.endpoint = process.env.S3_ENDPOINT || ""
    this.region = process.env.S3_REGION || "us-east-1"
  }

  async upload(key: string, data: Buffer | Blob | File, options?: StorageUploadOptions): Promise<string> {
    // TODO: Implement with AWS SDK
    console.log(`[S3 Storage] Upload not implemented - would upload to ${this.bucket}/${key}`)
    throw new Error("S3 upload not implemented - install @aws-sdk/client-s3")
  }

  async download(key: string): Promise<Buffer> {
    console.log(`[S3 Storage] Download not implemented - would download from ${this.bucket}/${key}`)
    throw new Error("S3 download not implemented - install @aws-sdk/client-s3")
  }

  async delete(key: string): Promise<void> {
    console.log(`[S3 Storage] Delete not implemented - would delete ${this.bucket}/${key}`)
    throw new Error("S3 delete not implemented - install @aws-sdk/client-s3")
  }

  async getSignedUrl(key: string, options?: PresignedUrlOptions): Promise<string> {
    console.log(`[S3 Storage] Signed URL not implemented for ${key}`)
    throw new Error("S3 signed URL not implemented - install @aws-sdk/client-s3")
  }

  async getSignedUploadUrl(key: string, options?: StorageUploadOptions & PresignedUrlOptions): Promise<string> {
    console.log(`[S3 Storage] Signed upload URL not implemented for ${key}`)
    throw new Error("S3 signed upload URL not implemented - install @aws-sdk/client-s3")
  }

  async exists(key: string): Promise<boolean> {
    console.log(`[S3 Storage] Exists check not implemented for ${key}`)
    return false
  }

  async list(prefix: string): Promise<StorageObject[]> {
    console.log(`[S3 Storage] List not implemented for prefix ${prefix}`)
    return []
  }
}

// Factory function to create storage provider
function createStorageProvider(): StorageProvider {
  const useS3 = process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID
  
  if (useS3 && process.env.NODE_ENV === "production") {
    console.log("[Storage] Using S3 storage provider")
    return new S3StorageProvider()
  }
  
  console.log("[Storage] Using mock storage provider")
  return new MockStorageProvider()
}

// Singleton storage instance
export const storage = createStorageProvider()

// Helper functions for common operations
export function generateVideoKey(teamId: string, filename: string): string {
  const timestamp = Date.now()
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
  return `teams/${teamId}/videos/${timestamp}-${sanitized}`
}

export function generateThumbnailKey(videoKey: string): string {
  return `${videoKey.replace(/\.[^.]+$/, "")}-thumb.jpg`
}

export function generateFrameKey(sessionId: string, frameNumber: number): string {
  return `sessions/${sessionId}/frames/frame-${frameNumber.toString().padStart(6, "0")}.jpg`
}
