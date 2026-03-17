import { useEffect, useRef } from 'react'
import hljs from 'highlight.js'

interface Props {
  code: string
  language?: string
  maxHeight?: string
}

export function CodeBlock({ code, language, maxHeight = '300px' }: Props) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!codeRef.current) return
    // Reset to avoid re-highlighting already-highlighted content
    codeRef.current.removeAttribute('data-highlighted')
    codeRef.current.textContent = code
    if (language) {
      try {
        const result = hljs.highlight(code, { language, ignoreIllegals: true })
        codeRef.current.innerHTML = result.value
        codeRef.current.setAttribute('data-highlighted', 'yes')
        return
      } catch {
        // fall through to auto-detect
      }
    }
    // Auto-detect language (only if code is long enough to be meaningful)
    if (code.length > 20) {
      hljs.highlightElement(codeRef.current)
    }
  }, [code, language])

  return (
    <pre
      className="text-[13px] leading-relaxed overflow-auto bg-[var(--bg-tertiary)] rounded-md p-3"
      style={{ maxHeight }}
    >
      <code ref={codeRef} className={language ? `language-${language}` : ''}>
        {code}
      </code>
    </pre>
  )
}
