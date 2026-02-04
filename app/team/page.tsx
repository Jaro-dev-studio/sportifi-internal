import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

/**
 * CUSTOMIZE: Team members data
 */
const teamMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "Admin",
    department: "Engineering",
    avatar: "SC",
    status: "online",
  },
  {
    id: 2,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Member",
    department: "Design",
    avatar: "MJ",
    status: "online",
  },
  {
    id: 3,
    name: "Emily Brown",
    email: "emily@example.com",
    role: "Member",
    department: "Marketing",
    avatar: "EB",
    status: "offline",
  },
  {
    id: 4,
    name: "Alex Rivera",
    email: "alex@example.com",
    role: "Member",
    department: "Sales",
    avatar: "AR",
    status: "online",
  },
  {
    id: 5,
    name: "Jordan Lee",
    email: "jordan@example.com",
    role: "Admin",
    department: "Engineering",
    avatar: "JL",
    status: "away",
  },
];

const statusStyles = {
  online: "bg-accent",
  offline: "bg-muted-foreground",
  away: "bg-yellow-500",
};

/**
 * Team page - manage team members.
 * CUSTOMIZE: Update team data and actions.
 */
export default function TeamPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Team
          </h1>
          <p className="text-muted-foreground">
            Manage your team members and permissions.
          </p>
        </div>
        <Button>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Invite Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {teamMembers.filter((m) => m.role === "Admin").length}
            </div>
            <p className="text-sm text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {teamMembers.filter((m) => m.status === "online").length}
            </div>
            <p className="text-sm text-muted-foreground">Online Now</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            All members of your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="relative">
                  <Avatar fallback={member.avatar} size="md" />
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-background ${
                      statusStyles[member.status as keyof typeof statusStyles]
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {member.email}
                  </p>
                </div>
                <div className="hidden sm:block text-sm text-muted-foreground">
                  {member.department}
                </div>
                <Badge
                  variant={member.role === "Admin" ? "default" : "outline"}
                >
                  {member.role}
                </Badge>
                <Button variant="ghost" size="icon">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                  <span className="sr-only">More options</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

