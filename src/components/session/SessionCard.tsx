import type { Session } from '../../types/session'
import { formatRelativeTime, formatTokenCount, truncate } from '../../utils/formatters'
import { useSessionStore } from '../../store/useSessionStore'

interface Props {
  session: Session
}

export function SessionCard({ session }: Props) {
  const activeSessionId = useSessionStore(s => s.activeSessionId)
  const selectSession = useSessionStore(s => s.selectSession)
  const isActive = activeSessionId === session.id

  // Get first user message as title
  const firstUserMsg = session.messages.find(m => m.role === 'user')
  const title = firstUserMsg
    ? truncate(firstUserMsg.rawContent || 'Tool result', 60)
    : 'Empty session'

  return (
    <button
      onClick={() => selectSession(session.id)}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/30'
          : 'hover:bg-[var(--bg-tertiary)] border border-transparent'
      }`}
    >
      <div className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">
        {title}
      </div>
      <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--text-muted)]">
        <span>{formatRelativeTime(session.timestamp)}</span>
        <span>·</span>
        <span>{session.stats.messageCount} msgs</span>
        <span>·</span>
        <span>{formatTokenCount(session.stats.totalInputTokens + session.stats.totalOutputTokens)} tokens</span>
      </div>
      {session.stats.models.length > 0 && (
        <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
          {session.stats.models[0]}
        </div>
      )}
    </button>
  )
}
