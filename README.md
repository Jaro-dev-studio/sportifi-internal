# PlayCard - Sports Intelligence Platform

A multi-tenant web application for American football high school coaches to transform game film into animated play cards. Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and Prisma.

## Features

- **Video Upload & Management**: Upload game film, tag with metadata, and organize by game
- **Play Analysis**: Extract plays from video, frame-by-frame preview with AI-assisted player tracking
- **Animated Play Cards**: Auto-generate animated play cards from analyzed plays
- **Manual Play Card Creator**: Build play diagrams from scratch with drag-and-drop players and route drawing
- **Team Playbook**: Organize plays into folders (Offense/Defense/Special Teams) with tags
- **Multi-tenant Architecture**: Support for multiple teams with role-based access (Coach/Assistant/Player)
- **Sharing & Collaboration**: Share play cards via link or invite team members
- **Audit Logging**: Track all important actions for compliance and activity feeds

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (email/password + magic link)
- **Storage**: S3-compatible (stubbed for development)
- **Video Processing**: Job queue abstraction (in-process for MVP)
- **AI Integration**: Adapter pattern for pluggable ML services

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd play-card-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/playcard_db"

# NextAuth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Email (optional for development)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@playcard.com"
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed with demo data
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Coach | coach@demo.com | coach123! |
| Assistant | assistant@demo.com | assistant123! |
| Player | player@demo.com | player123! |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main dashboard pages
│   ├── api/               # API routes
│   └── share/             # Public share pages
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components (sidebar, header)
│   ├── field/             # Field canvas and route editor
│   ├── video/             # Video player and controls
│   └── forms/             # Form components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configs
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── validations.ts    # Zod schemas
├── services/             # Backend services
│   ├── storage.ts        # S3-compatible storage
│   ├── ai-adapter.ts     # AI/ML service adapter
│   ├── job-queue.ts      # Background job processing
│   └── audit-log.ts      # Audit logging
└── types/                # TypeScript types
```

## Key Components

### Field Canvas (`components/field/field-canvas.tsx`)

The main component for rendering and editing play diagrams. Features:
- Bird's-eye view of football field
- Draggable player markers (X for defense, O for offense)
- Route drawing with solid/dashed/curved lines
- Annotations (text, circles, rectangles)
- Normalized coordinates (0-100) for responsive scaling

### Animated Field (`components/field/animated-field.tsx`)

Animates player movements and route progression:
- Playback controls (play, pause, reset, speed)
- Timeline scrubber
- Path trails showing player movement history

### Route Editor (`components/field/route-editor.tsx`)

Toolbar and property panels for editing:
- Tool selection (select, move, routes, annotations)
- Color picker
- Player properties (jersey, position, team)
- Route properties (type, label, color)

## AI Integration

The platform uses an adapter pattern for AI services. The mock adapter (`services/ai-adapter.ts`) can be replaced with a real implementation:

```typescript
// To integrate real AI service:
// 1. Install AI SDK (e.g., @tensorflow/tfjs, OpenCV.js)
// 2. Implement the AIAdapter interface
// 3. Update the factory function in ai-adapter.ts

interface AIAdapter {
  detectPlayers(request: DetectionRequest): Promise<AIDetectionResult>
  trackPlayers(request: TrackingRequest): Promise<AIDetectionResult[]>
  segmentPlays(request: SegmentationRequest): Promise<SegmentationResult>
  isAvailable(): Promise<boolean>
}
```

## Storage Integration

The storage service (`services/storage.ts`) supports S3-compatible storage:

```typescript
// To enable S3 storage:
// 1. Install AWS SDK: npm install @aws-sdk/client-s3
// 2. Configure environment variables:
//    S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
// 3. Implement the upload/download methods in S3StorageProvider
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/teams/[teamId]/stats` | Get team dashboard stats |
| GET | `/api/teams/[teamId]/play-cards` | List play cards |
| POST | `/api/teams/[teamId]/play-cards` | Create play card |
| GET | `/api/teams/[teamId]/videos` | List videos |
| POST | `/api/teams/[teamId]/invites` | Send team invite |

## Database Schema

Key models:

- **User**: User accounts with email/password auth
- **Team**: Multi-tenant team container
- **TeamMembership**: User-team relationship with roles (COACH/ASSISTANT/PLAYER)
- **VideoAsset**: Uploaded video files with metadata
- **PlaySession**: Video analysis session
- **Play**: Individual play within a session
- **PlayCard**: Play diagram with positions and routes
- **PlaybookFolder**: Organizational folders for plays
- **AuditLog**: Action history for compliance

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Database Operations
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Deployment

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="<generated-secret>"
AUTH_URL="https://your-domain.com"
S3_ENDPOINT="https://s3.amazonaws.com"
S3_REGION="us-east-1"
S3_BUCKET="your-bucket"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
```

### Build for Production
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with love for high school football coaches everywhere.
