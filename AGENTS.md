# Agent Guide

This repository is **听瓜**, a Bun-first Next.js app for the Eazo platform. It records a short watermelon knock, analyzes WAV audio features on the server, optionally asks Eazo AI for a second opinion, and shows a mobile-first sweetness score.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Bun 1.3.14
- `@eazo/sdk` for auth, device, AI, memory, and server auth helpers
- Drizzle ORM with PostgreSQL
- shadcn/ui primitives, lucide-react, framer-motion

## Commands

```bash
bun install --frozen-lockfile
bun dev
bun run check:eazo
bun run build
bun start
```

Database commands:

```bash
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
```

## Eazo Deployment Rules

- This is a Bun-first app. Keep `bun.lock` committed and do not add `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`.
- Keep dependency versions exact in `package.json`; do not use `*`, `^`, or `~` ranges for runtime or build dependencies.
- Keep `packageManager` pinned to the Bun version used locally.
- Before handing code to Eazo, run `bun run check:eazo` and `bun run build`.
- Verify the first screen at `390x640`, `390x844`, and `430x932`. The `390x640` case is the short Eazo preview guardrail.

## WebView Layout Rules

- Use `100dvh` for full-height shells, not `100vh` or `100svh`.
- Account for the Eazo Mobile WebView safe area with `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- Keep the primary action visible in short previews. If vertical space is tight, hide or compact supporting copy before shrinking the recorder controls.
- Avoid fixed hero/stage dimensions. Use responsive `clamp(...)` values for visual assets like the watermelon stage.
- Avoid viewport-scaled font sizes. Use Tailwind text steps and height-based compact variants when needed.
- Do not introduce layout that only works in a desktop browser preview.

## Project Structure

```
src/
  app/
    api/
      analyze/route.ts        # authenticated server audio + AI analysis
      history/route.ts        # authenticated analysis history
      mcp/route.ts            # MCP HTTP transport glue only
      user/profile/route.ts   # authenticated user upsert
    layout.tsx                # root providers and metadata
    page.tsx                  # thin route entry
  components/
    watermelon/               # product UI
    user-profile/             # auth/user sync UI
    ui/                       # shadcn primitives
  lib/
    api/                      # client API helpers
    audio-analysis/           # WAV feature extraction
    db/                       # Drizzle schema and queries
    i18n/                     # app locale helpers
    mcp/                      # MCP server and tools
```

## Eazo SDK Rules

- Mount `EazoProvider` once in `src/app/layout.tsx`.
- Keep `UserSyncEffect` inside the provider so web and mobile logins both upsert the local `users` table.
- In React render code, read auth state with `useEazo((s) => s.auth.user)` and `useEazo((s) => s.auth.loading)`.
- Outside render, call SDK singletons directly, such as `auth.login()`.
- App code must not build custom login UI. Use the SDK login flow.
- Keep a local `users` table and preserve `GET /api/user/profile` as the convergence point for authenticated user persistence.

## AI Rules

- `ai` from `@eazo/sdk` is server-only.
- Never import `ai` in client components, hooks, browser utilities, or `src/lib/api/`.
- AI calls belong in authenticated route handlers under `src/app/api/`.
- Guard AI routes with `requireAuth` before calling `ai.chat()`.
- Use `deepseek.v3.1` unless there is a product reason to change models.

## Memory Rules

- Call `memory.reportAction()` only from client-side code after meaningful user mutations or completed workflows.
- Always use the fire-and-forget pattern with `.catch(() => {})`.
- Do not call memory APIs from server route handlers.

## Component Rules

- Keep `src/app/page.tsx` as a thin entry point.
- Product components live under `src/components/watermelon/`.
- One product component per file. Small visual helpers still get their own file.
- Keep shadcn/ui primitive files as local UI infrastructure; do not rewrite them for product layout changes.
- Extract non-trivial UI sections instead of growing `index.tsx`.
- Use feature-local imports for sibling components and `@/` imports for cross-feature modules.

## API Rules

- Client API calls live in `src/lib/api/` and are imported by components.
- Use the existing `request()` helper when a client request needs Eazo session headers.
- Route handlers that read user data must call `requireAuth(request)` and scope queries to `auth.user.id`.
- Do not trust user-supplied user IDs.

## MCP Rules

- Keep `src/app/api/mcp/route.ts` as transport glue only.
- Add tools under `src/lib/mcp/tools/<tool-name>.ts`.
- Each MCP tool file exports one `register*` function.
- Pass the authenticated `userId` into tools by closure.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `EAZO_APP_ID` | Yes | Eazo app identity |
| `EAZO_PRIVATE_KEY` | Yes | Session auth, server AI, platform signing |
| `DATABASE_URL` | Yes if database routes are used | PostgreSQL connection |
| `NEXT_PUBLIC_APP_TITLE` | Optional | Browser title and metadata |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Optional | Browser metadata |
| `EAZO_PLATFORM_API_BASE` | Optional | Override Eazo platform base URL |

## Before Shipping

Run:

```bash
bun run check:eazo
bun run build
```

Then visually check the app in local preview at `390x640`, `390x844`, and `430x932`.
