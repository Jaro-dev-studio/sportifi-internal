"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, FastForward } from "lucide-react"
import type { PlayerData, RouteArrow, FieldPosition } from "@/types"

interface AnimatedFieldProps {
  players: PlayerData[]
  routes: RouteArrow[]
  duration?: number // Total animation duration in seconds
  fieldConfig: {
    showYardLines: boolean
    showHashMarks: boolean
  }
  className?: string
}

// Field colors
const FIELD_GREEN = "#2d5016"
const FIELD_GREEN_ALT = "#3a6b1d"
const LINE_WHITE = "#ffffff"

export function AnimatedField({
  players,
  routes,
  duration = 5,
  fieldConfig,
  className,
}: AnimatedFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Convert normalized coordinates to canvas coordinates
  const toCanvasCoords = useCallback(
    (x: number, y: number) => ({
      x: (x / 100) * dimensions.width,
      y: (y / 100) * dimensions.height,
    }),
    [dimensions]
  )

  // Interpolate player position based on path and current time
  const getPlayerPosition = useCallback(
    (player: PlayerData, time: number): FieldPosition => {
      if (!player.path || player.path.length === 0) {
        return player.startPosition
      }

      // Normalize time to 0-1 range
      const normalizedTime = Math.min(time / duration, 1)
      
      // Find the two path points to interpolate between
      const pathWithStart = [
        { ...player.startPosition, timestamp: 0 },
        ...player.path.map((p) => ({ ...p, timestamp: p.timestamp / duration })),
      ]

      let startPoint = pathWithStart[0]
      let endPoint = pathWithStart[pathWithStart.length - 1]

      for (let i = 0; i < pathWithStart.length - 1; i++) {
        if (
          normalizedTime >= pathWithStart[i].timestamp &&
          normalizedTime <= pathWithStart[i + 1].timestamp
        ) {
          startPoint = pathWithStart[i]
          endPoint = pathWithStart[i + 1]
          break
        }
      }

      // Linear interpolation
      const segmentDuration = endPoint.timestamp - startPoint.timestamp
      const segmentProgress =
        segmentDuration > 0
          ? (normalizedTime - startPoint.timestamp) / segmentDuration
          : 0

      return {
        x: startPoint.x + (endPoint.x - startPoint.x) * segmentProgress,
        y: startPoint.y + (endPoint.y - startPoint.y) * segmentProgress,
      }
    },
    [duration]
  )

  // Draw the field
  const drawField = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = dimensions

      // Alternating stripes
      const stripeCount = 10
      const stripeWidth = width / stripeCount

      for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? FIELD_GREEN : FIELD_GREEN_ALT
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, height)
      }

      // Yard lines
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
      }

      // Hash marks
      if (fieldConfig.showHashMarks) {
        ctx.strokeStyle = "#cccccc"
        ctx.lineWidth = 1

        const hashY1 = height * 0.35
        const hashY2 = height * 0.65

        for (let i = 0; i <= 100; i++) {
          const x = (i / 100) * width
          ctx.beginPath()
          ctx.moveTo(x, hashY1 - 3)
          ctx.lineTo(x, hashY1 + 3)
          ctx.moveTo(x, hashY2 - 3)
          ctx.lineTo(x, hashY2 + 3)
          ctx.stroke()
        }
      }

      // End zones
      ctx.fillStyle = "rgba(255, 0, 0, 0.1)"
      ctx.fillRect(0, 0, width / 10, height)
      ctx.fillRect(width - width / 10, 0, width / 10, height)

      // Border
      ctx.strokeStyle = LINE_WHITE
      ctx.lineWidth = 3
      ctx.strokeRect(1, 1, width - 2, height - 2)
    },
    [dimensions, fieldConfig]
  )

  // Draw route trails (show path taken)
  const drawTrails = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      players.forEach((player) => {
        if (!player.path || player.path.length === 0) return

        const normalizedTime = Math.min(time / duration, 1)
        
        ctx.strokeStyle = player.color || (player.teamSide === "offense" ? "#3b82f6" : "#ef4444")
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.5
        ctx.setLineDash([4, 4])

        ctx.beginPath()
        const start = toCanvasCoords(player.startPosition.x, player.startPosition.y)
        ctx.moveTo(start.x, start.y)

        for (const point of player.path) {
          if (point.timestamp / duration <= normalizedTime) {
            const pos = toCanvasCoords(point.x, point.y)
            ctx.lineTo(pos.x, pos.y)
          }
        }

        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.setLineDash([])
      })
    },
    [players, duration, toCanvasCoords]
  )

  // Draw routes with animation
  const drawRoutes = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const normalizedTime = Math.min(time / duration, 1)

      routes.forEach((route) => {
        const start = toCanvasCoords(route.startPosition.x, route.startPosition.y)
        const end = toCanvasCoords(route.endPosition.x, route.endPosition.y)

        // Animate route drawing
        const animatedEnd = {
          x: start.x + (end.x - start.x) * normalizedTime,
          y: start.y + (end.y - start.y) * normalizedTime,
        }

        ctx.strokeStyle = route.color || "#fbbf24"
        ctx.lineWidth = 3

        if (route.type === "dashed") {
          ctx.setLineDash([8, 4])
        }

        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(animatedEnd.x, animatedEnd.y)
        ctx.stroke()

        // Arrow at current position
        if (normalizedTime > 0.1) {
          const angle = Math.atan2(end.y - start.y, end.x - start.x)
          const arrowLength = 10

          ctx.beginPath()
          ctx.moveTo(animatedEnd.x, animatedEnd.y)
          ctx.lineTo(
            animatedEnd.x - arrowLength * Math.cos(angle - Math.PI / 6),
            animatedEnd.y - arrowLength * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(animatedEnd.x, animatedEnd.y)
          ctx.lineTo(
            animatedEnd.x - arrowLength * Math.cos(angle + Math.PI / 6),
            animatedEnd.y - arrowLength * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        }

        ctx.setLineDash([])
      })
    },
    [routes, duration, toCanvasCoords]
  )

  // Draw players at current positions
  const drawPlayers = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      players.forEach((player) => {
        const position = getPlayerPosition(player, time)
        const pos = toCanvasCoords(position.x, position.y)
        const radius = 15

        // Player circle
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
        ctx.fillStyle =
          player.color || (player.teamSide === "offense" ? "#3b82f6" : "#ef4444")
        ctx.fill()

        // Team marker
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 14px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(player.teamSide === "offense" ? "O" : "X", pos.x, pos.y)

        // Jersey number
        if (player.jerseyNumber) {
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 10px sans-serif"
          ctx.fillText(player.jerseyNumber, pos.x, pos.y - radius - 8)
        }
      })
    },
    [players, getPlayerPosition, toCanvasCoords]
  )

  // Main render
  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawField(ctx)
      drawTrails(ctx, time)
      drawRoutes(ctx, time)
      drawPlayers(ctx, time)
    },
    [drawField, drawTrails, drawRoutes, drawPlayers]
  )

  // Animation loop
  useEffect(() => {
    let lastTime = 0

    const animate = (timestamp: number) => {
      if (!isPlaying) return

      const deltaTime = (timestamp - lastTime) / 1000
      lastTime = timestamp

      setCurrentTime((prev) => {
        const next = prev + deltaTime * playbackSpeed
        if (next >= duration) {
          setIsPlaying(false)
          return duration
        }
        return next
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      lastTime = performance.now()
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, duration])

  // Render on time change
  useEffect(() => {
    render(currentTime)
  }, [render, currentTime])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const width = rect.width
        const height = width * (9 / 16)
        setDimensions({ width, height })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const togglePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0)
    }
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const toggleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 0.5 : prev === 0.5 ? 2 : 1))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div ref={containerRef} className="relative w-full">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-lg shadow-lg"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 bg-slate-800 rounded-lg p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="text-slate-400 hover:text-white"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="text-slate-400 hover:text-white"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={currentTime}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={(value) => setCurrentTime(value)}
            className="w-full"
          />
        </div>

        <span className="text-sm text-slate-400 w-20 text-right">
          {currentTime.toFixed(1)}s / {duration}s
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSpeed}
          className="text-slate-400 hover:text-white"
        >
          <FastForward className="h-4 w-4 mr-1" />
          {playbackSpeed}x
        </Button>
      </div>
    </div>
  )
}
