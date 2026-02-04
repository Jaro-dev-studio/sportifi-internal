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
 * CUSTOMIZE: Projects data
 */
const projects = [
  {
    id: 1,
    name: "Marketing Campaign",
    description: "Q4 marketing initiatives and brand awareness campaign.",
    status: "active" as ProjectStatus,
    progress: 75,
    members: ["SC", "MJ", "EB", "AR"],
    dueDate: "Dec 31, 2024",
  },
  {
    id: 2,
    name: "Product Launch",
    description: "New product line launch preparation and go-to-market strategy.",
    status: "active" as ProjectStatus,
    progress: 45,
    members: ["JL", "SC", "MJ"],
    dueDate: "Jan 15, 2025",
  },
  {
    id: 3,
    name: "Customer Portal",
    description: "Self-service portal for customer account management.",
    status: "review" as ProjectStatus,
    progress: 90,
    members: ["EB", "AR", "JL"],
    dueDate: "Dec 20, 2024",
  },
  {
    id: 4,
    name: "Mobile App v2",
    description: "Major update with new features and improved performance.",
    status: "active" as ProjectStatus,
    progress: 30,
    members: ["MJ", "SC"],
    dueDate: "Feb 28, 2025",
  },
  {
    id: 5,
    name: "API Documentation",
    description: "Comprehensive API docs for developer integrations.",
    status: "completed" as ProjectStatus,
    progress: 100,
    members: ["AR"],
    dueDate: "Nov 30, 2024",
  },
];

type ProjectStatus = "active" | "review" | "completed";

const statusColors: Record<ProjectStatus, "accent" | "secondary" | "muted"> = {
  active: "accent",
  review: "secondary",
  completed: "muted",
};

/**
 * Projects page - manage and view all projects.
 * CUSTOMIZE: Update project data and actions.
 */
export default function ProjectsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="text-muted-foreground">
            Manage and track all your team projects.
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge variant={statusColors[project.status]}>
                  {project.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end gap-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((member, i) => (
                    <Avatar key={i} size="sm" fallback={member} />
                  ))}
                  {project.members.length > 3 && (
                    <Avatar
                      size="sm"
                      fallback={`+${project.members.length - 3}`}
                    />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Due {project.dueDate}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

