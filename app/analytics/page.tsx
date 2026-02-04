import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * CUSTOMIZE: Analytics metrics data
 */
const metrics = [
  { label: "Page Views", value: "124,892", change: "+12.3%", isPositive: true },
  { label: "Unique Visitors", value: "45,231", change: "+8.1%", isPositive: true },
  { label: "Bounce Rate", value: "32.4%", change: "-2.3%", isPositive: true },
  { label: "Avg. Session", value: "4m 32s", change: "+0.8%", isPositive: true },
];

/**
 * CUSTOMIZE: Top pages data
 */
const topPages = [
  { path: "/dashboard", views: 12453, percentage: 28 },
  { path: "/projects", views: 8721, percentage: 20 },
  { path: "/analytics", views: 6543, percentage: 15 },
  { path: "/team", views: 5432, percentage: 12 },
  { path: "/documents", views: 4321, percentage: 10 },
];

/**
 * Analytics page - view traffic and usage metrics.
 * CUSTOMIZE: Update metrics and charts per client requirements.
 */
export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your product performance and user engagement.
          </p>
        </div>
        <Badge variant="accent">New</Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm font-medium">
                {metric.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span
                  className={
                    metric.isPositive ? "text-accent" : "text-destructive"
                  }
                >
                  {metric.change}
                </span>{" "}
                from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart Placeholder */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
            <CardDescription>
              Page views over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* CUSTOMIZE: Add actual chart component */}
            <div className="h-64 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Chart placeholder - integrate your preferred charting library
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>
              Most visited pages this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.path}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${page.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {page.percentage}%
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {page.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

