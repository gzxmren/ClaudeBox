import { useSessionStore } from '../../store/useSessionStore'
import { SessionList } from '../session/SessionList'

export function Sidebar() {
  const collapsed = useSessionStore(s => s.sidebarCollapsed)
  const sessionFilter = useSessionStore(s => s.sessionFilter)
  const setSessionFilter = useSessionStore(s => s.setSessionFilter)
  // Compute filtered projects inline so Zustand re-renders when sessionFilter
  // or projects change (selecting the function reference would never trigger
  // re-renders, as the reference itself never changes).
  const filteredProjects = useSessionStore(s => {
    const filter = s.sessionFilter.toLowerCase().trim()
    if (!filter) return s.projects
    return s.projects
      .map(p => ({
        ...p,
        sessions: p.sessions.filter(sess => {
          const title = (sess.slug || sess.messages.find(m => m.role === 'user' && !m.content.some(b => b.type === 'tool_result'))?.rawContent || '').toLowerCase()
          return title.includes(filter) || p.decodedPath.toLowerCase().includes(filter)
        }),
      }))
      .filter(p => p.sessions.length > 0)
  })

  return (
    <aside
      className={`h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] overflow-y-auto transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-0 overflow-hidden' : 'w-72'
      }`}
    >
      <div className="w-72">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Sessions</h2>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[11px]">🔍</span>
            <input
              type="text"
              value={sessionFilter}
              onChange={e => setSessionFilter(e.target.value)}
              placeholder="Filter sessions..."
              className="w-full pl-6 pr-6 py-1.5 text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            {sessionFilter && (
              <button
                onClick={() => setSessionFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[11px]"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <SessionList projects={filteredProjects} />
      </div>
    </aside>
  )
}
