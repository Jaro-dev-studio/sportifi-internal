"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { PlayerData, RouteArrow, Annotation, FieldPosition } from "@/types"

interface FieldCanvasProps {
  players: PlayerData[]
  routes: RouteArrow[]
  annotations: Annotation[]
  fieldConfig: {
    showYardLines: boolean
    showHashMarks: boolean
    fieldSection: "full" | "redzone" | "custom"
    customStartYard?: number
    customEndYard?: number
  }
  selectedPlayerId?: string
  selectedRouteId?: string
  isEditing?: boolean
  onPlayerMove?: (playerId: string, position: FieldPosition) => void
  onRouteUpdate?: (routeId: string, route: Partial<RouteArrow>) => void
  onPlayerSelect?: (playerId: string | null) => void
  onRouteSelect?: (routeId: string | null) => void
  onFieldClick?: (position: FieldPosition) => void
  className?: string
}

// Field dimensions in pixels (will scale with canvas)
const FIELD_WIDTH = 533 // ~53.3 yards width (standard football field)
const FIELD_HEIGHT = 300 // Variable based on view
const YARD_LINE_SPACING = 26.65 // 10 yards = 26.65 normalized units

// Colors
const FIELD_GREEN = "#2d5016"
const FIELD_GREEN_ALT = "#3a6b1d"
const LINE_WHITE = "#ffffff"
const HASH_GRAY = "#cccccc"

