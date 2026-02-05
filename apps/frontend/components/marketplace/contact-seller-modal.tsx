'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { MarketplaceListing } from './listing-card'
import { Send, Copy, CheckCircle, Loader2, MessageSquare } from 'lucide-react'

interface ContactSellerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: MarketplaceListing | null
}

export function ContactSellerModal({ open, onOpenChange, listing }: ContactSellerModalProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const defaultMessage = listing ? `Hi, I'm interested in your NFT ${listing.nftName}.` : ''

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMessage('')
      setIsSending(false)
      setSent(false)
      setCopied(false)
    } else if (listing) {
      setMessage(defaultMessage)
    }
    onOpenChange(nextOpen)
  }

  const handleSend = async () => {
    if (!listing || !message.trim()) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/trades/${listing.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSent(true)
    } catch {
      // Handle silently - toast would be shown by parent
    } finally {
      setIsSending(false)
    }
  }

  const handleCopyAddress = useCallback(async () => {
    if (!listing) return
    try {
      await navigator.clipboard.writeText(listing.sellerAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }, [listing])

  if (!listing) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#1A3A2A] bg-[#0D1117] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#00FF41]">
            <MessageSquare className="h-5 w-5 text-[#00FF41]" />
            Contact Seller
          </DialogTitle>
          <DialogDescription className="text-[#00AA2A]">
            Send a message to the seller about {listing.nftName}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 rounded-full bg-[#0D3B1E]/30 p-3">
              <CheckCircle className="h-8 w-8 text-[#00FF41]" />
            </div>
            <p className="text-sm font-medium text-[#00FF41]">Message Sent</p>
            <p className="mt-1 text-xs text-[#00AA2A]">The seller has been notified</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Seller address */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#00AA2A]">Seller Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-[#111318] px-3 py-2 font-mono text-xs text-[#00CC33]">
                  {listing.sellerAddress}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                  className="shrink-0 border-[#1A3A2A] text-[#00AA2A] hover:text-[#00FF41]"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-[#00FF41]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Message textarea */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#00AA2A]">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write your message..."
                className="w-full resize-none rounded-md border border-[#1A3A2A] bg-[#111318] px-3 py-2 text-sm text-[#00FF41] placeholder:text-[#1A6B35] focus-visible:border-[#00FF41] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00FF41]/20"
              />
              <p className="text-[10px] text-[#1A6B35]">{message.length}/500 characters</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {sent ? (
            <Button
              onClick={() => handleOpenChange(false)}
              className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="border-[#1A3A2A] text-[#00CC33]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !message.trim()}
                className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-1 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
