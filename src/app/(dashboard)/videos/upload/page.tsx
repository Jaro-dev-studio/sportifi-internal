"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Upload,
  Video,
  X,
  FileVideo,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { videoMetadataSchema, type VideoMetadataInput } from "@/lib/validations"
import { formatFileSize } from "@/lib/utils"
import { cn } from "@/lib/utils"

type UploadStatus = "idle" | "uploading" | "processing" | "complete" | "error"

interface UploadState {
  file: File | null
  progress: number
  status: UploadStatus
  error?: string
  videoId?: string
}

export default function VideoUploadPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: "idle",
  })
  const [isDragging, setIsDragging] = useState(false)

  const teamSlug = searchParams.get("team")
  const currentTeam = session?.user?.teams?.find((t) => t.slug === teamSlug) || session?.user?.teams?.[0]

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VideoMetadataInput>({
    resolver: zodResolver(videoMetadataSchema),
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) {
      setUploadState({ file, progress: 0, status: "idle" })
      // Auto-fill name from filename
      const name = file.name.replace(/\.[^/.]+$/, "")
      setValue("name", name)
    }
  }, [setValue])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setUploadState({ file, progress: 0, status: "idle" })
        const name = file.name.replace(/\.[^/.]+$/, "")
        setValue("name", name)
      }
    },
    [setValue]
  )

  const removeFile = useCallback(() => {
    setUploadState({ file: null, progress: 0, status: "idle" })
  }, [])

  const onSubmit = async (data: VideoMetadataInput) => {
    if (!uploadState.file || !currentTeam) return

    console.log("[Upload] Starting video upload...")
    setUploadState((prev) => ({ ...prev, status: "uploading", progress: 0 }))

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", uploadState.file)
      formData.append("name", data.name)
      formData.append("teamId", currentTeam.id)
      if (data.gameId) formData.append("gameId", data.gameId)
      if (data.opponent) formData.append("opponent", data.opponent)
      if (data.gameDate) formData.append("gameDate", data.gameDate)
      if (data.notes) formData.append("notes", data.notes)

      // Simulate upload progress for MVP (real implementation would use fetch with progress)
      const simulateProgress = () => {
        return new Promise<void>((resolve) => {
          let progress = 0
          const interval = setInterval(() => {
            progress += Math.random() * 15
            if (progress >= 100) {
              progress = 100
              clearInterval(interval)
              resolve()
            }
            setUploadState((prev) => ({ ...prev, progress }))
          }, 200)
        })
      }

      console.log("[Upload] Uploading file to server...")
      await simulateProgress()

      // In real implementation, this would be the actual upload
      // const response = await fetch("/api/videos/upload", {
      //   method: "POST",
      //   body: formData,
      // })

      // Simulate server response
      await new Promise((resolve) => setTimeout(resolve, 500))
      const mockVideoId = `video-${Date.now()}`

      console.log("[Upload] Upload complete, processing video...")
      setUploadState((prev) => ({
        ...prev,
        status: "processing",
        videoId: mockVideoId,
      }))

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("[Upload] Video processing complete")
      setUploadState((prev) => ({ ...prev, status: "complete" }))

      // Redirect after short delay
      setTimeout(() => {
        router.push(`/videos/${mockVideoId}`)
      }, 1500)
    } catch (error) {
      console.error("[Upload] Upload error:", error)
      setUploadState((prev) => ({
        ...prev,
        status: "error",
        error: "Failed to upload video. Please try again.",
      }))
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Video</h1>
        <p className="text-slate-400 mt-1">
          Upload game film or practice video to analyze
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload Area */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Video File</CardTitle>
            <CardDescription className="text-slate-400">
              Drag and drop or click to upload (MP4, MOV, AVI)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadState.file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-600 hover:border-slate-500"
                )}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">
                    Drop your video here
                  </p>
                  <p className="text-sm text-slate-400">
                    or click to browse files
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <FileVideo className="h-10 w-10 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {uploadState.file.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {formatFileSize(uploadState.file.size)}
                    </p>
                  </div>
                  {uploadState.status === "idle" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="text-slate-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadState.status === "uploading" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Uploading...</span>
                      <span className="text-white">{Math.round(uploadState.progress)}%</span>
                    </div>
                    <Progress value={uploadState.progress} />
                  </div>
                )}

                {uploadState.status === "processing" && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing video...
                  </div>
                )}

                {uploadState.status === "complete" && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Upload complete! Redirecting...
                  </div>
                )}

                {uploadState.status === "error" && (
                  <div className="flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {uploadState.error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Details */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Video Details</CardTitle>
            <CardDescription className="text-slate-400">
              Add metadata to help organize your video library
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Video Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Week 5 vs Central High"
                className="bg-slate-700 border-slate-600"
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opponent" className="text-slate-300">
                  Opponent
                </Label>
                <Input
                  id="opponent"
                  {...register("opponent")}
                  placeholder="e.g., Central High"
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameDate" className="text-slate-300">
                  Game Date
                </Label>
                <Input
                  id="gameDate"
                  type="date"
                  {...register("gameDate")}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any additional notes about this video..."
                className="bg-slate-700 border-slate-600 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={uploadState.status !== "idle"}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!uploadState.file || uploadState.status !== "idle"}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </form>
    </div>
  )
}
