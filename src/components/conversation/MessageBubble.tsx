import type { MergedMessage, ContentBlock, ToolUseBlock } from '../../types/session'
import { ThinkingBlock } from './ThinkingBlock'
import { ToolCall } from './ToolCall'
import { formatTimestamp } from '../../utils/formatters'
import { useSessionStore } from '../../store/useSessionStore'

interface Props {
  message: MergedMessage
  toolResults: Map<string, { content: string | ContentBlock[]; is_error?: boolean }>
  onSubagentClick?: (agentId: string) => void
}

export function MessageBubble({ message, toolResults, onSubagentClick }: Props) {
  const highlightedId = useSessionStore(s => s.highlightedMessageId)
  const isHighlighted = highlightedId === message.id
  const isUser = message.role === 'user'

  // Check if this is a tool_result message (user record carrying tool results)
  const isToolResult = !isUser ? false : message.content.some(b => b.type === 'tool_result')
  if (isToolResult) return null // Tool results are rendered inline with their tool_use

  return (
    <div
      id={`msg-${message.id}`}
      className={`relative transition-all duration-500 ${isHighlighted ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-primary)] rounded-lg' : ''}`}
    >
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
          isUser
            ? 'bg-[var(--user-bubble)] text-[var(--text-primary)]'
            : 'bg-[var(--assistant-bubble)] border border-[var(--border)] text-[var(--text-primary)]'
        }`}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${isUser ? 'text-blue-500' : 'text-emerald-500'}`}>
              {isUser ? 'You' : 'Claude'}
            </span>
            {message.model && (
              <span className="text-[10px] text-[var(--text-muted)]">{message.model}</span>
            )}
            <span className="text-[10px] text-[var(--text-muted)] ml-auto">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>

          {/* Content blocks */}
          {message.content.map((block, i) => (
            <ContentBlockRenderer
              key={i}
              block={block}
              toolResults={toolResults}
              onSubagentClick={onSubagentClick}
            />
          ))}

          {/* Token usage */}
          {message.usage && (
            <div className="mt-2 pt-1 border-t border-[var(--border)] flex gap-3 text-[10px] text-[var(--text-muted)]">
              <span>In: {message.usage.input_tokens?.toLocaleString()}</span>
              <span>Out: {message.usage.output_tokens?.toLocaleString()}</span>
              {message.usage.cache_read_input_tokens ? (
                <span>Cache: {message.usage.cache_read_input_tokens.toLocaleString()}</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ContentBlockRenderer({
  block,
  toolResults,
  onSubagentClick,
}: {
  block: ContentBlock
  toolResults: Map<string, { content: string | ContentBlock[]; is_error?: boolean }>
  onSubagentClick?: (agentId: string) => void
}) {
  switch (block.type) {
    case 'text':
      return (
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {block.text}
        </div>
      )
    case 'thinking':
      return <ThinkingBlock thinking={block.thinking} />
    case 'tool_use': {
      const result = toolResults.get(block.id)
      return (
        <ToolCall
          block={block as ToolUseBlock}
          result={result}
          onSubagentClick={onSubagentClick}
        />
      )
    }
    case 'tool_result':
      return null // Rendered as part of ToolCall
    default:
      return null
  }
}
