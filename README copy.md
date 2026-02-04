# Demo Template - Dashboard

A Next.js 16+ dashboard template designed as a starting point for AI-generated client product demos. Features a clean dashboard layout with sidebar navigation and user menu.

## Features

- Next.js 16+ with App Router
- TypeScript strict mode
- Tailwind CSS v4 with CSS variable-based theming
- Dashboard layout with sidebar and header
- Mobile-responsive design
- Pre-built UI components (Button, Card, Input, Badge, Avatar, Skeleton)
- User menu with dropdown
- Notification indicator

## Quick Start

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd demo-template

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Customizing Branding

### Theme Colors

Update CSS variables in `app/globals.css` to match your client's brand:

```css
:root {
  /* Primary brand color - buttons, links, accents */
  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  --color-primary-foreground: #FFFFFF;

  /* Secondary color - backgrounds, subtle elements */
  --color-secondary: #1E293B;

  /* Accent color - highlights, badges, success states */
  --color-accent: #10B981;

  /* Background and foreground */
  --color-background: #FFFFFF;
  --color-foreground: #0F172A;

  /* ... other variables ... */
}
```

### Logo and Company Name

1. Replace `public/placeholder-logo.svg` with client logo
2. Update the logo in `components/layout/header.tsx`
3. Update metadata in `app/layout.tsx`

### Navigation

Update sidebar navigation items in `components/layout/sidebar.tsx`:

```tsx
const sidebarSections: SidebarSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: <DashboardIcon /> },
      { label: "Analytics", href: "/analytics", icon: <AnalyticsIcon /> },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: <ProjectsIcon /> },
      // Add more items...
    ],
  },
];
```

### User Information

Update user data in `components/layout/header.tsx`:

```tsx
<Avatar fallback="JD" size="sm" />
<p className="text-sm font-medium">John Doe</p>
<p className="text-xs text-muted-foreground">john@example.com</p>
```

### Dashboard Content

Update the main dashboard in `app/page.tsx`. Look for `CUSTOMIZE` comments.

## Project Structure

```
/
├── app/
│   ├── layout.tsx         # Root layout with Header/Sidebar
│   ├── page.tsx           # Dashboard home page
│   └── globals.css        # Tailwind + CSS variables
├── components/
│   ├── ui/                # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   └── skeleton.tsx
│   └── layout/            # Layout components
│       ├── header.tsx     # Dashboard header with user menu
│       └── sidebar.tsx    # Sidebar navigation
├── lib/
│   └── utils.ts           # cn() helper
├── public/
│   └── placeholder-logo.svg
├── .cursorrules           # Cursor AI coding standards
└── package.json
```

## Available Components

### UI Components

Import from `@/components/ui`:

```tsx
import { Button, Card, Input, Badge, Avatar, Skeleton } from "@/components/ui";
```

- **Button** - Primary, secondary, outline, ghost, destructive, link variants
- **Card** - Container with CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Input** - Text input with optional label and error states
- **Textarea** - Multi-line text input
- **Badge** - Labels, tags, and status indicators
- **Avatar** - User profile images with fallback support
- **Skeleton** - Loading state placeholders

### Layout Components

Import from `@/components/layout`:

```tsx
import { Header, Sidebar } from "@/components/layout";
```

## Adding New Pages

Create new pages in the `app/` directory:

```tsx
// app/projects/page.tsx
export default function ProjectsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Projects</h1>
      {/* Page content */}
    </div>
  );
}
```

Update the sidebar navigation in `components/layout/sidebar.tsx` to include the new page.

## Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Deploy automatically

### Other Platforms

```bash
# Build the application
pnpm build

# The output is in .next/
# Configure your platform to run: pnpm start
```

## Tech Stack

- **Framework**: Next.js 16+
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm
- **Fonts**: Geist Sans & Geist Mono

## License

MIT
