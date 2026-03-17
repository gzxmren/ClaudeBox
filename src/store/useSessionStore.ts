import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Project, Session, SearchHit, SearchIndex } from '../types/session'
import { fetchProjects, loadDroppedFiles } from '../lib/fileLoader'
import { buildSearchIndex, search as doSearch, getUserQuestions } from '../lib/search'

interface SessionState {
  // Data
  projects: Project[]
  activeSessionId: string | null
  activeTab: 'main' | string
  loading: boolean
  error: string | null

  // Search
  searchQuery: string
  searchResults: SearchHit[]
  searchFilter: 'all' | 'user' | 'assistant' | 'tool'
  searchIndex: SearchIndex | null
  searchPanelOpen: boolean
  // Global search (B1)
  globalSearchMode: boolean
  globalSearchIndex: SearchIndex | null

  // Session filter (B2)
  sessionFilter: string

  // UI
  theme: 'dark' | 'light'
  sidebarCollapsed: boolean
  highlightedMessageId: string | null
  messageFontSize: number

  // Actions
  loadFromServer: () => Promise<void>
  loadFromFiles: (files: FileList | File[]) => Promise<void>
  selectSession: (id: string) => void
  setActiveTab: (tab: string) => void
  setSearchQuery: (query: string) => void
  setSearchFilter: (filter: 'all' | 'user' | 'assistant' | 'tool') => void
  toggleSearchPanel: () => void
  toggleGlobalSearchMode: () => void
  setSessionFilter: (filter: string) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  scrollToMessage: (messageId: string) => void
  setMessageFontSize: (size: number) => void
  getActiveSession: () => Session | null
  getUserQuestionsList: () => { id: string; text: string; timestamp: string }[]
  getFilteredProjects: () => Project[]
}

