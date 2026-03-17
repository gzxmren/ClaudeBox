import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = parseInt(process.env.PORT || '3501', 10)
const CLAUDE_DIR = path.join(os.homedir(), '.claude', 'projects')
const DIST_DIR = path.join(__dirname, 'dist')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(JSON.stringify(data))
}

function sendText(res, text, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(text)
}

function sendError(res, msg, status = 404) {
  sendJson(res, { error: msg }, status)
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath)
  const mime = MIME_TYPES[ext] || 'application/octet-stream'

  if (!fs.existsSync(filePath)) {
    // SPA fallback
    const indexPath = path.join(DIST_DIR, 'index.html')
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      fs.createReadStream(indexPath).pipe(res)
      return
    }
    sendError(res, 'Not found')
    return
  }

  res.writeHead(200, { 'Content-Type': mime })
  fs.createReadStream(filePath).pipe(res)
}

function listDir(dirPath) {
  if (!fs.existsSync(dirPath)) return []
  return fs.readdirSync(dirPath)
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    })
    res.end()
    return
  }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = decodeURIComponent(url.pathname)

  // API routes
  if (pathname === '/api/projects') {
    const projects = listDir(CLAUDE_DIR).filter(d => {
      const full = path.join(CLAUDE_DIR, d)
      return fs.statSync(full).isDirectory()
    })
    sendJson(res, projects)
    return
  }

  const projectSessionsMatch = pathname.match(/^\/api\/projects\/([^/]+)\/sessions$/)
  if (projectSessionsMatch) {
    const projectPath = projectSessionsMatch[1]
    const projectDir = path.join(CLAUDE_DIR, projectPath)
    const files = listDir(projectDir)
    const sessions = files
      .filter(f => f.endsWith('.jsonl'))
      .map(f => f.replace('.jsonl', ''))
    sendJson(res, sessions)
    return
  }

  const sessionMatch = pathname.match(/^\/api\/projects\/([^/]+)\/sessions\/([^/]+)$/)
  if (sessionMatch) {
    const [, projectPath, sessionId] = sessionMatch
    const filePath = path.join(CLAUDE_DIR, projectPath, `${sessionId}.jsonl`)
    if (!fs.existsSync(filePath)) {
      sendError(res, 'Session not found')
      return
    }
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    })
    fs.createReadStream(filePath).pipe(res)
    return
  }

  const subagentsListMatch = pathname.match(/^\/api\/projects\/([^/]+)\/sessions\/([^/]+)\/subagents$/)
  if (subagentsListMatch) {
    const [, projectPath, sessionId] = subagentsListMatch
    const saDir = path.join(CLAUDE_DIR, projectPath, sessionId)
    if (!fs.existsSync(saDir) || !fs.statSync(saDir).isDirectory()) {
      sendJson(res, [])
      return
    }
    const agents = listDir(saDir).filter(d => {
      const full = path.join(saDir, d)
      return fs.statSync(full).isDirectory()
    })
    sendJson(res, agents)
    return
  }

  const subagentMatch = pathname.match(
    /^\/api\/projects\/([^/]+)\/sessions\/([^/]+)\/subagents\/([^/]+)\/(meta|jsonl)$/
  )
  if (subagentMatch) {
    const [, projectPath, sessionId, agentId, fileType] = subagentMatch
    const saDir = path.join(CLAUDE_DIR, projectPath, sessionId, agentId)

    if (fileType === 'meta') {
      const metaPath = path.join(saDir, '.meta.json')
      if (!fs.existsSync(metaPath)) {
        sendError(res, 'Meta not found')
        return
      }
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      sendJson(res, meta)
      return
    }

    // jsonl - find the .jsonl file in the subagent dir
    const files = listDir(saDir).filter(f => f.endsWith('.jsonl'))
    if (files.length === 0) {
      sendError(res, 'No JSONL found')
      return
    }
    const jsonlPath = path.join(saDir, files[0])
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    })
    fs.createReadStream(jsonlPath).pipe(res)
    return
  }

  // Static file serving (production)
  if (fs.existsSync(DIST_DIR)) {
    const filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname)
    serveStatic(res, filePath)
    return
  }

  sendError(res, 'Not found')
})

server.listen(PORT, () => {
  console.log(`Claude Session Viewer server running at http://localhost:${PORT}`)
  console.log(`Serving sessions from: ${CLAUDE_DIR}`)
})
