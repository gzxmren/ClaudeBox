import type { SubagentData } from '../../types/session'
import { useSessionStore } from '../../store/useSessionStore'

interface Props {
  subagents: SubagentData[]
}

export function SubagentTabs({ subagents }: Props) {
  const activeTab = useSessionStore(s => s.activeTab)
  const setActiveTab = useSessionStore(s => s.setActiveTab)

  if (subagents.length === 0) return null

  return (
    <div className="flex gap-1 px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)] overflow-x-auto">
      <button
        onClick={() => setActiveTab('main')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
          activeTab === 'main'
            ? 'bg-[var(--accent)] text-white'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
        }`}
      >
        Main
      </button>
      {subagents.map((sa, i) => (
        <button
          key={sa.meta.agentId || i}
          onClick={() => setActiveTab(sa.meta.agentId || String(i))}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === (sa.meta.agentId || String(i))
              ? 'bg-purple-600 text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          }`}
        >
          🤖 {sa.meta.agentType || `Agent ${i + 1}`}
        </button>
      ))}
    </div>
  )
}
