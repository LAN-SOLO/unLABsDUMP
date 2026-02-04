'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = 'typescript', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className={cn('group relative rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-slate-700 bg-slate-800/50 px-4 py-2">
        <span className="text-xs font-medium text-slate-400">{language}</span>
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors',
            copied ? 'text-green-400' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
          )}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto rounded-b-lg border border-slate-700 bg-slate-950 p-4">
        <pre className="text-sm leading-relaxed">
          <code className="font-mono text-slate-200">{code}</code>
        </pre>
      </div>
    </div>
  )
}
