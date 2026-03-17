import type { SubagentData } from '../../types/session'
import { MessageThread } from '../conversation/MessageThread'

interface Props {
  subagent: SubagentData
}

export function SubagentThread({ subagent }: Props) {
  return (
    <div>
      <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/30">
        <span className="text-sm font-medium text-purple-400">
          🤖 {subagent.meta.agentType || 'Subagent'}
        </span>
        {subagent.meta.description && (
          <span className="ml-2 text-xs text-[var(--text-muted)]">
            {subagent.meta.description}
          </span>
        )}
      </div>
      <MessageThread messages={subagent.messages} />
    </div>
  )
}
