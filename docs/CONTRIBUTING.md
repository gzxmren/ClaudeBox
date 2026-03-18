# Contributing Guide

## Prerequisites

- Node.js 18+
- npm 9+

## Development Setup

```bash
git clone <repo>
cd claudebox
npm install
npm start
```

This starts two processes concurrently (via `concurrently`):
- **Vite dev server** at http://localhost:5173 — hot module reload, fast refresh
- **API server** at http://localhost:3501 — reads `~/.claude/projects/` and serves session data

## Project Structure

```
claudebox/
├── server.mjs              # Zero-dependency Node.js HTTP API server
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Root component, layout
│   ├── types/
│   │   └── session.ts      # All shared TypeScript types (source of truth)
│   ├── lib/
│   │   ├── parser.ts       # JSONL → MergedMessage[], category detection
│   │   ├── fileLoader.ts   # Fetches data from API or dropped files
│   │   └── search.ts       # Full-text search index
│   ├── store/
│   │   └── useSessionStore.ts  # Zustand global state
│   ├── components/
│   │   ├── conversation/   # MessageBubble, ToolCall, ThinkingBlock, etc.
│   │   ├── session/        # SessionList, SessionStats
│   │   ├── subagent/       # SubagentTabs, SubagentThread
│   │   └── common/         # Shared UI (SearchInput, Collapsible, etc.)
│   ├── hooks/              # useSearch, useTheme
│   └── utils/              # formatters, constants
├── public/                 # Static assets
└── dist/                   # Production build output (git-ignored)
```

## Key Architectural Decisions

**Message categories** — The Anthropic API requires strict `user`/`assistant` alternation, so system-injected content (hooks, `<system-reminder>` tags, auto-continuation prompts) is stored as `role: "user"` in the JSONL. The parser detects these via XML tag patterns and assigns a `category` field (`'user' | 'system' | 'continuation'`). The UI renders them as compact collapsible bars instead of normal chat bubbles.

**Streaming deduplication** — Claude Code writes multiple partial records for a single assistant turn. `mergeRecords()` in `parser.ts` groups them by `message.id` and deduplicates identical content blocks.

**Sidechain filtering** — Records with `isSidechain: true` are abandoned conversation branches (from undo). They are filtered out before rendering.

<!-- AUTO-GENERATED: scripts -->
## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start API server (port 3501) + Vite dev server concurrently |
| `npm run dev` | Vite dev server only (no API server) |
| `npm run build` | TypeScript check + production Vite build → `dist/` |
| `npm run preview` | Serve production build via `server.mjs` |
| `npm run server` | API server only on port 3501 |
| `npm run lint` | ESLint check across all source files |
<!-- /AUTO-GENERATED: scripts -->

## Linting

```bash
npm run lint
```

ESLint is configured in `eslint.config.js` with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.

## Type Checking

```bash
npx tsc --noEmit
```

No test suite exists yet. Type checking is the primary correctness gate before merging.

## Making Changes

1. Edit types in `src/types/session.ts` first — this is the single source of truth for data shapes
2. Update `src/lib/parser.ts` for any parsing logic changes
3. Update components last — they consume the typed data

## Pull Request Checklist

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds
- [ ] Manual smoke test: `npm start`, load a real session, verify rendering
