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
      <DialogContent className="border-slate-700 bg-slate-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            Contact Seller
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Send a message to the seller about {listing.nftName}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 rounded-full bg-green-900/30 p-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm font-medium text-white">Message Sent</p>
            <p className="mt-1 text-xs text-slate-400">The seller has been notified</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Seller address */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Seller Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-slate-800 px-3 py-2 font-mono text-xs text-slate-300">
                  {listing.sellerAddress}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                  className="shrink-0 border-slate-700 text-slate-400 hover:text-white"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Message textarea */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write your message..."
                className="w-full resize-none rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-purple-500/20"
              />
              <p className="text-[10px] text-slate-600">{message.length}/500 characters</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {sent ? (
            <Button
              onClick={() => handleOpenChange(false)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !message.trim()}
                className="bg-purple-600 hover:bg-purple-700"
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
