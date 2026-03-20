import { useEffect, useRef } from 'react'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

// highlight.js outputs spans with class names only — allow only span tags
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['span'],
  ALLOWED_ATTR: ['class'],
}

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
        const result = hljs.highlight(code, { language, ignoreIllegals: false })
        codeRef.current.innerHTML = DOMPurify.sanitize(result.value, PURIFY_CONFIG) as unknown as string
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