export const useSessionStore = create<SessionState>()(
  immer((set, get) => ({
    projects: [],
    activeSessionId: null,
    activeTab: 'main',
    loading: false,
    error: null,

    searchQuery: '',
    searchResults: [],
    searchFilter: 'all',
    searchIndex: null,
    searchPanelOpen: false,
    globalSearchMode: false,
    globalSearchIndex: null,

    sessionFilter: '',

    theme: (typeof window !== 'undefined' && localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
    sidebarCollapsed: false,
    highlightedMessageId: null,
    messageFontSize: (typeof window !== 'undefined' && Number(localStorage.getItem('messageFontSize'))) || 15,

    loadFromServer: async () => {
      set(s => { s.loading = true; s.error = null })
      try {
        const projects = await fetchProjects()
        set(s => {
          s.projects = projects
          s.loading = false
          // Auto-select first session
          if (projects.length > 0 && projects[0].sessions.length > 0) {
            s.activeSessionId = projects[0].sessions[0].id
          }
        })
        // Build search index for selected session + global index
        const state = get()
        if (state.activeSessionId) {
          const session = findSession(state.projects, state.activeSessionId)
          if (session) {
            const idx = buildSearchIndex(session.id, session.messages)
            set(s => { s.searchIndex = idx })
          }
        }
        // Build global index across all sessions
        const globalEntries = get().projects.flatMap(p =>
          p.sessions.flatMap(s => buildSearchIndex(s.id, s.messages).entries)
        )
        set(s => { s.globalSearchIndex = { entries: globalEntries } })
      } catch (e) {
        set(s => { s.loading = false; s.error = (e as Error).message })
      }
    },

    loadFromFiles: async (files) => {
      set(s => { s.loading = true; s.error = null })
      try {
        const sessions = await loadDroppedFiles(files)
        set(s => {
          const existing = s.projects.find(p => p.encodedPath === '__dropped__')
          if (existing) {
            existing.sessions.push(...sessions)
          } else {
            s.projects.push({
              encodedPath: '__dropped__',
              decodedPath: 'Imported Sessions',
              sessions,
            })
          }
          s.loading = false
          if (sessions.length > 0) {
            s.activeSessionId = sessions[0].id
          }
        })
      } catch (e) {
        set(s => { s.loading = false; s.error = (e as Error).message })
      }
    },

    selectSession: (id) => {
      set(s => {
        s.activeSessionId = id
        s.activeTab = 'main'
        s.highlightedMessageId = null
      })
      // Rebuild search index
      const state = get()
      const session = findSession(state.projects, id)
      if (session) {
        const idx = buildSearchIndex(session.id, session.messages)
        set(s => {
          s.searchIndex = idx
          s.searchResults = state.searchQuery
            ? doSearch(state.searchQuery, idx, state.searchFilter)
            : []
        })
      }
    },

    setActiveTab: (tab) => set(s => { s.activeTab = tab }),

    setSearchQuery: (query) => {
      const state = get()
      const activeIndex = state.globalSearchMode ? state.globalSearchIndex : state.searchIndex
      const results = activeIndex
        ? doSearch(query, activeIndex, state.searchFilter)
        : []
      set(s => { s.searchQuery = query; s.searchResults = results })
    },

    setSearchFilter: (filter) => {
      const state = get()
      const activeIndex = state.globalSearchMode ? state.globalSearchIndex : state.searchIndex
      const results = activeIndex
        ? doSearch(state.searchQuery, activeIndex, filter)
        : []
      set(s => { s.searchFilter = filter; s.searchResults = results })
    },

    toggleSearchPanel: () => set(s => { s.searchPanelOpen = !s.searchPanelOpen }),

    toggleGlobalSearchMode: () => {
      const state = get()
      const next = !state.globalSearchMode
      const activeIndex = next ? state.globalSearchIndex : state.searchIndex
      const results = activeIndex && state.searchQuery
        ? doSearch(state.searchQuery, activeIndex, state.searchFilter)
        : []
      set(s => { s.globalSearchMode = next; s.searchResults = results })
    },

    setSessionFilter: (filter) => set(s => { s.sessionFilter = filter }),

    toggleTheme: () => set(s => {
      s.theme = s.theme === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', s.theme)
        document.documentElement.classList.toggle('dark', s.theme === 'dark')
      }
    }),

    toggleSidebar: () => set(s => { s.sidebarCollapsed = !s.sidebarCollapsed }),

    setMessageFontSize: (size) => set(s => {
      const clamped = Math.max(12, Math.min(24, size))
      s.messageFontSize = clamped
      if (typeof window !== 'undefined') localStorage.setItem('messageFontSize', String(clamped))
    }),

    scrollToMessage: (messageId) => {
      set(s => { s.highlightedMessageId = messageId })
      // Scroll to element
      setTimeout(() => {
        const el = document.getElementById(`msg-${messageId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Clear highlight after animation
          setTimeout(() => set(s => { s.highlightedMessageId = null }), 2000)
        }
      }, 50)
    },

    getActiveSession: () => {
      const state = get()
      if (!state.activeSessionId) return null
      return findSession(state.projects, state.activeSessionId)
    },

    getUserQuestionsList: () => {
      const state = get()
      const session = state.getActiveSession()
      if (!session) return []
      return getUserQuestions(session.messages)
    },

    getFilteredProjects: () => {
      const state = get()
      const filter = state.sessionFilter.toLowerCase().trim()
      if (!filter) return state.projects
      return state.projects
        .map(p => ({
          ...p,
          sessions: p.sessions.filter(s => {
            const title = (s.slug || s.messages.find(m => m.role === 'user' && !m.content.some(b => b.type === 'tool_result'))?.rawContent || '').toLowerCase()
            return title.includes(filter) || p.decodedPath.toLowerCase().includes(filter)
          }),
        }))
        .filter(p => p.sessions.length > 0)
    },
  }))
)

function findSession(projects: Project[], id: string): Session | null {
  for (const p of projects) {
    const s = p.sessions.find(s => s.id === id)
    if (s) return s
  }
  return null
}
