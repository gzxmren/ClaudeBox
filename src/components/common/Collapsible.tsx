import { useState, type ReactNode } from 'react'

interface Props {
  title: string
  defaultOpen?: boolean
  className?: string
  titleClassName?: string
  children: ReactNode
}

export function Collapsible({ title, defaultOpen = false, className = '', titleClassName = '', children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity ${titleClassName}`}
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        {title}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  )
}
