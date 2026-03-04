# Replit.md

## Overview

This is a **Cards Against Humanity Discord Bot** with a companion landing page/website. The project has two main parts:

1. **Discord Bot** — A fully functional Cards Against Humanity game bot built with discord.js that runs inside Discord servers. Players join games, get dealt hands of white cards, play them against black card prompts, and a rotating judge picks winners.
2. **Landing Page** — A React-based marketing/stats website that showcases the bot's features, displays live stats (active games, total players, total cards), and provides an "Add to Discord" button.

The bot handles all game logic (joining, starting, playing cards, judging, scoring) through Discord slash commands, while the web frontend is purely informational — it fetches stats from the API and displays them.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses a three-directory monorepo pattern:
- **`client/`** — React frontend (Vite-powered SPA)
- **`server/`** — Express backend + Discord bot
- **`shared/`** — Shared types, database schema, and API route definitions used by both client and server

### Frontend (client/)
- **Framework**: React with TypeScript
- **Bundler**: Vite with HMR support in development
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, dark mode by default
- **Animations**: Framer Motion for page animations and interactive elements
- **Fonts**: Fredoka (display) and Outfit (body)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

The frontend is a single-page app with just a landing page (`Home`) and a 404 page. It polls `/api/stats` every 30 seconds to show live bot statistics.

### Backend (server/)
- **Framework**: Express.js on Node with TypeScript (run via tsx)
- **HTTP Server**: Node's built-in `http.createServer` wrapping Express
- **Discord Bot**: discord.js v14 with slash commands (`/help`, `/startgame`, `/add`, `/boot`, `/endgame`, `/pick`, `/judge`, `/score`, `/leave`, `/refresh`) and button interactions (Join Game, Start Game, View Cards). Players can join mid-game via the Join Game button and will receive cards at the next round. The `/refresh` command re-displays the current round's embed (black card, buttons, status) in case it gets buried or lost after player joins/leaves.
- **Database ORM**: Drizzle ORM with PostgreSQL dialect (neon-serverless adapter)
- **Database Driver**: `@neondatabase/serverless` with WebSocket-based connection pooling (NeonDB)
- **Session Store**: connect-pg-simple (available but sessions may not be actively used since there's no user auth on the web side)

The bot starts alongside the Express server when the app launches. Game state is persisted in PostgreSQL.

### Shared Layer (shared/)
- **`schema.ts`** — Drizzle table definitions for: `cards`, `games`, `players`, `hands`, `playedCards`, and `users`
- **`routes.ts`** — API route contracts with Zod schemas for request/response validation. Currently only one endpoint: `GET /api/stats`

### Database Schema (PostgreSQL)
Six main tables:
1. **`cards`** — Card deck (black questions and white answers), with `type`, `text`, `pick` count, and `pack` name
2. **`games`** — Active game sessions tied to Discord guild/channel IDs, with status (`waiting`/`playing`/`judging`/`finished`), current judge, and current black card
3. **`players`** — Players in each game, linked to Discord user IDs, with scores and VIP flag
4. **`hands`** — Cards currently in each player's hand
5. **`playedCards`** — Cards played in the current round of each game
6. **`usedCards`** — Tracks all cards (black and white) that have been used in a game session, preventing repeats until the deck is exhausted and reshuffled

The database is seeded with initial card data from `server/cards_data.ts` on startup.

### Storage Layer
`server/storage.ts` defines an `IStorage` interface with methods for all database operations (CRUD for games, players, hands, cards, stats). The implementation uses Drizzle ORM queries against PostgreSQL.

### Build System
- **Development**: `tsx server/index.ts` with Vite dev server middleware for HMR
- **Production Build**: Custom build script (`script/build.ts`) that:
  - Builds client with Vite (output to `dist/public/`)
  - Bundles server with esbuild (output to `dist/index.cjs`)
  - Selectively bundles certain dependencies while externalizing others for faster cold starts

### Database Migrations
- Uses `drizzle-kit push` (`npm run db:push`) to sync schema to the database
- Migration files output to `./migrations/`
- Requires `DATABASE_URL` environment variable

## External Dependencies

### Required Services
- **PostgreSQL Database** — Required. Connection via `DATABASE_URL` environment variable. Used for all game state, card storage, and player data.
- **Discord Bot Token** — Required for the bot to connect. Expected as an environment variable (referenced in `server/bot.ts` via `startBot()`). The bot needs `DISCORD_TOKEN` (or similar) and a registered Discord application with slash commands.

### Key npm Dependencies
- **discord.js v14** — Discord bot framework with slash commands, embeds, and button interactions
- **@napi-rs/canvas** — Canvas-based image rendering for black card images (renders styled PNG cards instead of plain text embeds)
- **drizzle-orm + drizzle-kit** — Type-safe ORM and migration tooling for PostgreSQL
- **express** — HTTP server framework
- **@tanstack/react-query** — Async data fetching and caching on the frontend
- **framer-motion** — Animation library for the landing page
- **shadcn/ui + Radix UI** — Component library (extensive set of UI primitives installed)
- **zod** — Schema validation for API contracts
- **wouter** — Lightweight client-side routing