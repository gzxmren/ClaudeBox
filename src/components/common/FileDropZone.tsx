import { useState, type DragEvent, type ReactNode } from 'react'
import { useSessionStore } from '../../store/useSessionStore'

interface Props {
  children: ReactNode
}

export function FileDropZone({ children }: Props) {
  const [dragging, setDragging] = useState(false)
  const loadFromFiles = useSessionStore(s => s.loadFromFiles)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      await loadFromFiles(e.dataTransfer.files)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full h-full"
    >
      {children}
      {dragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--accent)]/20 border-2 border-dashed border-[var(--accent)] rounded-lg backdrop-blur-sm">
          <div className="text-lg font-semibold text-[var(--accent)]">
            Drop .jsonl files here
          </div>
        </div>
      )}
    </div>
  )
}
