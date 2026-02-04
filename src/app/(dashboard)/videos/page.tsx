"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Video,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Play,
  Clock,
  Calendar,
  Trash2,
  Edit,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDistanceToNow, format } from "date-fns"
import { formatDuration, formatFileSize } from "@/lib/utils"

interface VideoAsset {
  id: string
  name: string
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED"
  duration?: number
  fileSize: number
  createdAt: string
  game?: {
    id: string
    name: string
    opponent?: string
    gameDate?: string
  }
  playSessionsCount: number
}

export default function VideosPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [videos, setVideos] = useState<VideoAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const teamSlug = searchParams.get("team")
  const currentTeam = session?.user?.teams?.find((t) => t.slug === teamSlug) || session?.user?.teams?.[0]

  useEffect(() => {
    const fetchVideos = async () => {
      if (!currentTeam) return

      try {
        const response = await fetch(`/api/teams/${currentTeam.id}/videos`)
        if (response.ok) {
          const data = await response.json()
          setVideos(data)
        } else {
          // Mock data for development
          setVideos([
            {
              id: "1",
              name: "Week 5 vs Central High",
              status: "READY",
              duration: 3600,
              fileSize: 1024 * 1024 * 500,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              game: {
                id: "g1",
                name: "Week 5 Game",
                opponent: "Central High",
                gameDate: new Date(Date.now() - 86400000 * 3).toISOString(),
              },
              playSessionsCount: 3,
            },
            {
              id: "2",
              name: "Practice - Oct 15",
              status: "PROCESSING",
              duration: 2400,
              fileSize: 1024 * 1024 * 350,
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              playSessionsCount: 0,
            },
            {
              id: "3",
              name: "Week 4 vs Riverside",
              status: "READY",
              duration: 3200,
              fileSize: 1024 * 1024 * 420,
              createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
              game: {
                id: "g2",
                name: "Week 4 Game",
                opponent: "Riverside",
                gameDate: new Date(Date.now() - 86400000 * 10).toISOString(),
              },
              playSessionsCount: 5,
            },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [currentTeam])

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || video.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: VideoAsset["status"]) => {
    const variants: Record<VideoAsset["status"], "default" | "secondary" | "success" | "destructive"> = {
      UPLOADING: "secondary",
      PROCESSING: "default",
      READY: "success",
      FAILED: "destructive",
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Videos</h1>
          <p className="text-slate-400 mt-1">
            Manage your game film and practice videos
          </p>
        </div>
        <Link href="/videos/upload">
          <Button size="lg">
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="UPLOADING">Uploading</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
              <div className="aspect-video bg-slate-700" />
              <CardContent className="p-4">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-700 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
            >
              {/* Video Thumbnail */}
              <Link href={`/videos/${video.id}`}>
                <div className="aspect-video bg-slate-700 relative group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-12 w-12 text-slate-500" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
              </Link>

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/videos/${video.id}`}>
                      <h3 className="font-medium text-white truncate hover:text-blue-400">
                        {video.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {getStatusBadge(video.status)}
                      <span className="text-xs text-slate-400">
                        {formatFileSize(video.fileSize)}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/videos/${video.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          View Video
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/play-analysis/new?videoId=${video.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Create Plays
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/videos/${video.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {video.game && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>
                      vs {video.game.opponent} - {video.game.gameDate && format(new Date(video.game.gameDate), "MMM d")}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                  </div>
                  {video.playSessionsCount > 0 && (
                    <span>{video.playSessionsCount} play sessions</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No videos found</h3>
            <p className="text-slate-400 text-sm mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload your first game film to get started"}
            </p>
            <Link href="/videos/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
