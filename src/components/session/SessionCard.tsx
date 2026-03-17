import type { Session } from '../../types/session'
import { formatTokenCount, truncate } from '../../utils/formatters'
import { useSessionStore } from '../../store/useSessionStore'

interface Props {
  session: Session
}

// Uses local timezone methods (getMonth/getDate/getHours) intentionally:
// this is a local-only app and users expect to see times in their own timezone.
function formatShortDate(ts: string): string {
  const d = new Date(ts)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours().toString().padStart(2, '0')
  const mins = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hours}:${mins}`
}

export function SessionCard({ session }: Props) {
  const activeSessionId = useSessionStore(s => s.activeSessionId)
  const selectSession = useSessionStore(s => s.selectSession)
  const isActive = activeSessionId === session.id

  // Primary title: slug if available, else formatted date + message count
  const title = session.slug
    ? truncate(session.slug, 50)
    : `${formatShortDate(session.timestamp)} · ${session.stats.messageCount} msgs`

  // Preview: first user message text
  const firstUserMsg = session.messages.find(m => m.role === 'user')
  const preview = firstUserMsg
    ? truncate(firstUserMsg.rawContent || '', 60)
    : null

  return (
    <button
      onClick={() => selectSession(session.id)}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/30'
          : 'hover:bg-[var(--bg-tertiary)] border border-transparent'
      }`}
    >
      <div className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
        {title}
      </div>
      {preview && (
        <div className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">
          {preview}
        </div>
      )}
      <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--text-muted)]">
        <span>{formatShortDate(session.timestamp)}</span>
        <span>·</span>
        <span>{session.stats.messageCount} msgs</span>
        <span>·</span>
        <span>{formatTokenCount(session.stats.totalInputTokens + session.stats.totalOutputTokens)} tok</span>
      </div>
    </button>
  )
}
