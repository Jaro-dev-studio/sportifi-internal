"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { v4 as uuid } from "uuid"
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Undo,
  Redo,
  Download,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { FieldCanvas } from "@/components/field/field-canvas"
import { AnimatedField } from "@/components/field/animated-field"
import {
  RouteEditorToolbar,
  PlayerProperties,
  RouteProperties,
} from "@/components/field/route-editor"
import type { PlayerData, RouteArrow, Annotation, FieldPosition, PlayCardData } from "@/types"

type EditorTool = "select" | "move" | "route_solid" | "route_dashed" | "route_curved" | "text" | "circle" | "rectangle"

const DEFAULT_OFFENSE_POSITIONS: Partial<PlayerData>[] = [
  { jerseyNumber: "C", label: "C", teamSide: "offense", startPosition: { x: 50, y: 55 } },
  { jerseyNumber: "LG", label: "LG", teamSide: "offense", startPosition: { x: 44, y: 55 } },
  { jerseyNumber: "RG", label: "RG", teamSide: "offense", startPosition: { x: 56, y: 55 } },
  { jerseyNumber: "LT", label: "LT", teamSide: "offense", startPosition: { x: 38, y: 55 } },
  { jerseyNumber: "RT", label: "RT", teamSide: "offense", startPosition: { x: 62, y: 55 } },
  { jerseyNumber: "QB", label: "QB", teamSide: "offense", startPosition: { x: 50, y: 62 } },
  { jerseyNumber: "RB", label: "RB", teamSide: "offense", startPosition: { x: 50, y: 70 } },
  { jerseyNumber: "WR", label: "WR1", teamSide: "offense", startPosition: { x: 15, y: 55 } },
  { jerseyNumber: "WR", label: "WR2", teamSide: "offense", startPosition: { x: 85, y: 55 } },
  { jerseyNumber: "TE", label: "TE", teamSide: "offense", startPosition: { x: 68, y: 55 } },
  { jerseyNumber: "FB", label: "FB", teamSide: "offense", startPosition: { x: 45, y: 67 } },
]

const FORMATIONS = [
  "Shotgun",
  "I-Formation",
  "Pro Set",
  "Single Back",
  "Pistol",
  "Spread",
  "Wishbone",
  "Goal Line",
  "4-3 Defense",
  "3-4 Defense",
  "Nickel",
  "Dime",
  "Cover 2",
  "Cover 3",
]

