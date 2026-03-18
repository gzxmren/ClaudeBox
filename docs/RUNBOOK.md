# Runbook

## Deployment

### Development

```bash
npm install
npm start
# Frontend: http://localhost:5173
# API:      http://localhost:3501
```

### Production

```bash
npm run build          # outputs to dist/
npm run preview        # serves dist/ + API on PORT (default 3501)
```

<!-- AUTO-GENERATED: env -->
### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3501` | API server listen port |
<!-- /AUTO-GENERATED: env -->

Set `PORT` before running to change the port:

```bash
PORT=8080 npm run preview
```

<!-- AUTO-GENERATED: api -->
### API Endpoints

All endpoints are read-only (`GET`) and served by `server.mjs`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/projects` | List all project directory names |
| `GET` | `/api/projects/:project/sessions` | List session IDs for a project |
| `GET` | `/api/projects/:project/sessions/:id` | Raw JSONL content for a session |
| `GET` | `/api/projects/:project/sessions/:id/subagents` | List subagent IDs |
| `GET` | `/api/projects/:project/sessions/:id/subagents/:agent/meta` | Subagent `.meta.json` |
| `GET` | `/api/projects/:project/sessions/:id/subagents/:agent/jsonl` | Subagent JSONL |

All other paths fall through to the built `dist/` directory (SPA fallback to `index.html`).
<!-- /AUTO-GENERATED: api -->

## Data Location

Session files are read from `~/.claude/projects/` (hardcoded in `server.mjs`). No write operations are performed.

```
~/.claude/projects/
└── <encoded-project-path>/          # directory per project
    ├── <session-id>.jsonl           # main session
    └── <session-id>/
        └── <agent-id>/
            ├── .meta.json           # subagent metadata
            └── <agent-id>.jsonl     # subagent conversation
```

## Health Check

The server has no dedicated health endpoint. A quick check:

```bash
curl http://localhost:3501/api/projects
# Should return a JSON array of project names
```

## Common Issues

**No sessions shown in the UI**
- Confirm the API server is running: `curl http://localhost:3501/api/projects`
- Confirm `~/.claude/projects/` exists and contains `.jsonl` files
- In dev mode, confirm both the Vite dev server AND `server.mjs` are running (`npm start` handles this)

**"Failed to fetch projects" error**
- The API server is not running — run `npm run server` or `npm start`
- A firewall or proxy is blocking port 3501 — change with `PORT=<other> npm run server`

**Build fails with type errors**
- Run `npx tsc --noEmit` to see full error list
- Check `src/types/session.ts` for any recently changed interfaces

**Port already in use**
```bash
PORT=3502 npm start
```

## Rollback

This is a local tool with no remote deployment. To rollback:

```bash
git log --oneline -10     # find the target commit
git checkout <commit>     # or create a branch from it
npm install && npm start
```
