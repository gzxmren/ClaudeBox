interface Props {
  code: string
  language?: string
  maxHeight?: string
}

export function CodeBlock({ code, maxHeight = '300px' }: Props) {
  return (
    <pre
      className="text-[13px] leading-relaxed overflow-auto bg-[var(--bg-tertiary)] rounded-md p-3"
      style={{ maxHeight }}
    >
      <code>{code}</code>
    </pre>
  )
}
