"use client"

import { useState, Suspense, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, Users, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { joinTeamWithInvite } from "@/app/actions/auth"
import { prisma } from "@/lib/prisma"

function JoinTeamContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const token = searchParams.get("token")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [teamInfo, setTeamInfo] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    // Fetch team info from token
    const fetchTeamInfo = async () => {
      if (!token) return
      try {
        const response = await fetch(`/api/teams/invite-info?token=${token}`)
        if (response.ok) {
          const data = await response.json()
          setTeamInfo(data)
        }
      } catch {
        console.error("Failed to fetch team info")
      }
    }
    fetchTeamInfo()
  }, [token])

  if (!token) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <CardTitle className="text-white">Invalid invite link</CardTitle>
          <CardDescription className="text-slate-400">
            This invite link is invalid or has expired. Please ask your coach for a new invite.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login">
            <Button>Go to login</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (status === "loading") {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <CardTitle className="text-white">Join Team</CardTitle>
          <CardDescription className="text-slate-400">
            {teamInfo 
              ? `You've been invited to join "${teamInfo.name}" as ${teamInfo.role}`
              : "You've been invited to join a team"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href={`/login?callbackUrl=${encodeURIComponent(`/join?token=${token}`)}`}>
            <Button className="w-full" size="lg">
              Sign in to join
            </Button>
          </Link>
          <Link href={`/register?callbackUrl=${encodeURIComponent(`/join?token=${token}`)}`}>
            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
              Create an account
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const handleJoin = async () => {
    if (!session?.user?.id) return
    
    setIsLoading(true)
    setError("")

    try {
      const result = await joinTeamWithInvite(session.user.id, token)
      
      if (!result.success) {
        setError(result.error || "Failed to join team")
        setIsLoading(false)
        return
      }

      const data = result.data as { slug: string }
      router.push(`/dashboard?team=${data.slug}`)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-blue-500" />
        </div>
        <CardTitle className="text-white">Join Team</CardTitle>
        <CardDescription className="text-slate-400">
          {teamInfo 
            ? `You've been invited to join "${teamInfo.name}" as ${teamInfo.role}`
            : "You've been invited to join a team"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleJoin}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Accept Invitation
        </Button>
        
        <Link href="/dashboard">
          <Button variant="ghost" className="w-full text-slate-400">
            Cancel
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    }>
      <JoinTeamContent />
    </Suspense>
  )
}
