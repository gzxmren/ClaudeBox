import { useEffect } from 'react'
import { useSessionStore } from '../store/useSessionStore'

export function useTheme() {
  const theme = useSessionStore(s => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return theme
}
