import { useSessionStore } from '../../store/useSessionStore'
import { SearchInput } from '../common/SearchInput'
import { truncate, formatTimestamp } from '../../utils/formatters'

export function SearchPanel() {
  const searchPanelOpen = useSessionStore(s => s.searchPanelOpen)
  const toggleSearchPanel = useSessionStore(s => s.toggleSearchPanel)
  const searchQuery = useSessionStore(s => s.searchQuery)
  const setSearchQuery = useSessionStore(s => s.setSearchQuery)
  const searchFilter = useSessionStore(s => s.searchFilter)
  const setSearchFilter = useSessionStore(s => s.setSearchFilter)
  const searchResults = useSessionStore(s => s.searchResults)
  const scrollToMessage = useSessionStore(s => s.scrollToMessage)
  const getUserQuestionsList = useSessionStore(s => s.getUserQuestionsList)

  const questions = getUserQuestionsList()
  const filters: Array<{ label: string; value: 'all' | 'user' | 'assistant' | 'tool' }> = [
    { label: 'All', value: 'all' },
    { label: 'User', value: 'user' },
    { label: 'Claude', value: 'assistant' },
    { label: 'Tool', value: 'tool' },
  ]

  // Show search results if there's a query, otherwise show user questions index
  const showingResults = searchQuery.trim().length > 0

  return (
    <>
      {/* Overlay for mobile */}
      {searchPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={toggleSearchPanel}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full z-40 bg-[var(--bg-secondary)] border-l border-[var(--border)] shadow-xl transition-transform duration-300 ease-in-out w-80 flex flex-col ${
          searchPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {showingResults ? 'Search Results' : 'Message Index'}
          </h3>
          <button
            onClick={toggleSearchPanel}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search messages..."
            autoFocus={searchPanelOpen}
          />

          {/* Filter chips */}
          <div className="flex gap-1.5 mt-2">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setSearchFilter(f.value)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  searchFilter === f.value
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results / Index */}
        <div className="flex-1 overflow-y-auto">
          {showingResults ? (
            // Search results
            searchResults.length > 0 ? (
              <div className="flex flex-col">
                <div className="px-4 py-1.5 text-[10px] text-[var(--text-muted)] bg-[var(--bg-tertiary)]">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map((hit, i) => (
                  <button
                    key={`${hit.messageId}-${i}`}
                    onClick={() => scrollToMessage(hit.messageId)}
                    className="w-full text-left px-4 py-2.5 border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        hit.role === 'user' ? 'bg-blue-500/20 text-blue-400' :
                        hit.role === 'assistant' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {hit.role === 'user' ? 'User' : hit.role === 'assistant' ? 'Claude' : 'Tool'}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {formatTimestamp(hit.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {hit.snippet}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-[var(--text-muted)] text-center">
                No results found
              </div>
            )
          ) : (
            // User questions index (default view)
            questions.length > 0 ? (
              <div className="flex flex-col">
                <div className="px-4 py-1.5 text-[10px] text-[var(--text-muted)] bg-[var(--bg-tertiary)]">
                  {questions.length} question{questions.length !== 1 ? 's' : ''} in this session
                </div>
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => scrollToMessage(q.id)}
                    className="w-full text-left px-4 py-2.5 border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-[var(--accent)]">
                        Q{i + 1}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {formatTimestamp(q.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] line-clamp-3 group-hover:text-[var(--text-primary)] transition-colors">
                      {truncate(q.text, 150)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-[var(--text-muted)] text-center">
                No questions in this session
              </div>
            )
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <div className="px-4 py-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] text-center">
          Press <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">Ctrl+F</kbd> to toggle
        </div>
      </div>

      {/* Edge toggle button (always visible when panel is closed) */}
      {!searchPanelOpen && (
        <button
          onClick={toggleSearchPanel}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-[var(--bg-secondary)] border border-r-0 border-[var(--border)] rounded-l-lg px-1.5 py-3 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-tertiary)] transition-colors shadow-md"
          title="Open search panel (Ctrl+F)"
        >
          🔍
        </button>
      )}
    </>
  )
}
