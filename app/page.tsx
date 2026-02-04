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
 * CUSTOMIZE: Dashboard statistics data
 */
const dashboardStats = [
  { label: "Total Revenue", value: "$45,231.89", change: "+20.1%", isPositive: true },
  { label: "Subscriptions", value: "+2,350", change: "+180.1%", isPositive: true },
  { label: "Active Users", value: "+12,234", change: "+19%", isPositive: true },
  { label: "Conversion Rate", value: "3.2%", change: "-4.1%", isPositive: false },
];

/**
 * CUSTOMIZE: Recent activity data
 */
const recentActivity = [
  {
    user: "Sarah Chen",
    action: "Created a new project",
    project: "Marketing Campaign",
    time: "2 minutes ago",
    avatar: "SC",
  },
  {
    user: "Mike Johnson",
    action: "Updated team settings",
    project: "Development",
    time: "1 hour ago",
    avatar: "MJ",
  },
  {
    user: "Emily Brown",
    action: "Invited a new member",
    project: "Design System",
    time: "3 hours ago",
    avatar: "EB",
  },
  {
    user: "Alex Rivera",
    action: "Completed onboarding",
    project: "Sales Team",
    time: "5 hours ago",
    avatar: "AR",
  },
  {
    user: "Jordan Lee",
    action: "Deployed to production",
    project: "API v2.0",
    time: "Yesterday",
    avatar: "JL",
  },
];

/**
 * CUSTOMIZE: Projects data
 */
const projects = [
  { name: "Marketing Campaign", status: "active", progress: 75, members: 4 },
  { name: "Product Launch", status: "active", progress: 45, members: 6 },
  { name: "Customer Portal", status: "review", progress: 90, members: 3 },
  { name: "Mobile App v2", status: "active", progress: 30, members: 5 },
];

/**
 * Dashboard home page - main view for signed-in users.
 * CUSTOMIZE: Update dashboard widgets, stats, and data.
 */
export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          {/* CUSTOMIZE: Update welcome message */}
          Welcome back, John. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm font-medium">
                {stat.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span
                  className={
                    stat.isPositive ? "text-accent" : "text-destructive"
                  }
                >
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Projects Section */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                Your active projects and their progress.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{project.name}</p>
                      <Badge
                        variant={
                          project.status === "active" ? "accent" : "secondary"
                        }
                        className="text-xs"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(project.members, 3) }).map(
                      (_, i) => (
                        <Avatar key={i} size="sm" fallback={`U${i + 1}`} />
                      )
                    )}
                    {project.members > 3 && (
                      <Avatar
                        size="sm"
                        fallback={`+${project.members - 3}`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar fallback={item.avatar} size="sm" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{item.user}</span>{" "}
                      <span className="text-muted-foreground">
                        {item.action}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.project} &middot; {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* CUSTOMIZE: Update quick action buttons */}
            <Button variant="outline">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Project
            </Button>
            <Button variant="outline">
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
            <Button variant="outline">
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              View Reports
            </Button>
            <Button variant="outline">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
