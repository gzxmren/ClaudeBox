import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useSessionStore } from '../../store/useSessionStore'

interface Props {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: Props) {
  const fontSize = useSessionStore(s => s.messageFontSize)
  return (
    <div
      className={`prose-sm markdown-body text-[var(--text-primary)] ${className}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Inline code — no syntax highlighting, just monospace
          code({ className: cls, children, ...props }) {
            const isBlock = cls?.startsWith('language-')
            if (isBlock) {
              // Block code rendered by rehype-highlight — pass through
              return <code className={cls} {...props}>{children}</code>
            }
            return (
              <code
                className="px-1 py-0.5 rounded text-[0.85em] bg-[var(--bg-tertiary)] font-mono"
                {...props}
              >
                {children}
              </code>
            )
          },
          // Pre wrapper — use app's existing style
          pre({ children }) {
            return (
              <pre className="text-[13px] leading-relaxed overflow-auto bg-[var(--bg-tertiary)] rounded-md p-3 my-2 max-h-[400px]">
                {children}
              </pre>
            )
          },
          // Paragraphs
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          },
          // Headings — slightly larger than body text via em
          h1({ children }) { return <h1 className="text-[1.2em] font-bold mt-3 mb-1">{children}</h1> },
          h2({ children }) { return <h2 className="text-[1.1em] font-bold mt-3 mb-1">{children}</h2> },
          h3({ children }) { return <h3 className="text-[1.05em] font-semibold mt-2 mb-1">{children}</h3> },
          // Lists
          ul({ children }) { return <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul> },
          ol({ children }) { return <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol> },
          li({ children }) { return <li className="leading-relaxed">{children}</li> },
          // Blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-[var(--accent)] pl-3 my-2 text-[var(--text-secondary)] italic">
                {children}
              </blockquote>
            )
          },
          // Tables (GFM)
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="text-xs border-collapse w-full">{children}</table>
              </div>
            )
          },
          th({ children }) {
            return <th className="border border-[var(--border)] px-2 py-1 bg-[var(--bg-tertiary)] font-semibold text-left">{children}</th>
          },
          td({ children }) {
            return <td className="border border-[var(--border)] px-2 py-1">{children}</td>
          },
          // Horizontal rule
          hr() { return <hr className="border-[var(--border)] my-3" /> },
          // Strong / em
          strong({ children }) { return <strong className="font-semibold">{children}</strong> },
          em({ children }) { return <em className="italic">{children}</em> },
          // Links — open in new tab
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline hover:opacity-80"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
