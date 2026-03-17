import { useEffect } from 'react'
import { useSessionStore } from './store/useSessionStore'
import { useTheme } from './hooks/useTheme'
import { useSearchShortcut } from './hooks/useSearch'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { MainContent } from './components/layout/MainContent'
import { SearchPanel } from './components/layout/SearchPanel'
import { FileDropZone } from './components/common/FileDropZone'

export default function App() {
  useTheme()
  useSearchShortcut()
  const loadFromServer = useSessionStore(s => s.loadFromServer)

  useEffect(() => {
    loadFromServer()
  }, [loadFromServer])

  return (
    <FileDropZone>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
        <SearchPanel />
      </div>
    </FileDropZone>
  )
}
