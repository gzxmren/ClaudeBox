import { useSessionStore } from '../../store/useSessionStore'

export function Header() {
  const toggleTheme = useSessionStore(s => s.toggleTheme)
  const toggleSidebar = useSessionStore(s => s.toggleSidebar)
  const toggleSearchPanel = useSessionStore(s => s.toggleSearchPanel)
  const searchPanelOpen = useSessionStore(s => s.searchPanelOpen)
  const theme = useSessionStore(s => s.theme)
  const loadFromFiles = useSessionStore(s => s.loadFromFiles)
  const messageFontSize = useSessionStore(s => s.messageFontSize)
  const setMessageFontSize = useSessionStore(s => s.setMessageFontSize)

  const handleFileImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.jsonl'
    input.multiple = true
    input.onchange = async () => {
      if (input.files && input.files.length > 0) {
        await loadFromFiles(input.files)
      }
    }
    input.click()
  }

  return (
    <header className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
          title="Toggle sidebar"
        >
          ☰
        </button>
        <h1 className="text-sm font-semibold text-[var(--text-primary)]">
          Claude Session Viewer
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleFileImport}
          className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          title="Import .jsonl files"
        >
          📂 Import
        </button>

        <button
          onClick={toggleSearchPanel}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            searchPanelOpen
              ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          }`}
          title="Toggle search panel (Ctrl+F)"
        >
          🔍 Search
        </button>

        {/* Font size control */}
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={() => setMessageFontSize(messageFontSize - 1)}
            className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Decrease font size"
          >
            A-
          </button>
          <span className="text-[10px] text-[var(--text-muted)] w-6 text-center">{messageFontSize}</span>
          <button
            onClick={() => setMessageFontSize(messageFontSize + 1)}
            className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Increase font size"
          >
            A+
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