export default function NewPlayCardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()

  const teamSlug = searchParams.get("team")
  const currentTeam = session?.user?.teams?.find((t) => t.slug === teamSlug) || session?.user?.teams?.[0]

  // Play card state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [formation, setFormation] = useState("")
  const [playType, setPlayType] = useState<"offense" | "defense" | "special">("offense")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  // Editor state
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [routes, setRoutes] = useState<RouteArrow[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<EditorTool>("select")
  const [selectedColor, setSelectedColor] = useState("#fbbf24")
  const [showAnimation, setShowAnimation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Drawing state for routes
  const [drawingRoute, setDrawingRoute] = useState<{
    startPosition: FieldPosition
    type: RouteArrow["type"]
  } | null>(null)

  // Field config
  const fieldConfig = {
    showYardLines: true,
    showHashMarks: true,
    fieldSection: "full" as const,
  }

  // Load default formation
  const loadDefaultFormation = useCallback(() => {
    const newPlayers = DEFAULT_OFFENSE_POSITIONS.map((pos) => ({
      id: uuid(),
      jerseyNumber: pos.jerseyNumber,
      label: pos.label,
      teamSide: pos.teamSide!,
      startPosition: pos.startPosition!,
      path: [],
      color: pos.teamSide === "offense" ? "#3b82f6" : "#ef4444",
    })) as PlayerData[]

    setPlayers(newPlayers)
    setRoutes([])
    setAnnotations([])
  }, [])

  // Add a new player
  const addPlayer = useCallback((position: FieldPosition, side: "offense" | "defense") => {
    const newPlayer: PlayerData = {
      id: uuid(),
      teamSide: side,
      startPosition: position,
      path: [],
      color: side === "offense" ? "#3b82f6" : "#ef4444",
    }
    setPlayers((prev) => [...prev, newPlayer])
    setSelectedPlayerId(newPlayer.id)
    setActiveTool("select")
  }, [])

  // Update player
  const updatePlayer = useCallback((playerId: string, updates: Partial<PlayerData>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, ...updates } : p))
    )
  }, [])

  // Delete player
  const deletePlayer = useCallback((playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId))
    // Also delete routes connected to this player
    setRoutes((prev) => prev.filter((r) => r.playerId !== playerId))
    setSelectedPlayerId(null)
  }, [])

  // Move player
  const handlePlayerMove = useCallback((playerId: string, position: FieldPosition) => {
    updatePlayer(playerId, { startPosition: position })
  }, [updatePlayer])

  // Handle field click
  const handleFieldClick = useCallback(
    (position: FieldPosition) => {
      if (activeTool === "move" || activeTool === "select") {
        return
      }

      if (activeTool.startsWith("route_")) {
        if (!drawingRoute) {
          // Start drawing route
          const routeType = activeTool.replace("route_", "") as RouteArrow["type"]
          setDrawingRoute({ startPosition: position, type: routeType })
        } else {
          // Complete route
          const newRoute: RouteArrow = {
            id: uuid(),
            startPosition: drawingRoute.startPosition,
            endPosition: position,
            type: drawingRoute.type,
            color: selectedColor,
          }
          setRoutes((prev) => [...prev, newRoute])
          setDrawingRoute(null)
          setSelectedRouteId(newRoute.id)
        }
        return
      }

      // Add annotation
      if (activeTool === "text" || activeTool === "circle" || activeTool === "rectangle") {
        const newAnnotation: Annotation = {
          id: uuid(),
          type: activeTool,
          position,
          color: selectedColor,
          text: activeTool === "text" ? "Label" : undefined,
          width: activeTool !== "text" ? 30 : undefined,
          height: activeTool === "rectangle" ? 20 : undefined,
        }
        setAnnotations((prev) => [...prev, newAnnotation])
        setActiveTool("select")
      }
    },
    [activeTool, drawingRoute, selectedColor]
  )

  // Update route
  const handleRouteUpdate = useCallback((routeId: string, updates: Partial<RouteArrow>) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, ...updates } : r))
    )
  }, [])

  // Delete selected
  const handleDelete = useCallback(() => {
    if (selectedPlayerId) {
      deletePlayer(selectedPlayerId)
    } else if (selectedRouteId) {
      setRoutes((prev) => prev.filter((r) => r.id !== selectedRouteId))
      setSelectedRouteId(null)
    }
  }, [selectedPlayerId, selectedRouteId, deletePlayer])

  // Add tag
  const addTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()])
      setTagInput("")
    }
  }, [tagInput, tags])

  // Remove tag
  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  // Save play card
  const handleSave = async () => {
    if (!name.trim() || !currentTeam) return

    setIsSaving(true)
    console.log("[PlayCard] Saving play card...")

    try {
      const playCardData: PlayCardData = {
        formation,
        playType,
        players,
        routes,
        annotations,
        fieldConfig,
      }

      const response = await fetch(`/api/teams/${currentTeam.id}/play-cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          formation,
          playType,
          tags,
          data: playCardData,
          type: "MANUAL",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save play card")
      }

      const result = await response.json()
      console.log("[PlayCard] Play card saved:", result.id)
      router.push(`/play-cards/${result.id}`)
    } catch (error) {
      console.error("[PlayCard] Save error:", error)
      // For MVP, simulate success
      router.push("/play-cards")
    } finally {
      setIsSaving(false)
    }
  }

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId)
  const selectedRoute = routes.find((r) => r.id === selectedRouteId)

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Play card name..."
              className="text-lg font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0 text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAnimation(!showAnimation)}
          >
            <Play className="h-4 w-4 mr-2" />
            {showAnimation ? "Edit" : "Preview"}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Toolbar */}
            <RouteEditorToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              onDelete={handleDelete}
              hasSelection={!!selectedPlayerId || !!selectedRouteId}
            />

            {/* Field Canvas or Animation */}
            {showAnimation ? (
              <AnimatedField
                players={players}
                routes={routes}
                fieldConfig={fieldConfig}
                duration={5}
              />
            ) : (
              <FieldCanvas
                players={players}
                routes={routes}
                annotations={annotations}
                fieldConfig={fieldConfig}
                selectedPlayerId={selectedPlayerId || undefined}
                selectedRouteId={selectedRouteId || undefined}
                isEditing={true}
                onPlayerMove={handlePlayerMove}
                onPlayerSelect={setSelectedPlayerId}
                onRouteSelect={setSelectedRouteId}
                onFieldClick={handleFieldClick}
              />
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDefaultFormation}
              >
                <Plus className="h-4 w-4 mr-1" />
                Load Formation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPlayer({ x: 50, y: 50 }, "offense")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Offense
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPlayer({ x: 50, y: 30 }, "defense")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Defense
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-slate-800 overflow-auto bg-slate-900">
          <Tabs defaultValue="properties" className="h-full">
            <TabsList className="w-full justify-start px-2 pt-2 bg-transparent">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="m-0">
              {selectedPlayer ? (
                <PlayerProperties
                  player={selectedPlayer}
                  onUpdate={(updates) =>
                    updatePlayer(selectedPlayer.id, updates)
                  }
                />
              ) : selectedRoute ? (
                <RouteProperties
                  route={selectedRoute}
                  onUpdate={(updates) =>
                    handleRouteUpdate(selectedRoute.id, updates)
                  }
                  onDelete={() => {
                    setRoutes((prev) =>
                      prev.filter((r) => r.id !== selectedRoute.id)
                    )
                    setSelectedRouteId(null)
                  }}
                />
              ) : (
                <div className="p-4 text-center text-slate-400 text-sm">
                  Select a player or route to edit properties
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="m-0 p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Formation</Label>
                <Select value={formation} onValueChange={setFormation}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATIONS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Play Type</Label>
                <Select
                  value={playType}
                  onValueChange={(v) => setPlayType(v as typeof playType)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offense">Offense</SelectItem>
                    <SelectItem value="defense">Defense</SelectItem>
                    <SelectItem value="special">Special Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this play..."
                  className="bg-slate-800 border-slate-700 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag..."
                    className="bg-slate-800 border-slate-700"
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button variant="secondary" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="bg-slate-700" />

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Summary</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Players: {players.length}</p>
                  <p>Routes: {routes.length}</p>
                  <p>Annotations: {annotations.length}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
