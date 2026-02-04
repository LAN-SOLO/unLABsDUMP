'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, X, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'unsc_search_history'
const MAX_HISTORY = 10

interface HistoryEntry {
  query: string
  timestamp: string
}

interface SearchHistoryProps {
  onSelect: (query: string) => void
  className?: string
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage full or unavailable
  }
}

/** Call this from your search handler to record a search. */
export function addToSearchHistory(query: string) {
  if (!query || query.trim().length === 0) return
  const trimmed = query.trim()
  const current = loadHistory()
  const filtered = current.filter((e) => e.query !== trimmed)
  const next: HistoryEntry[] = [
    { query: trimmed, timestamp: new Date().toISOString() },
    ...filtered,
  ].slice(0, MAX_HISTORY)
  persistHistory(next)
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SearchHistory({ onSelect, className }: SearchHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    persistHistory([])
  }, [])

  const removeEntry = useCallback((query: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.query !== query)
      persistHistory(next)
      return next
    })
  }, [])

  if (history.length === 0) return null

  return (
    <div className={cn('rounded-lg border border-slate-800 bg-slate-900 p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-200">Recent Searches</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="h-7 text-xs text-slate-500 hover:text-red-400 hover:bg-slate-800"
        >
          <Trash2 className="size-3 mr-1" />
          Clear
        </Button>
      </div>

      <ul className="space-y-1">
        {history.map((entry) => (
          <li
            key={entry.query}
            className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-800 transition-colors"
          >
            <Search className="size-3.5 text-slate-500 shrink-0" />
            <button
              onClick={() => onSelect(entry.query)}
              className="flex-1 text-left text-sm text-slate-300 truncate hover:text-white transition-colors"
            >
              {entry.query}
            </button>
            <span className="text-[10px] text-slate-600 shrink-0">
              {formatRelativeTime(entry.timestamp)}
            </span>
            <button
              onClick={() => removeEntry(entry.query)}
              className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 rounded text-slate-500 hover:text-red-400 transition-all"
              aria-label={`Remove search: ${entry.query}`}
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
