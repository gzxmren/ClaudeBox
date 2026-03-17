import type { Project, Session, SubagentMeta } from '../types/session'
import { parseSession } from './parser'

export async function fetchProjects(baseUrl = ''): Promise<Project[]> {
  const res = await fetch(`${baseUrl}/api/projects`)
  if (!res.ok) throw new Error('Failed to fetch projects')
  const projectPaths: string[] = await res.json()

  const projects: Project[] = []
  for (const encodedPath of projectPaths) {
    const decodedPath = encodedPath.replace(/-/g, '/')
    const sessionsRes = await fetch(`${baseUrl}/api/projects/${encodeURIComponent(encodedPath)}/sessions`)
    if (!sessionsRes.ok) continue
    const sessionIds: string[] = await sessionsRes.json()

    const sessions: Session[] = []
    for (const sid of sessionIds) {
      try {
        const jsonlRes = await fetch(
          `${baseUrl}/api/projects/${encodeURIComponent(encodedPath)}/sessions/${sid}`
        )
        if (!jsonlRes.ok) continue
        const jsonl = await jsonlRes.text()

        // Try to load subagents
        let subagentFiles: { meta: SubagentMeta; jsonl: string }[] | undefined
        try {
          const saRes = await fetch(
            `${baseUrl}/api/projects/${encodeURIComponent(encodedPath)}/sessions/${sid}/subagents`
          )
          if (saRes.ok) {
            const saList: string[] = await saRes.json()
            subagentFiles = []
            for (const saId of saList) {
              const metaRes = await fetch(
                `${baseUrl}/api/projects/${encodeURIComponent(encodedPath)}/sessions/${sid}/subagents/${saId}/meta`
              )
              const jsonlSaRes = await fetch(
                `${baseUrl}/api/projects/${encodeURIComponent(encodedPath)}/sessions/${sid}/subagents/${saId}/jsonl`
              )
              if (metaRes.ok && jsonlSaRes.ok) {
                const meta = await metaRes.json()
                const saJsonl = await jsonlSaRes.text()
                subagentFiles.push({ meta: { agentId: saId, ...meta }, jsonl: saJsonl })
              }
            }
          }
        } catch { /* no subagents */ }

        sessions.push(parseSession(sid, jsonl, subagentFiles))
      } catch { /* skip broken sessions */ }
    }

    sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    if (sessions.length > 0) {
      projects.push({ encodedPath, decodedPath, sessions })
    }
  }

  return projects
}

export async function loadDroppedFiles(files: FileList | File[]): Promise<Session[]> {
  const fileArray = Array.from(files)
  const jsonlFiles = fileArray.filter(f => f.name.endsWith('.jsonl'))
  const sessions: Session[] = []

  for (const file of jsonlFiles) {
    const text = await file.text()
    const id = file.name.replace('.jsonl', '')
    sessions.push(parseSession(id, text))
  }

  sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return sessions
}
