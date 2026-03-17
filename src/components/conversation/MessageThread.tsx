import type { MergedMessage, ContentBlock } from '../../types/session'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: MergedMessage[]
  onSubagentClick?: (agentId: string) => void
}

export function MessageThread({ messages, onSubagentClick }: Props) {
  // Build tool_use_id -> result mapping
  const toolResults = new Map<string, { content: string | ContentBlock[]; is_error?: boolean }>()

  for (const msg of messages) {
    if (msg.role === 'user') {
      for (const block of msg.content) {
        if (block.type === 'tool_result') {
          toolResults.set(block.tool_use_id, {
            content: block.content,
            is_error: block.is_error,
          })
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          toolResults={toolResults}
          onSubagentClick={onSubagentClick}
        />
      ))}
    </div>
  )
}
