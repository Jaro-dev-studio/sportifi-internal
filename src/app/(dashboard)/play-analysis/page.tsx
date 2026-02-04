"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Video,
  Play,
  Plus,
  Clock,
  FileText,
  MoreVertical,
  Trash2,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

interface PlaySession {
  id: string
  name: string
  status: "DRAFT" | "ANALYZING" | "REVIEWED" | "COMPLETED"
  videoName: string
  playsCount: number
  createdAt: string
  updatedAt: string
}

export default function PlayAnalysisPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [sessions, setSessions] = useState<PlaySession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const teamSlug = searchParams.get("team")
  const currentTeam = session?.user?.teams?.find((t) => t.slug === teamSlug) || session?.user?.teams?.[0]

  useEffect(() => {
    const fetchSessions = async () => {
      if (!currentTeam) return

      try {
        // Mock data for development
        setSessions([
          {
            id: "s1",
            name: "Week 5 Analysis",
            status: "COMPLETED",
            videoName: "Week 5 vs Central High",
            playsCount: 12,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "s2",
            name: "Practice Review",
            status: "ANALYZING",
            videoName: "Practice - Oct 15",
            playsCount: 5,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ])
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [currentTeam])

  const getStatusBadge = (status: PlaySession["status"]) => {
    const variants: Record<PlaySession["status"], "default" | "secondary" | "success" | "warning"> = {
      DRAFT: "secondary",
      ANALYZING: "warning",
      REVIEWED: "default",
      COMPLETED: "success",
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Play Analysis</h1>
          <p className="text-slate-400 mt-1">
            Extract and analyze plays from game film
          </p>
        </div>
        <Link href="/play-analysis/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Analysis Session
          </Button>
        </Link>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-700 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-16 bg-slate-700 rounded flex items-center justify-center">
                      <Video className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                      <Link href={`/play-analysis/${session.id}`}>
                        <h3 className="font-medium text-white hover:text-blue-400">
                          {session.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-400">{session.videoName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {getStatusBadge(session.status)}
                        <span className="text-xs text-slate-400">
                          {session.playsCount} plays
                        </span>
                        <span className="text-xs text-slate-400">
                          Updated {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/play-analysis/${session.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Play Cards
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No analysis sessions</h3>
            <p className="text-slate-400 text-sm mb-4">
              Start by creating a new analysis session from your uploaded videos
            </p>
            <Link href="/play-analysis/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Analysis Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">How Play Analysis Works</CardTitle>
          <CardDescription className="text-slate-400">
            Transform game film into play cards in 4 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-500 font-bold">1</span>
              </div>
              <h4 className="font-medium text-white mb-1">Select Video</h4>
              <p className="text-sm text-slate-400">Choose a video to analyze</p>
            </div>
            <div className="text-center p-4">
              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-500 font-bold">2</span>
              </div>
              <h4 className="font-medium text-white mb-1">Segment Plays</h4>
              <p className="text-sm text-slate-400">Mark start/end of each play</p>
            </div>
            <div className="text-center p-4">
              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-500 font-bold">3</span>
              </div>
              <h4 className="font-medium text-white mb-1">Track Players</h4>
              <p className="text-sm text-slate-400">Assign jerseys and confirm positions</p>
            </div>
            <div className="text-center p-4">
              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-500 font-bold">4</span>
              </div>
              <h4 className="font-medium text-white mb-1">Generate Cards</h4>
              <p className="text-sm text-slate-400">Create animated play cards</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
