'use client'

import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

const MAX_CHARS = 500
const DEFAULT_TEMPLATE = "Hi, I'm interested in this NFT. Is it still available?"

interface MessageInputProps {
  value?: string
  onChange: (value: string) => void
  nftName?: string
  placeholder?: string
  className?: string
}

export function MessageInput({
  value,
  onChange,
  nftName,
  placeholder = 'Write your message to the seller...',
  className,
}: MessageInputProps) {
  const [message, setMessage] = useState(value || '')

  // Pre-fill with template when nftName changes
  useEffect(() => {
    if (nftName && !value) {
      const template = `Hi, I'm interested in your NFT "${nftName}". Is it still available?`
      setMessage(template)
      onChange(template)
    }
  }, [nftName])

  // Sync with external value
  useEffect(() => {
    if (value !== undefined && value !== message) {
      setMessage(value)
    }
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (newValue.length <= MAX_CHARS) {
        setMessage(newValue)
        onChange(newValue)
      }
    },
    [onChange]
  )

  const handleUseTemplate = useCallback(() => {
    const template = nftName
      ? `Hi, I'm interested in your NFT "${nftName}". Is it still available?`
      : DEFAULT_TEMPLATE
    setMessage(template)
    onChange(template)
  }, [nftName, onChange])

  const remaining = MAX_CHARS - message.length
  const isNearLimit = remaining <= 50

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[#00AA2A]">Message</label>
        {!message && (
          <button
            type="button"
            onClick={handleUseTemplate}
            className="text-[10px] text-[#00FF41] hover:text-[#00FF41] transition-colors"
          >
            Use template
          </button>
        )}
      </div>
      <textarea
        value={message}
        onChange={handleChange}
        rows={4}
        placeholder={placeholder}
        className="w-full resize-none rounded-md border border-[#1A3A2A] bg-[#111318] px-3 py-2 text-sm text-[#00FF41] placeholder:text-[#1A6B35] focus-visible:border-[#00FF41] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00FF41]/20"
      />
      <div className="flex items-center justify-end">
        <span className={cn('text-[10px]', isNearLimit ? 'text-[#FFB000]' : 'text-[#1A6B35]')}>
          {message.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  )
}
