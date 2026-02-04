"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Trash2,
  Edit,
  Share2,
  FolderPlus,
  Grid,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"

interface PlayCard {
  id: string
  name: string
  type: "ACTUAL" | "COACHING" | "MANUAL"
  playType?: string
  formation?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function PlayCardsPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [playCards, setPlayCards] = useState<PlayCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const teamSlug = searchParams.get("team")
  const currentTeam = session?.user?.teams?.find((t) => t.slug === teamSlug) || session?.user?.teams?.[0]

  useEffect(() => {
    const fetchPlayCards = async () => {
      if (!currentTeam) return

      try {
        const response = await fetch(`/api/teams/${currentTeam.id}/play-cards`)
        if (response.ok) {
          const data = await response.json()
          setPlayCards(data)
        } else {
          // Mock data
          setPlayCards([
            {
              id: "1",
              name: "Slant Right",
              type: "MANUAL",
              playType: "offense",
              formation: "Shotgun",
              tags: ["passing", "quick"],
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              updatedAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: "2",
              name: "Zone Read Left",
              type: "ACTUAL",
              playType: "offense",
              formation: "Spread",
              tags: ["run", "zone"],
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "3",
              name: "Cover 3 Zone",
              type: "MANUAL",
              playType: "defense",
              formation: "4-3",
              tags: ["zone", "coverage"],
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "4",
              name: "Screen Pass",
              type: "COACHING",
              playType: "offense",
              formation: "Pro",
              tags: ["screen", "passing"],
              createdAt: new Date(Date.now() - 259200000).toISOString(),
              updatedAt: new Date(Date.now() - 172800000).toISOString(),
            },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch play cards:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayCards()
  }, [currentTeam])

  const filteredCards = playCards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = typeFilter === "all" || card.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeBadge = (type: PlayCard["type"]) => {
    const variants: Record<PlayCard["type"], "default" | "secondary" | "outline"> = {
      ACTUAL: "default",
      COACHING: "secondary",
      MANUAL: "outline",
    }
    const labels: Record<PlayCard["type"], string> = {
      ACTUAL: "From Film",
      COACHING: "Coaching",
      MANUAL: "Manual",
    }
    return <Badge variant={variants[type]}>{labels[type]}</Badge>
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Play Cards</h1>
          <p className="text-slate-400 mt-1">
            Create and manage your play diagrams
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/play-cards/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Play Card
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search play cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="ACTUAL">From Film</SelectItem>
              <SelectItem value="COACHING">Coaching</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-8 w-8"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Play Type Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="offense">Offense</TabsTrigger>
          <TabsTrigger value="defense">Defense</TabsTrigger>
          <TabsTrigger value="special">Special Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                  <div className="aspect-[4/3] bg-slate-700" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-700 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCards.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCards.map((card) => (
                  <Card
                    key={card.id}
                    className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors group"
                  >
                    <Link href={`/play-cards/${card.id}`}>
                      <div className="aspect-[4/3] bg-slate-700 relative flex items-center justify-center">
                        <FileText className="h-10 w-10 text-slate-500" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </Link>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Link href={`/play-cards/${card.id}`}>
                            <h3 className="font-medium text-white truncate hover:text-blue-400">
                              {card.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {getTypeBadge(card.type)}
                            {card.formation && (
                              <span className="text-xs text-slate-400">{card.formation}</span>
                            )}
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
                              <Link href={`/play-cards/${card.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FolderPlus className="h-4 w-4 mr-2" />
                              Add to Playbook
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-400 mt-2">
                        Updated {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCards.map((card) => (
                  <Card
                    key={card.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-16 bg-slate-700 rounded flex items-center justify-center">
                        <FileText className="h-6 w-6 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/play-cards/${card.id}`}>
                          <h3 className="font-medium text-white hover:text-blue-400">
                            {card.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeBadge(card.type)}
                          {card.formation && (
                            <span className="text-xs text-slate-400">{card.formation}</span>
                          )}
                          <span className="text-xs text-slate-400">
                            Updated {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/play-cards/${card.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No play cards found</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {searchQuery || typeFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first play card to get started"}
                </p>
                <Link href="/play-cards/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Play Card
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Other tabs would filter by playType */}
        <TabsContent value="offense" className="mt-6">
          {/* Similar content filtered for offense */}
        </TabsContent>
        <TabsContent value="defense" className="mt-6">
          {/* Similar content filtered for defense */}
        </TabsContent>
        <TabsContent value="special" className="mt-6">
          {/* Similar content filtered for special teams */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
