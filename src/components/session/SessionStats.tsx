import type { SessionStats as Stats } from '../../types/session'
import { formatTokenCount, formatDuration } from '../../utils/formatters'

interface Props {
  stats: Stats
  cwd?: string
  gitBranch?: string
}

export function SessionStats({ stats, cwd, gitBranch }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border)] text-xs text-[var(--text-secondary)]">
      <div className="flex items-center gap-1">
        <span className="text-[var(--text-muted)]">In:</span>
        <span className="font-medium">{formatTokenCount(stats.totalInputTokens)}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[var(--text-muted)]">Out:</span>
        <span className="font-medium">{formatTokenCount(stats.totalOutputTokens)}</span>
      </div>
      {stats.totalCacheTokens > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-[var(--text-muted)]">Cache:</span>
          <span className="font-medium">{formatTokenCount(stats.totalCacheTokens)}</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <span className="text-[var(--text-muted)]">Duration:</span>
        <span className="font-medium">{formatDuration(stats.duration)}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[var(--text-muted)]">Tools:</span>
        <span className="font-medium">{stats.toolUseCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[var(--text-muted)]">Messages:</span>
        <span className="font-medium">{stats.messageCount}</span>
      </div>
      {cwd && (
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-[var(--text-muted)]">📁</span>
          <span>{cwd}</span>
        </div>
      )}
      {gitBranch && (
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-[var(--text-muted)]">🌿</span>
          <span>{gitBranch}</span>
        </div>
      )}
    </div>
  )
}
