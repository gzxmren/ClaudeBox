import type { ToolUseBlock, ContentBlock } from '../../types/session'
import { TOOL_ICONS, TOOL_BG_COLORS, TOOL_COLORS } from '../../utils/constants'
import { Collapsible } from '../common/Collapsible'
import { ToolResult } from './ToolResult'

interface Props {
  block: ToolUseBlock
  result?: { content: string | ContentBlock[]; is_error?: boolean }
  onSubagentClick?: (agentId: string) => void
}

export function ToolCall({ block, result, onSubagentClick }: Props) {
  const icon = TOOL_ICONS[block.name] || '🔧'
  const bgColor = TOOL_BG_COLORS[block.name] || 'bg-gray-500/10 border-gray-500/30'
  const textColor = TOOL_COLORS[block.name] || 'text-gray-400'

  const renderInput = () => {
    const input = block.input
    switch (block.name) {
      case 'Bash':
        return (
          <pre className="text-xs bg-[var(--bg-tertiary)] rounded p-2 overflow-auto max-h-[200px]">
            <code>{String(input.command || '')}</code>
          </pre>
        )
      case 'Read':
        return <span className="text-xs text-[var(--text-secondary)]">{String(input.file_path || '')}</span>
      case 'Grep':
        return (
          <span className="text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--accent)]">{String(input.pattern || '')}</span>
            {input.path ? ` in ${String(input.path)}` : ''}
          </span>
        )
      case 'Glob':
        return (
          <span className="text-xs text-[var(--text-secondary)]">
            {String(input.pattern || '')}
            {input.path ? ` in ${String(input.path)}` : ''}
          </span>
        )
      case 'Edit':
        return (
          <div className="text-xs text-[var(--text-secondary)]">
            <div>{String(input.file_path || '')}</div>
            {!!input.old_string && (
              <Collapsible title="Changes" className="mt-1" titleClassName="text-xs text-[var(--text-muted)]">
                <pre className="bg-[var(--bg-tertiary)] rounded p-2 overflow-auto max-h-[200px]">
                  <code>
                    <span className="text-red-400">- {String(input.old_string)}</span>
                    {'\n'}
                    <span className="text-green-400">+ {String(input.new_string || '')}</span>
                  </code>
                </pre>
              </Collapsible>
            )}
          </div>
        )
      case 'Write':
        return (
          <div className="text-xs text-[var(--text-secondary)]">
            <div>{String(input.file_path || '')}</div>
            {!!input.content && (
              <Collapsible title="Content" className="mt-1" titleClassName="text-xs text-[var(--text-muted)]">
                <pre className="bg-[var(--bg-tertiary)] rounded p-2 overflow-auto max-h-[200px]">
                  <code>{String(input.content).slice(0, 2000)}</code>
                </pre>
              </Collapsible>
            )}
          </div>
        )
      case 'Agent':
      case 'SendMessage':
        return (
          <div className="text-xs">
            {!!input.description && <div className="text-[var(--text-secondary)]">{String(input.description)}</div>}
            {!!input.prompt && (
              <Collapsible title="Prompt" className="mt-1" titleClassName="text-xs text-[var(--text-muted)]">
                <div className="text-[var(--text-secondary)] whitespace-pre-wrap max-h-[200px] overflow-auto">
                  {String(input.prompt).slice(0, 1000)}
                </div>
              </Collapsible>
            )}
            {onSubagentClick && !!input.subagent_type && (
              <button
                onClick={() => onSubagentClick(String(input.subagent_type))}
                className="mt-1 text-[var(--accent)] hover:underline"
              >
                View subagent conversation →
              </button>
            )}
          </div>
        )
      case 'TodoWrite':
        return (
          <Collapsible title="Todos" className="mt-0" titleClassName="text-xs text-[var(--text-muted)]">
            <pre className="text-xs bg-[var(--bg-tertiary)] rounded p-2 overflow-auto max-h-[200px]">
              <code>{JSON.stringify(input.todos, null, 2)}</code>
            </pre>
          </Collapsible>
        )
      default:
        return (
          <Collapsible title="Input" className="mt-0" titleClassName="text-xs text-[var(--text-muted)]">
            <pre className="text-xs bg-[var(--bg-tertiary)] rounded p-2 overflow-auto max-h-[200px]">
              <code>{JSON.stringify(input, null, 2)}</code>
            </pre>
          </Collapsible>
        )
    }
  }

  return (
    <div className={`my-2 rounded-lg border p-3 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className={`text-sm font-medium ${textColor}`}>{block.name}</span>
      </div>
      {renderInput()}
      {result && <ToolResult content={result.content} isError={result.is_error} />}
    </div>
  )
}
