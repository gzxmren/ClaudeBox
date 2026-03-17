import { useState, useEffect, useRef } from 'react'
import type { MergedMessage, ContentBlock, ToolUseBlock } from '../../types/session'
import { ThinkingBlock } from './ThinkingBlock'
import { ToolCall } from './ToolCall'
import { MarkdownRenderer } from '../common/MarkdownRenderer'
import { formatTimestamp } from '../../utils/formatters'
import { useSessionStore } from '../../store/useSessionStore'

interface Props {
  message: MergedMessage
  toolResults: Map<string, { content: string | ContentBlock[]; is_error?: boolean }>
  onSubagentClick?: (agentId: string) => void
}

export function MessageBubble({ message, toolResults, onSubagentClick }: Props) {
  const highlightedId = useSessionStore(s => s.highlightedMessageId)
  const messageFontSize = useSessionStore(s => s.messageFontSize)
  const isHighlighted = highlightedId === message.id
  const isUser = message.role === 'user'

  const [collapsed, setCollapsed] = useState(true)
  const [overflows, setOverflows] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // 10 lines at current font size (line-height ≈ 1.6)
  const collapseHeight = Math.round(messageFontSize * 1.6 * 10)

  // Measure once after mount to determine if content exceeds 10 lines
  useEffect(() => {
    if (contentRef.current) {
      setOverflows(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  // Re-measure if font size changes (clientHeight will change)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageFontSize])

  // Check if this is a tool_result message (user record carrying tool results)
  const isToolResult = !isUser ? false : message.content.some(b => b.type === 'tool_result')
  if (isToolResult) return null // Tool results are rendered inline with their tool_use

  return (
    <div
      id={`msg-${message.id}`}
      className={`relative transition-all duration-500 ${isHighlighted ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-primary)] rounded-lg' : ''}`}
    >
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[50%] rounded-xl px-4 py-3 ${
          isUser
            ? 'bg-[var(--user-bubble)] text-[var(--text-primary)]'
            : 'bg-[var(--assistant-bubble)] border border-[var(--border)] text-[var(--text-primary)]'
        }`}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-bold tracking-wide ${isUser ? 'text-blue-500' : 'text-emerald-500'}`}>
              {isUser ? 'You' : 'Claude'}
            </span>
            {message.model && (
              <span className="text-[10px] text-[var(--text-muted)]">{message.model}</span>
            )}
            <span className="text-[10px] text-[var(--text-muted)] ml-auto">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>

          {/* Content blocks — collapsible */}
          <div
            ref={contentRef}
            style={collapsed ? { maxHeight: collapseHeight, overflow: 'hidden' } : undefined}
            className="relative"
          >
            {message.content.map((block, i) => (
              <ContentBlockRenderer
                key={i}
                block={block}
                toolResults={toolResults}
                onSubagentClick={onSubagentClick}
              />
            ))}

            {/* Fade gradient at the bottom when collapsed and overflowing */}
            {collapsed && overflows && (
              <div
                className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, transparent, var(--${isUser ? 'user' : 'assistant'}-bubble))`,
                }}
              />
            )}
          </div>

          {/* Expand / collapse toggle */}
          {overflows && (
            <button
              onClick={() => setCollapsed(c => !c)}
              className="mt-1 flex items-center gap-1 text-[11px] text-[var(--accent)] hover:opacity-70 transition-opacity"
            >
              {collapsed ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="2,4 6,8 10,4" />
                  </svg>
                  展开全部
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="2,8 6,4 10,8" />
                  </svg>
                  收起
                </>
              )}
            </button>
          )}

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
      return <MarkdownRenderer content={block.text} />
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
    case 'image': {
      const src = block.source.type === 'base64'
        ? `data:${block.source.media_type || 'image/png'};base64,${block.source.data}`
        : block.source.url
      return src
        ? <img src={src} alt="Image content" className="max-w-full rounded-md my-2 max-h-[400px] object-contain" />
        : null
    }
    default:
      return null
  }
}
