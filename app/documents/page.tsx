import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * CUSTOMIZE: Documents data
 */
const documents = [
  {
    id: 1,
    name: "Q4 Strategy Document",
    type: "document",
    size: "2.4 MB",
    modified: "2 hours ago",
    shared: true,
  },
  {
    id: 2,
    name: "Brand Guidelines",
    type: "pdf",
    size: "8.1 MB",
    modified: "Yesterday",
    shared: true,
  },
  {
    id: 3,
    name: "Product Roadmap",
    type: "spreadsheet",
    size: "1.2 MB",
    modified: "3 days ago",
    shared: false,
  },
  {
    id: 4,
    name: "Meeting Notes - Dec 15",
    type: "document",
    size: "156 KB",
    modified: "4 days ago",
    shared: true,
  },
  {
    id: 5,
    name: "Budget 2025",
    type: "spreadsheet",
    size: "890 KB",
    modified: "1 week ago",
    shared: false,
  },
  {
    id: 6,
    name: "API Specification",
    type: "document",
    size: "3.2 MB",
    modified: "2 weeks ago",
    shared: true,
  },
];

const typeIcons = {
  document: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  pdf: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  spreadsheet: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

/**
 * Documents page - manage files and documents.
 * CUSTOMIZE: Update document data and actions.
 */
export default function DocumentsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Documents
          </h1>
          <p className="text-muted-foreground">
            Access and manage your files and documents.
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Upload
        </Button>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>
            Your recently modified files and documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="text-muted-foreground">
                  {typeIcons[doc.type as keyof typeof typeIcons]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{doc.name}</p>
                    {doc.shared && (
                      <Badge variant="outline" className="text-xs">
                        Shared
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {doc.size} &middot; Modified {doc.modified}
                  </p>
                </div>
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

