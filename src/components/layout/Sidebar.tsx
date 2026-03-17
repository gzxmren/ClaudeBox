import { useSessionStore } from '../../store/useSessionStore'
import { SessionList } from '../session/SessionList'

export function Sidebar() {
  const projects = useSessionStore(s => s.projects)
  const collapsed = useSessionStore(s => s.sidebarCollapsed)

  return (
    <aside
      className={`h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] overflow-y-auto transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-0 overflow-hidden' : 'w-72'
      }`}
    >
      <div className="w-72">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Sessions</h2>
        </div>
        <SessionList projects={projects} />
      </div>
    </aside>
  )
}
