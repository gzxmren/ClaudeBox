import { useState, useEffect, useRef } from 'react'
import type { MergedMessage, ContentBlock, ToolUseBlock } from '../../types/session'
import { ThinkingBlock } from './ThinkingBlock'
import { ToolCall } from './ToolCall'
import { MarkdownRenderer } from '../common/MarkdownRenderer'
import { formatTimestamp } from '../../utils/formatters'
import { useSessionStore } from '../../store/useSessionStore'

// ── System / Continuation message: compact collapsible bar ───────────────────
function SystemMessageBar({ message }: { message: MergedMessage }) {
  const [expanded, setExpanded] = useState(false)

  const rawText =
    message.rawContent ??
    (message.content.length === 1 && message.content[0].type === 'text'
      ? message.content[0].text
      : '')

  const preview = rawText.replace(/\n/g, ' ').slice(0, 80)
  const isContinuation = message.category === 'continuation'

  const labelColor = isContinuation
    ? 'text-blue-400'
    : 'text-amber-500'

  const icon = isContinuation ? '↩' : '⚙'

  return (
    <div className="flex justify-center my-0.5">
      <div
        className="w-full max-w-[50%] border border-dashed border-[var(--border)] rounded-md text-[var(--text-muted)] text-xs"
        style={{ opacity: 0.75 }}
      >
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 w-full px-3 py-1 hover:opacity-100 transition-opacity text-left"
        >
          <span className={`font-semibold shrink-0 ${labelColor}`}>
            {icon} {message.systemLabel ?? 'System'}
          </span>
          {!expanded && (
            <span className="truncate opacity-50">{preview}</span>
          )}
          <svg
            className={`ml-auto shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
            width="10" height="10" viewBox="0 0 10 10"
            fill="none" stroke="currentColor" strokeWidth="1.8"
          >
            <polyline points="2,3 5,7 8,3" />
          </svg>
        </button>

        {expanded && (
          <pre className="px-3 pb-2 pt-0 text-[11px] whitespace-pre-wrap break-words opacity-80 border-t border-dashed border-[var(--border)]">
            {rawText}
          </pre>
        )}
      </div>
    </div>
  )
}

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

  // Compare natural scrollHeight against the collapse threshold.
  // Using scrollHeight > collapseHeight (rather than > clientHeight) works in
  // both collapsed and expanded states, since scrollHeight always reflects the
  // full content height regardless of the maxHeight CSS constraint.
  useEffect(() => {
    if (contentRef.current) {
      setOverflows(contentRef.current.scrollHeight > collapseHeight)
    }
  }, [collapseHeight])

  // Check if this is a tool_result message (user record carrying tool results)
  const isToolResult = !isUser ? false : message.content.some(b => b.type === 'tool_result')
  if (isToolResult) return null // Tool results are rendered inline with their tool_use

  // System-injected or auto-continuation messages → compact collapsible bar
  if (isUser && (message.category === 'system' || message.category === 'continuation')) {
    return <SystemMessageBar message={message} />
  }

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

const ALLOWED_IMAGE_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
])
const BASE64_RE = /^[A-Za-z0-9+/]+=*$/

function buildImageSrc(block: { source: { type: string; media_type?: string; data?: string; url?: string } }): string | null {
  if (block.source.type === 'base64') {
    const mt = block.source.media_type || 'image/png'
    const data = block.source.data || ''
    if (!ALLOWED_IMAGE_TYPES.has(mt)) return null
    if (!BASE64_RE.test(data)) return null
    return `data:${mt};base64,${data}`
  }
  if (block.source.type === 'url') {
    const url = block.source.url || ''
    if (!/^https?:\/\//i.test(url)) return null
    return url
  }
  return null
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
      const src = buildImageSrc(block)
      return src
        ? <img src={src} alt="Image content" className="max-w-full rounded-md my-2 max-h-[400px] object-contain" />
        : null
    }
    default:
      return null
  }
}
