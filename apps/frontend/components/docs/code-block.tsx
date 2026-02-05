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
    <div className={cn('group relative rounded-sm', className)}>
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-sm border border-b-0 border-[#1A3A2A] bg-[#0D3B1E]/20 px-4 py-2">
        <span className="text-xs font-medium text-[#00AA2A]">{language}</span>
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors',
            copied ? 'text-[#00FF41]' : 'text-[#00AA2A] hover:bg-[#1A3A2A] hover:text-[#00FF41]'
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
      <div className="overflow-x-auto rounded-b-sm border border-[#1A3A2A] bg-black p-4">
        <pre className="text-sm leading-relaxed">
          <code className="font-mono text-[#00FF41]">{code}</code>
        </pre>
      </div>
    </div>
  )
}
