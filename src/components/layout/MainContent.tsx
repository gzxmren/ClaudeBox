import { useSessionStore } from '../../store/useSessionStore'
import { SessionStats } from '../session/SessionStats'
import { SubagentTabs } from '../subagent/SubagentTabs'
import { SubagentThread } from '../subagent/SubagentThread'
import { MessageThread } from '../conversation/MessageThread'

export function MainContent() {
  const getActiveSession = useSessionStore(s => s.getActiveSession)
  const activeTab = useSessionStore(s => s.activeTab)
  const setActiveTab = useSessionStore(s => s.setActiveTab)
  const loading = useSessionStore(s => s.loading)
  const error = useSessionStore(s => s.error)

  const session = getActiveSession()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[var(--text-muted)] text-sm">Loading sessions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <div className="text-4xl">💬</div>
        <div className="text-[var(--text-muted)] text-sm">
          Select a session or import .jsonl files to get started
        </div>
        <div className="text-[var(--text-muted)] text-xs">
          Drag & drop files anywhere, or use the Import button
        </div>
      </div>
    )
  }

  const activeSubagent = session.subagents.find(
    sa => sa.meta.agentId === activeTab || sa.meta.agentType === activeTab
  )

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Stats bar */}
      <SessionStats stats={session.stats} cwd={session.cwd} gitBranch={session.gitBranch} />

      {/* Subagent tabs */}
      {session.subagents.length > 0 && (
        <SubagentTabs subagents={session.subagents} />
      )}

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'main' || !activeSubagent ? (
          <MessageThread
            messages={session.messages}
            onSubagentClick={(id) => setActiveTab(id)}
          />
        ) : (
          <SubagentThread subagent={activeSubagent} />
        )}
      </div>
    </div>
  )
}
