import type { MergedMessage, SearchHit, SearchIndex, ContentBlock } from '../types/session'

function extractText(blocks: ContentBlock[]): string {
  return blocks.map(b => {
    if (b.type === 'text') return b.text
    if (b.type === 'thinking') return b.thinking
    if (b.type === 'tool_use') return `${b.name} ${JSON.stringify(b.input)}`
    if (b.type === 'tool_result') {
      if (typeof b.content === 'string') return b.content
      return extractText(b.content)
    }
    return ''
  }).join(' ')
}

export function buildSearchIndex(sessionId: string, messages: MergedMessage[]): SearchIndex {
  const entries = messages.map(msg => {
    const text = msg.rawContent || extractText(msg.content)
    let role: 'user' | 'assistant' | 'tool' = msg.role
    // Check if message contains primarily tool results
    if (msg.role === 'user' && msg.content.some(b => b.type === 'tool_result')) {
      role = 'tool'
    }
    return {
      messageId: msg.id,
      sessionId,
      text,
      role,
      timestamp: msg.timestamp,
    }
  })
  return { entries }
}

export function search(query: string, index: SearchIndex, filterRole?: string): SearchHit[] {
  if (!query.trim()) {
    // Return all entries when no query, for browsing
    return index.entries
      .filter(e => !filterRole || filterRole === 'all' || e.role === filterRole)
      .map(e => ({
        messageId: e.messageId,
        sessionId: e.sessionId,
        snippet: e.text.slice(0, 120),
        role: e.role,
        timestamp: e.timestamp,
      }))
  }

  const lower = query.toLowerCase()
  return index.entries
    .filter(e => {
      if (filterRole && filterRole !== 'all' && e.role !== filterRole) return false
      return e.text.toLowerCase().includes(lower)
    })
    .map(e => {
      const idx = e.text.toLowerCase().indexOf(lower)
      const start = Math.max(0, idx - 40)
      const end = Math.min(e.text.length, idx + query.length + 40)
      const snippet = (start > 0 ? '...' : '') + e.text.slice(start, end) + (end < e.text.length ? '...' : '')
      return {
        messageId: e.messageId,
        sessionId: e.sessionId,
        snippet,
        role: e.role,
        timestamp: e.timestamp,
      }
    })
}

export function getUserQuestions(messages: MergedMessage[]): { id: string; text: string; timestamp: string }[] {
  return messages
    .filter(m => m.role === 'user' && !m.content.some(b => b.type === 'tool_result'))
    .map(m => ({
      id: m.id,
      text: m.rawContent || extractText(m.content),
      timestamp: m.timestamp,
    }))
}
