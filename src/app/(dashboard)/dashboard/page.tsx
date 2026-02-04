"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Video,
  FileText,
  Play,
  Upload,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface DashboardStats {
  totalVideos: number
  totalPlayCards: number
  totalPlays: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    userName: string
    timestamp: string
  }>
  recentVideos: Array<{
    id: string
    name: string
    status: string
    createdAt: string
  }>
  recentPlayCards: Array<{
    id: string
    name: string
    type: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const teamSlug = searchParams.get("team")
  const currentTeam = session?.user?.teams?.find((t) => t.slug === teamSlug) || session?.user?.teams?.[0]

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentTeam) return
      
      try {
        const response = await fetch(`/api/teams/${currentTeam.id}/stats`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          // Use mock data for demo
          setStats({
            totalVideos: 12,
            totalPlayCards: 47,
            totalPlays: 156,
            recentActivity: [
              { id: "1", type: "play_card", description: "Created play card 'Slant Right'", userName: "Coach Smith", timestamp: new Date(Date.now() - 3600000).toISOString() },
              { id: "2", type: "video", description: "Uploaded game film vs Central High", userName: "Coach Smith", timestamp: new Date(Date.now() - 7200000).toISOString() },
              { id: "3", type: "play", description: "Analyzed 5 new plays", userName: "Coach Johnson", timestamp: new Date(Date.now() - 86400000).toISOString() },
            ],
            recentVideos: [
              { id: "1", name: "Week 5 vs Central High", status: "READY", createdAt: new Date(Date.now() - 86400000).toISOString() },
              { id: "2", name: "Practice - Oct 15", status: "PROCESSING", createdAt: new Date(Date.now() - 172800000).toISOString() },
            ],
            recentPlayCards: [
              { id: "1", name: "Slant Right", type: "MANUAL", createdAt: new Date(Date.now() - 3600000).toISOString() },
              { id: "2", name: "Zone Read Left", type: "ACTUAL", createdAt: new Date(Date.now() - 86400000).toISOString() },
              { id: "3", name: "Screen Pass", type: "COACHING", createdAt: new Date(Date.now() - 172800000).toISOString() },
            ],
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [currentTeam])

  if (!currentTeam) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Welcome to PlayCard</CardTitle>
            <CardDescription className="text-slate-400">
              Get started by creating or joining a team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/settings/create-team">
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create a New Team
              </Button>
            </Link>
            <p className="text-center text-sm text-slate-500">
              Or wait for a team invite from your coach
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {session?.user?.name?.split(" ")[0] || "Coach"}
          </h1>
          <p className="text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with {currentTeam.name}
          </p>
        </div>
        <Link href="/videos/upload">
          <Button size="lg" className="w-full md:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Upload Game Film
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Videos</p>
                <p className="text-2xl font-bold text-white">{stats?.totalVideos || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Play Cards</p>
                <p className="text-2xl font-bold text-white">{stats?.totalPlayCards || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Plays Analyzed</p>
                <p className="text-2xl font-bold text-white">{stats?.totalPlays || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Play className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Team Members</p>
                <p className="text-2xl font-bold text-white">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Videos */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Videos</CardTitle>
              <CardDescription className="text-slate-400">
                Your latest game film uploads
              </CardDescription>
            </div>
            <Link href="/videos">
              <Button variant="ghost" size="sm" className="text-slate-400">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats?.recentVideos && stats.recentVideos.length > 0 ? (
              <div className="space-y-4">
                {stats.recentVideos.map((video) => (
                  <Link 
                    key={video.id} 
                    href={`/videos/${video.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="h-16 w-24 bg-slate-700 rounded-md flex items-center justify-center">
                      <Video className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{video.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={video.status === "READY" ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {video.status}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No videos uploaded yet</p>
                <Link href="/videos/upload" className="mt-3 inline-block">
                  <Button variant="outline" size="sm">
                    Upload your first video
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Activity</CardTitle>
            <CardDescription className="text-slate-400">
              Recent team activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-sm text-white">
                      {activity.userName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activity.userName} - {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Play Cards */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Recent Play Cards</CardTitle>
            <CardDescription className="text-slate-400">
              Your latest play cards and diagrams
            </CardDescription>
          </div>
          <Link href="/play-cards">
            <Button variant="ghost" size="sm" className="text-slate-400">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats?.recentPlayCards && stats.recentPlayCards.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentPlayCards.map((card) => (
                <Link 
                  key={card.id} 
                  href={`/play-cards/${card.id}`}
                  className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  <div className="aspect-[4/3] bg-slate-600 rounded-md mb-3 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="font-medium text-white truncate">{card.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {card.type}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(card.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No play cards created yet</p>
              <Link href="/play-cards/new" className="mt-3 inline-block">
                <Button variant="outline" size="sm">
                  Create your first play card
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
