"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  FileText,
  Check,
  ChevronRight,
  Play,
  ArrowLeft,
  Eye,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedField } from "@/components/field/animated-field"
import { formatDistanceToNow } from "date-fns"

interface AssignedPlay {
  id: string
  name: string
  formation: string
  playType: string
  watched: boolean
  watchedAt?: string
  notes?: string
}

interface PlayCardData {
  formation?: string
  playType?: string
  players: unknown[]
  routes: unknown[]
  annotations: unknown[]
  fieldConfig: {
    showYardLines: boolean
    showHashMarks: boolean
  }
}

export default function PlayerViewPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [assignedPlays, setAssignedPlays] = useState<AssignedPlay[]>([])
  const [selectedPlayId, setSelectedPlayId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const teamSlug = searchParams.get("team")
  const currentTeam = session?.user?.teams?.find((t) => t.slug === teamSlug) || session?.user?.teams?.[0]

  useEffect(() => {
    const fetchAssignedPlays = async () => {
      if (!currentTeam) return

      try {
        // Mock data for development
        setAssignedPlays([
          {
            id: "1",
            name: "Slant Right",
            formation: "Shotgun",
            playType: "offense",
            watched: true,
            watchedAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "2",
            name: "Zone Read Left",
            formation: "Shotgun",
            playType: "offense",
            watched: false,
          },
          {
            id: "3",
            name: "Screen Pass",
            formation: "Pro Set",
            playType: "offense",
            watched: false,
          },
          {
            id: "4",
            name: "Cover 3 Zone",
            formation: "4-3",
            playType: "defense",
            watched: true,
            watchedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ])
      } catch (error) {
        console.error("Failed to fetch assigned plays:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignedPlays()
  }, [currentTeam])

  const watchedCount = assignedPlays.filter((p) => p.watched).length
  const progressPercent = assignedPlays.length > 0 
    ? Math.round((watchedCount / assignedPlays.length) * 100) 
    : 0

  const selectedPlay = assignedPlays.find((p) => p.id === selectedPlayId)

  // Mock play card data for the selected play
  const mockPlayCardData: PlayCardData = {
    formation: selectedPlay?.formation,
    playType: selectedPlay?.playType,
    players: [
      { id: "p1", jerseyNumber: "12", label: "QB", teamSide: "offense", startPosition: { x: 50, y: 62 }, path: [], color: "#3b82f6" },
      { id: "p2", jerseyNumber: "25", label: "RB", teamSide: "offense", startPosition: { x: 45, y: 68 }, path: [], color: "#3b82f6" },
      { id: "p3", jerseyNumber: "88", label: "WR1", teamSide: "offense", startPosition: { x: 15, y: 55 }, path: [{ x: 25, y: 45, timestamp: 1 }], color: "#3b82f6" },
      { id: "p4", jerseyNumber: "81", label: "WR2", teamSide: "offense", startPosition: { x: 85, y: 55 }, path: [{ x: 75, y: 45, timestamp: 1 }], color: "#3b82f6" },
    ],
    routes: [
      { id: "r1", startPosition: { x: 15, y: 55 }, endPosition: { x: 30, y: 40 }, type: "solid", color: "#fbbf24" },
      { id: "r2", startPosition: { x: 85, y: 55 }, endPosition: { x: 70, y: 40 }, type: "solid", color: "#fbbf24" },
    ],
    annotations: [],
    fieldConfig: { showYardLines: true, showHashMarks: true },
  }

  const markAsWatched = (playId: string) => {
    setAssignedPlays((prev) =>
      prev.map((p) =>
        p.id === playId
          ? { ...p, watched: true, watchedAt: new Date().toISOString() }
          : p
      )
    )
  }

  if (selectedPlay) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPlayId(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{selectedPlay.name}</h1>
              <p className="text-sm text-slate-400">
                {selectedPlay.formation} - {selectedPlay.playType}
              </p>
            </div>
            {!selectedPlay.watched && (
              <Button onClick={() => markAsWatched(selectedPlay.id)}>
                <Check className="h-4 w-4 mr-2" />
                Mark as Watched
              </Button>
            )}
          </div>

          {/* Animated Play Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <AnimatedField
                players={mockPlayCardData.players as any}
                routes={mockPlayCardData.routes as any}
                fieldConfig={mockPlayCardData.fieldConfig}
                duration={5}
              />
            </CardContent>
          </Card>

          {/* Play Details */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Play Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Formation</p>
                  <p className="text-white">{selectedPlay.formation}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Play Type</p>
                  <p className="text-white capitalize">{selectedPlay.playType}</p>
                </div>
              </div>
              {selectedPlay.notes && (
                <div>
                  <p className="text-sm text-slate-400">Coach Notes</p>
                  <p className="text-white">{selectedPlay.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Playbook</h1>
            <p className="text-slate-400 mt-1">
              Review your assigned plays
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Progress Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-slate-700">
                    {session?.user?.name?.[0] || "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{session?.user?.name}</p>
                  <p className="text-sm text-slate-400">{currentTeam?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{progressPercent}%</p>
                <p className="text-sm text-slate-400">Complete</p>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-slate-400 mt-2">
              {watchedCount} of {assignedPlays.length} plays reviewed
            </p>
          </CardContent>
        </Card>

        {/* Plays List */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white">Assigned Plays</h2>
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-700 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : assignedPlays.length > 0 ? (
            <div className="space-y-2">
              {assignedPlays.map((play) => (
                <Card
                  key={play.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedPlayId(play.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          play.watched ? "bg-green-500/20" : "bg-slate-700"
                        }`}>
                          {play.watched ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{play.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span>{play.formation}</span>
                            <span>-</span>
                            <Badge variant="outline" className="capitalize">
                              {play.playType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {play.watched && play.watchedAt && (
                          <span className="text-xs text-slate-400">
                            Watched {formatDistanceToNow(new Date(play.watchedAt), { addSuffix: true })}
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No plays assigned</h3>
                <p className="text-slate-400 text-sm">
                  Your coach hasn't assigned any plays yet
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
