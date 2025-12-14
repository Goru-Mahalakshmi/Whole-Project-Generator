# Repository Mirror AI

## Overview

Repository Mirror AI is a web application that analyzes GitHub repositories using AI-powered insights. Users paste a public GitHub repository URL, and the system clones the repo, analyzes its structure and quality metrics, then sends the data to an LLM (OpenAI GPT) to generate a comprehensive assessment including a score (0-100), skill level classification, summary, and personalized improvement roadmap.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Design System**: Modern developer tool aesthetic with Inter font for UI and monospace fonts for code/repo names
- **Animations**: Framer Motion for smooth transitions and interactions
- **Charts**: Recharts for radar chart visualization of analysis dimensions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build Tool**: esbuild for production bundling, tsx for development
- **API Design**: RESTful endpoints under `/api` prefix
- **Repository Analysis**: Uses simple-git library to clone and analyze repositories
- **File Analysis**: Recursively scans repositories for file counts, folder structure, README presence, test files, languages, and tech stack detection

### Data Flow
1. User submits GitHub URL via frontend form
2. Backend validates URL and clones repository to temporary directory
3. Repository metadata extracted (files, folders, languages, commits, branches)
4. Structured data sent to OpenAI API with analysis prompt
5. LLM returns score, skill level, summary, roadmap, and dimension scores
6. Results displayed with animated cards and radar chart visualization

### Data Storage
- **Current**: In-memory storage (MemStorage class) for user data
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Defined in `shared/schema.ts` with Zod validation
- **Migration**: Drizzle Kit for database schema management

### Shared Code
- `shared/schema.ts` contains TypeScript interfaces and Zod schemas used by both frontend and backend
- Path aliases configured: `@/` for client src, `@shared/` for shared code

## External Dependencies

### AI/LLM Integration
- **OpenAI API**: GPT model for repository analysis and roadmap generation
- Requires `OPENAI_API_KEY` environment variable

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and migrations

### Git Operations
- **simple-git**: Node.js library for cloning and analyzing Git repositories

### Third-Party Services
- **Google Fonts**: Inter and JetBrains Mono font families
- **Recharts**: Data visualization library for radar charts

### Development Tools
- **Vite**: Frontend build tool with HMR
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment