"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Mail,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

interface TeamMember {
  id: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  role: "COACH" | "ASSISTANT" | "PLAYER"
  joinedAt: string
}

interface Invite {
  id: string
  email: string
  role: "COACH" | "ASSISTANT" | "PLAYER"
  token: string
  expiresAt: string
  usedAt: string | null
}

export default function TeamPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"COACH" | "ASSISTANT" | "PLAYER">("PLAYER")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const teamSlug = searchParams.get("team")
  const currentTeam = session?.user?.teams?.find((t) => t.slug === teamSlug) || session?.user?.teams?.[0]
  const currentMembership = session?.user?.teams?.find((t) => t.id === currentTeam?.id)
  const isCoach = currentMembership?.role === "COACH"

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!currentTeam) return

      try {
        // Fetch members
        const membersRes = await fetch(`/api/teams/${currentTeam.id}/members`)
        if (membersRes.ok) {
          const data = await membersRes.json()
          setMembers(data)
        } else {
          // Mock data
          setMembers([
            {
              id: "m1",
              userId: "u1",
              user: { id: "u1", name: "Coach Smith", email: "coach@team.com", image: null },
              role: "COACH",
              joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
            },
            {
              id: "m2",
              userId: "u2",
              user: { id: "u2", name: "Coach Johnson", email: "johnson@team.com", image: null },
              role: "ASSISTANT",
              joinedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
            },
            {
              id: "m3",
              userId: "u3",
              user: { id: "u3", name: "Mike Williams", email: "mike@team.com", image: null },
              role: "PLAYER",
              joinedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            },
          ])
        }

        // Fetch pending invites
        const invitesRes = await fetch(`/api/teams/${currentTeam.id}/invites`)
        if (invitesRes.ok) {
          const data = await invitesRes.json()
          setInvites(data)
        } else {
          setInvites([
            {
              id: "i1",
              email: "newcoach@team.com",
              role: "ASSISTANT",
              token: "abc123",
              expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
              usedAt: null,
            },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch team data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamData()
  }, [currentTeam])

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentTeam) return

    setIsInviting(true)
    console.log("[Team] Sending invite to:", inviteEmail)

    try {
      const response = await fetch(`/api/teams/${currentTeam.id}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to send invite")
      }

      console.log("[Team] Invite sent successfully")
      setInviteEmail("")
      setInviteDialogOpen(false)
      // Refresh invites
    } catch (error) {
      console.error("[Team] Invite error:", error)
    } finally {
      setIsInviting(false)
    }
  }

  const getRoleBadge = (role: TeamMember["role"]) => {
    const variants: Record<TeamMember["role"], "default" | "secondary" | "outline"> = {
      COACH: "default",
      ASSISTANT: "secondary",
      PLAYER: "outline",
    }
    return <Badge variant={variants[role]}>{role}</Badge>
  }

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/join?token=${token}`
    navigator.clipboard.writeText(link)
    // Show toast
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Management</h1>
          <p className="text-slate-400 mt-1">
            Manage your team members and invitations
          </p>
        </div>
        {isCoach && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation email to join {currentTeam?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="coach@school.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COACH">Coach (Full Access)</SelectItem>
                      <SelectItem value="ASSISTANT">Assistant Coach</SelectItem>
                      <SelectItem value="PLAYER">Player (View Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail.trim() || isInviting}>
                  {isInviting ? "Sending..." : "Send Invite"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{members.length}</p>
                <p className="text-sm text-slate-400">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {members.filter((m) => m.role === "COACH" || m.role === "ASSISTANT").length}
                </p>
                <p className="text-sm text-slate-400">Coaches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {invites.filter((i) => !i.usedAt).length}
                </p>
                <p className="text-sm text-slate-400">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members & Invites */}
      <Tabs defaultValue="members">
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="invites">
            Pending Invites ({invites.filter((i) => !i.usedAt).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-700">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback className="bg-slate-700">
                          {member.user.name?.[0] || member.user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-sm text-slate-400">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getRoleBadge(member.role)}
                      <span className="text-xs text-slate-400">
                        Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                      </span>
                      {isCoach && member.role !== "COACH" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              {invites.filter((i) => !i.usedAt).length > 0 ? (
                <div className="divide-y divide-slate-700">
                  {invites
                    .filter((i) => !i.usedAt)
                    .map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{invite.email}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Clock className="h-3 w-3" />
                              Expires {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getRoleBadge(invite.role)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyInviteLink(invite.token)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Mail className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No pending invites</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
