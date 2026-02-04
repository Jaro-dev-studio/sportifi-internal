"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  FolderOpen,
  FileText,
  Plus,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit,
  FolderPlus,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PlaybookFolder {
  id: string
  name: string
  playType?: string
  description?: string
  itemCount: number
  children: PlaybookFolder[]
}

interface PlaybookItem {
  id: string
  playCard: {
    id: string
    name: string
    type: string
    formation?: string
    tags: string[]
  }
}

export default function PlaybookPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [folders, setFolders] = useState<PlaybookFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [folderItems, setFolderItems] = useState<PlaybookItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderType, setNewFolderType] = useState<string>("")

  const teamSlug = searchParams.get("team")
  const currentTeam = session?.user?.teams?.find((t) => t.slug === teamSlug) || session?.user?.teams?.[0]

  useEffect(() => {
    const fetchPlaybook = async () => {
      if (!currentTeam) return

      try {
        // Mock data for development
        setFolders([
          {
            id: "offense",
            name: "Offense",
            playType: "offense",
            itemCount: 12,
            children: [
              { id: "passing", name: "Passing Plays", playType: "offense", itemCount: 6, children: [] },
              { id: "running", name: "Running Plays", playType: "offense", itemCount: 6, children: [] },
            ],
          },
          {
            id: "defense",
            name: "Defense",
            playType: "defense",
            itemCount: 8,
            children: [
              { id: "zone", name: "Zone Coverage", playType: "defense", itemCount: 4, children: [] },
              { id: "man", name: "Man Coverage", playType: "defense", itemCount: 4, children: [] },
            ],
          },
          {
            id: "special",
            name: "Special Teams",
            playType: "special",
            itemCount: 4,
            children: [],
          },
        ])
      } catch (error) {
        console.error("Failed to fetch playbook:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaybook()
  }, [currentTeam])

  useEffect(() => {
    const fetchFolderItems = async () => {
      if (!selectedFolderId) {
        setFolderItems([])
        return
      }

      // Mock data
      setFolderItems([
        {
          id: "i1",
          playCard: { id: "1", name: "Slant Right", type: "MANUAL", formation: "Shotgun", tags: ["passing", "quick"] },
        },
        {
          id: "i2",
          playCard: { id: "2", name: "Zone Read Left", type: "ACTUAL", formation: "Spread", tags: ["run", "zone"] },
        },
      ])
    }

    fetchFolderItems()
  }, [selectedFolderId])

  const selectedFolder = folders.find((f) => f.id === selectedFolderId) ||
    folders.flatMap((f) => f.children).find((f) => f.id === selectedFolderId)

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    console.log("[Playbook] Creating folder:", newFolderName)
    
    // Would make API call here
    setNewFolderName("")
    setNewFolderType("")
    setNewFolderDialogOpen(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Playbook</h1>
          <p className="text-slate-400 mt-1">
            Organize your plays into folders
          </p>
        </div>
        <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Add a new folder to organize your plays
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Red Zone Plays"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder-type">Play Type</Label>
                <Select value={newFolderType} onValueChange={setNewFolderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offense">Offense</SelectItem>
                    <SelectItem value="defense">Defense</SelectItem>
                    <SelectItem value="special">Special Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Folders List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
            Folders
          </h2>
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-700 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {folders.map((folder) => (
                <div key={folder.id}>
                  <Card
                    className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer ${
                      selectedFolderId === folder.id ? "border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-slate-400" />
                          <div>
                            <h3 className="font-medium text-white">{folder.name}</h3>
                            <p className="text-xs text-slate-400">{folder.itemCount} plays</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {folder.children.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2">
                      {folder.children.map((child) => (
                        <Card
                          key={child.id}
                          className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer ${
                            selectedFolderId === child.id ? "border-blue-500" : ""
                          }`}
                          onClick={() => setSelectedFolderId(child.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-white">{child.name}</span>
                                <span className="text-xs text-slate-400">({child.itemCount})</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Folder Contents */}
        <div className="lg:col-span-2">
          {selectedFolder ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">
                  {selectedFolder.name}
                </h2>
                <Link href="/play-cards/new">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Play
                  </Button>
                </Link>
              </div>

              {folderItems.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {folderItems.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <Link href={`/play-cards/${item.playCard.id}`}>
                        <div className="aspect-[4/3] bg-slate-700 rounded-t-lg flex items-center justify-center">
                          <FileText className="h-8 w-8 text-slate-500" />
                        </div>
                      </Link>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/play-cards/${item.playCard.id}`}>
                              <h3 className="font-medium text-white hover:text-blue-400">
                                {item.playCard.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.playCard.type}
                              </Badge>
                              {item.playCard.formation && (
                                <span className="text-xs text-slate-400">
                                  {item.playCard.formation}
                                </span>
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-400">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove from folder
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-10 w-10 text-slate-600 mb-3" />
                    <p className="text-slate-400 text-sm">No plays in this folder</p>
                    <Link href="/play-cards/new" className="mt-3">
                      <Button variant="outline" size="sm">
                        Create a play
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 h-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FolderOpen className="h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Select a folder</h3>
                <p className="text-slate-400 text-sm text-center">
                  Choose a folder from the left to view its contents
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