export function FieldCanvas({
  players,
  routes,
  annotations,
  fieldConfig,
  selectedPlayerId,
  selectedRouteId,
  isEditing = false,
  onPlayerMove,
  onRouteUpdate,
  onPlayerSelect,
  onRouteSelect,
  onFieldClick,
  className,
}: FieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragTarget, setDragTarget] = useState<{ type: "player" | "route"; id: string } | null>(null)

  // Convert normalized coordinates (0-100) to canvas coordinates
  const toCanvasCoords = useCallback(
    (x: number, y: number) => ({
      x: (x / 100) * dimensions.width,
      y: (y / 100) * dimensions.height,
    }),
    [dimensions]
  )

  // Convert canvas coordinates to normalized (0-100)
  const toNormalizedCoords = useCallback(
    (x: number, y: number) => ({
      x: (x / dimensions.width) * 100,
      y: (y / dimensions.height) * 100,
    }),
    [dimensions]
  )

  // Draw the football field
  const drawField = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = dimensions

      // Fill field with alternating stripes
      const stripeCount = 10
      const stripeWidth = width / stripeCount

      for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? FIELD_GREEN : FIELD_GREEN_ALT
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, height)
      }

      // Draw yard lines
      if (fieldConfig.showYardLines) {
        ctx.strokeStyle = LINE_WHITE
        ctx.lineWidth = 2

        for (let i = 0; i <= 10; i++) {
          const x = i * (width / 10)
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }

        // Draw yard numbers
        ctx.fillStyle = LINE_WHITE
        ctx.font = "bold 14px sans-serif"
        ctx.textAlign = "center"

        const yardNumbers = ["G", "10", "20", "30", "40", "50", "40", "30", "20", "10", "G"]
        for (let i = 0; i < yardNumbers.length; i++) {
          const x = i * (width / 10)
          ctx.fillText(yardNumbers[i], x, height - 10)
          ctx.fillText(yardNumbers[i], x, 20)
        }
      }

      // Draw hash marks
      if (fieldConfig.showHashMarks) {
        ctx.strokeStyle = HASH_GRAY
        ctx.lineWidth = 1

        const hashY1 = height * 0.35
        const hashY2 = height * 0.65
        const hashLength = 3

        for (let i = 0; i <= 100; i++) {
          const x = (i / 100) * width
          
          // Top hash
          ctx.beginPath()
          ctx.moveTo(x, hashY1 - hashLength)
          ctx.lineTo(x, hashY1 + hashLength)
          ctx.stroke()

          // Bottom hash
          ctx.beginPath()
          ctx.moveTo(x, hashY2 - hashLength)
          ctx.lineTo(x, hashY2 + hashLength)
          ctx.stroke()
        }
      }

      // Draw end zones
      ctx.fillStyle = "rgba(255, 0, 0, 0.1)"
      ctx.fillRect(0, 0, width / 10, height)
      ctx.fillRect(width - width / 10, 0, width / 10, height)

      // Draw sidelines
      ctx.strokeStyle = LINE_WHITE
      ctx.lineWidth = 3
      ctx.strokeRect(1, 1, width - 2, height - 2)
    },
    [dimensions, fieldConfig]
  )

  // Draw players
  const drawPlayers = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      players.forEach((player) => {
        const pos = toCanvasCoords(player.startPosition.x, player.startPosition.y)
        const isSelected = player.id === selectedPlayerId

        // Draw player circle
        const radius = isSelected ? 18 : 15
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
        
        // Fill based on team side
        if (player.teamSide === "offense") {
          ctx.fillStyle = player.color || "#3b82f6" // Blue for offense
        } else if (player.teamSide === "defense") {
          ctx.fillStyle = player.color || "#ef4444" // Red for defense
        } else {
          ctx.fillStyle = player.color || "#a855f7" // Purple for special
        }
        ctx.fill()

        // Draw selection ring
        if (isSelected) {
          ctx.strokeStyle = "#fbbf24"
          ctx.lineWidth = 3
          ctx.stroke()
        }

        // Draw X or O for team
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 14px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        
        if (player.teamSide === "offense") {
          ctx.fillText("O", pos.x, pos.y)
        } else {
          ctx.fillText("X", pos.x, pos.y)
        }

        // Draw jersey number above
        if (player.jerseyNumber) {
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 10px sans-serif"
          ctx.fillText(player.jerseyNumber, pos.x, pos.y - radius - 8)
        }

        // Draw position label below
        if (player.label) {
          ctx.fillStyle = "#94a3b8"
          ctx.font = "9px sans-serif"
          ctx.fillText(player.label, pos.x, pos.y + radius + 10)
        }
      })
    },
    [players, selectedPlayerId, toCanvasCoords]
  )

  // Draw routes
  const drawRoutes = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      routes.forEach((route) => {
        const start = toCanvasCoords(route.startPosition.x, route.startPosition.y)
        const end = toCanvasCoords(route.endPosition.x, route.endPosition.y)
        const isSelected = route.id === selectedRouteId

        ctx.strokeStyle = route.color || "#fbbf24"
        ctx.lineWidth = isSelected ? 4 : 3

        if (route.type === "dashed") {
          ctx.setLineDash([8, 4])
        } else {
          ctx.setLineDash([])
        }

        ctx.beginPath()
        ctx.moveTo(start.x, start.y)

        if (route.type === "curved" && route.controlPoints && route.controlPoints.length > 0) {
          // Draw curved line using control points
          const cp = route.controlPoints.map((p) => toCanvasCoords(p.x, p.y))
          if (cp.length === 1) {
            ctx.quadraticCurveTo(cp[0].x, cp[0].y, end.x, end.y)
          } else if (cp.length >= 2) {
            ctx.bezierCurveTo(cp[0].x, cp[0].y, cp[1].x, cp[1].y, end.x, end.y)
          }
        } else {
          ctx.lineTo(end.x, end.y)
        }
        ctx.stroke()

        // Draw arrow head
        const angle = Math.atan2(end.y - start.y, end.x - start.x)
        const arrowLength = 12
        const arrowAngle = Math.PI / 6

        ctx.beginPath()
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(
          end.x - arrowLength * Math.cos(angle - arrowAngle),
          end.y - arrowLength * Math.sin(angle - arrowAngle)
        )
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(
          end.x - arrowLength * Math.cos(angle + arrowAngle),
          end.y - arrowLength * Math.sin(angle + arrowAngle)
        )
        ctx.stroke()

        // Draw label
        if (route.label) {
          const midX = (start.x + end.x) / 2
          const midY = (start.y + end.y) / 2
          ctx.fillStyle = "#ffffff"
          ctx.font = "11px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(route.label, midX, midY - 10)
        }

        ctx.setLineDash([])
      })
    },
    [routes, selectedRouteId, toCanvasCoords]
  )

  // Draw annotations
  const drawAnnotations = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      annotations.forEach((annotation) => {
        const pos = toCanvasCoords(annotation.position.x, annotation.position.y)

        ctx.strokeStyle = annotation.color || "#ffffff"
        ctx.fillStyle = annotation.color || "#ffffff"
        ctx.lineWidth = 2

        switch (annotation.type) {
          case "text":
            ctx.font = "12px sans-serif"
            ctx.fillText(annotation.text || "", pos.x, pos.y)
            break

          case "circle":
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, annotation.width || 20, 0, Math.PI * 2)
            ctx.stroke()
            break

          case "rectangle":
            ctx.strokeRect(
              pos.x - (annotation.width || 40) / 2,
              pos.y - (annotation.height || 30) / 2,
              annotation.width || 40,
              annotation.height || 30
            )
            break

          case "freehand":
            if (annotation.points && annotation.points.length > 1) {
              ctx.beginPath()
              const firstPoint = toCanvasCoords(annotation.points[0].x, annotation.points[0].y)
              ctx.moveTo(firstPoint.x, firstPoint.y)
              
              for (let i = 1; i < annotation.points.length; i++) {
                const point = toCanvasCoords(annotation.points[i].x, annotation.points[i].y)
                ctx.lineTo(point.x, point.y)
              }
              ctx.stroke()
            }
            break
        }
      })
    },
    [annotations, toCanvasCoords]
  )

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw layers in order
    drawField(ctx)
    drawRoutes(ctx)
    drawPlayers(ctx)
    drawAnnotations(ctx)
  }, [drawField, drawRoutes, drawPlayers, drawAnnotations])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        // Maintain 16:9 aspect ratio
        const width = rect.width
        const height = width * (9 / 16)
        setDimensions({ width, height })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Re-render when dependencies change
  useEffect(() => {
    render()
  }, [render])

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const normalized = toNormalizedCoords(x, y)

    // Check if clicking on a player
    for (const player of players) {
      const playerPos = toCanvasCoords(player.startPosition.x, player.startPosition.y)
      const dist = Math.sqrt((x - playerPos.x) ** 2 + (y - playerPos.y) ** 2)
      
      if (dist < 20) {
        setIsDragging(true)
        setDragTarget({ type: "player", id: player.id })
        onPlayerSelect?.(player.id)
        return
      }
    }

    // Click on empty space
    onFieldClick?.(normalized)
    onPlayerSelect?.(null)
    onRouteSelect?.(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragTarget || !isEditing) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const normalized = toNormalizedCoords(x, y)

    if (dragTarget.type === "player") {
      onPlayerMove?.(dragTarget.id, normalized)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragTarget(null)
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className={cn(
          "rounded-lg shadow-lg",
          isEditing && "cursor-crosshair"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}
