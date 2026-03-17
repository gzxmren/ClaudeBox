export function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleString()
}

export function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatTokenCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function formatDuration(ms: number): string {
  const secs = Math.floor(ms / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  const remSecs = secs % 60
  if (mins < 60) return `${mins}m ${remSecs}s`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  return `${hours}h ${remMins}m`
}

export function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s
  return s.slice(0, maxLen) + '...'
}
