import { useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchInput({ value, onChange, placeholder = 'Search...', autoFocus = false }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()
    }
  }, [autoFocus])

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">
        🔍
      </span>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm"
        >
          ✕
        </button>
      )}
    </div>
  )
}
