import { Collapsible } from '../common/Collapsible'

interface Props {
  thinking: string
}

export function ThinkingBlock({ thinking }: Props) {
  return (
    <Collapsible
      title="Thinking"
      className="my-1"
      titleClassName="text-[var(--text-muted)] text-xs"
    >
      <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-md p-3 whitespace-pre-wrap max-h-[300px] overflow-auto">
        {thinking}
      </div>
    </Collapsible>
  )
}
