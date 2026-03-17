import { useEffect, useRef } from 'react'
import { useSessionStore } from '../store/useSessionStore'

export function useSearchShortcut() {
  const toggleSearchPanel = useSessionStore(s => s.toggleSearchPanel)
  const handledRef = useRef(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to toggle search panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        toggleSearchPanel()
        handledRef.current = true
      }
      // Escape to close
      if (e.key === 'Escape') {
        const state = useSessionStore.getState()
        if (state.searchPanelOpen) {
          toggleSearchPanel()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleSearchPanel])
}
