import type { ContentBlock } from '../../types/session'
import { Collapsible } from '../common/Collapsible'

interface Props {
  content: string | ContentBlock[]
  isError?: boolean
}

export function ToolResult({ content, isError }: Props) {
  const text = typeof content === 'string'
    ? content
    : content.map(b => {
        if (b.type === 'text') return b.text
        return JSON.stringify(b)
      }).join('\n')

  if (!text.trim()) return null

  const lines = text.split('\n')
  const isLong = lines.length > 8

  return (
    <Collapsible
      title={`Result${isError ? ' (error)' : ''} · ${lines.length} lines`}
      defaultOpen={!isLong}
      className="mt-1"
      titleClassName={`text-xs ${isError ? 'text-red-400' : 'text-[var(--text-muted)]'}`}
    >
      <pre className={`text-xs overflow-auto max-h-[300px] rounded-md p-2 ${isError ? 'bg-red-500/10 text-red-300' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
        <code>{text}</code>
      </pre>
    </Collapsible>
  )
}
