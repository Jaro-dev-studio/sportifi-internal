"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  MousePointer2,
  Circle,
  Square,
  Type,
  Minus,
  ArrowUpRight,
  Trash2,
  Palette,
  Move,
  Pencil,
} from "lucide-react"
import type { RouteArrow, Annotation, FieldPosition, PlayerData } from "@/types"

type EditorTool =
  | "select"
  | "move"
  | "route_solid"
  | "route_dashed"
  | "route_curved"
  | "text"
  | "circle"
  | "rectangle"

interface RouteEditorToolbarProps {
  activeTool: EditorTool
  onToolChange: (tool: EditorTool) => void
  selectedColor: string
  onColorChange: (color: string) => void
  onDelete: () => void
  hasSelection: boolean
}

const COLORS = [
  "#fbbf24", // Yellow
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#a855f7", // Purple
  "#f97316", // Orange
  "#ffffff", // White
  "#000000", // Black
]

export function RouteEditorToolbar({
  activeTool,
  onToolChange,
  selectedColor,
  onColorChange,
  onDelete,
  hasSelection,
}: RouteEditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
      {/* Selection Tools */}
      <div className="flex items-center border-r border-slate-700 pr-2">
        <Button
          variant={activeTool === "select" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("select")}
          title="Select"
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "move" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("move")}
          title="Move"
        >
          <Move className="h-4 w-4" />
        </Button>
      </div>

      {/* Route Tools */}
      <div className="flex items-center border-r border-slate-700 pr-2">
        <Button
          variant={activeTool === "route_solid" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("route_solid")}
          title="Solid Route"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "route_dashed" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("route_dashed")}
          title="Dashed Route"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "route_curved" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("route_curved")}
          title="Curved Route"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {/* Annotation Tools */}
      <div className="flex items-center border-r border-slate-700 pr-2">
        <Button
          variant={activeTool === "text" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("text")}
          title="Text"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "circle" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("circle")}
          title="Circle"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "rectangle" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("rectangle")}
          title="Rectangle"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>

      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" title="Color">
            <div
              className="h-5 w-5 rounded border border-slate-600"
              style={{ backgroundColor: selectedColor }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-1">
            {COLORS.map((color) => (
              <button
                key={color}
                className={cn(
                  "h-8 w-8 rounded border-2 transition-all",
                  selectedColor === color
                    ? "border-blue-500 scale-110"
                    : "border-transparent hover:border-slate-400"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={!hasSelection}
        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface PlayerPropertiesProps {
  player: PlayerData | null
  onUpdate: (updates: Partial<PlayerData>) => void
}

export function PlayerProperties({ player, onUpdate }: PlayerPropertiesProps) {
  if (!player) {
    return (
      <div className="p-4 text-center text-slate-400 text-sm">
        Select a player to edit properties
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-medium text-white">Player Properties</h3>

      <div className="space-y-2">
        <Label htmlFor="jersey" className="text-slate-300">
          Jersey Number
        </Label>
        <Input
          id="jersey"
          value={player.jerseyNumber || ""}
          onChange={(e) => onUpdate({ jerseyNumber: e.target.value })}
          placeholder="e.g., 12"
          className="bg-slate-700 border-slate-600"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position" className="text-slate-300">
          Position/Label
        </Label>
        <Input
          id="position"
          value={player.label || ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., QB, WR"
          className="bg-slate-700 border-slate-600"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Team Side</Label>
        <Select
          value={player.teamSide}
          onValueChange={(value) =>
            onUpdate({ teamSide: value as PlayerData["teamSide"] })
          }
        >
          <SelectTrigger className="bg-slate-700 border-slate-600">
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
        <Label className="text-slate-300">Color</Label>
        <div className="flex flex-wrap gap-1">
          {COLORS.slice(0, 6).map((color) => (
            <button
              key={color}
              className={cn(
                "h-8 w-8 rounded border-2 transition-all",
                player.color === color
                  ? "border-white scale-110"
                  : "border-transparent hover:border-slate-400"
              )}
              style={{ backgroundColor: color }}
              onClick={() => onUpdate({ color })}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-slate-300">
          Notes
        </Label>
        <Input
          id="notes"
          value={player.notes || ""}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Optional notes..."
          className="bg-slate-700 border-slate-600"
        />
      </div>

      <div className="pt-2 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          Position: ({player.startPosition.x.toFixed(1)},{" "}
          {player.startPosition.y.toFixed(1)})
        </p>
      </div>
    </div>
  )
}

interface RoutePropertiesProps {
  route: RouteArrow | null
  onUpdate: (updates: Partial<RouteArrow>) => void
  onDelete: () => void
}

export function RouteProperties({
  route,
  onUpdate,
  onDelete,
}: RoutePropertiesProps) {
  if (!route) {
    return (
      <div className="p-4 text-center text-slate-400 text-sm">
        Select a route to edit properties
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-medium text-white">Route Properties</h3>

      <div className="space-y-2">
        <Label htmlFor="label" className="text-slate-300">
          Label
        </Label>
        <Input
          id="label"
          value={route.label || ""}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Slant, Out"
          className="bg-slate-700 border-slate-600"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Route Type</Label>
        <Select
          value={route.type}
          onValueChange={(value) =>
            onUpdate({ type: value as RouteArrow["type"] })
          }
        >
          <SelectTrigger className="bg-slate-700 border-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid Line</SelectItem>
            <SelectItem value="dashed">Dashed Line</SelectItem>
            <SelectItem value="curved">Curved Line</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Color</Label>
        <div className="flex flex-wrap gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              className={cn(
                "h-8 w-8 rounded border-2 transition-all",
                route.color === color
                  ? "border-white scale-110"
                  : "border-transparent hover:border-slate-400"
              )}
              style={{ backgroundColor: color }}
              onClick={() => onUpdate({ color })}
            />
          ))}
        </div>
      </div>

      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="w-full"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Route
      </Button>
    </div>
  )
}

// Position input component for precise control
interface PositionInputProps {
  label: string
  value: FieldPosition
  onChange: (position: FieldPosition) => void
}

export function PositionInput({ label, value, onChange }: PositionInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-300">{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-slate-400">X</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={value.x.toFixed(1)}
            onChange={(e) =>
              onChange({ x: parseFloat(e.target.value) || 0, y: value.y })
            }
            className="bg-slate-700 border-slate-600"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-slate-400">Y</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={value.y.toFixed(1)}
            onChange={(e) =>
              onChange({ x: value.x, y: parseFloat(e.target.value) || 0 })
            }
            className="bg-slate-700 border-slate-600"
          />
        </div>
      </div>
    </div>
  )
}
