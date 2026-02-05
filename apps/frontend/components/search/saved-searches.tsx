'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bookmark, X, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'unsc_saved_searches'
const MAX_SAVED = 10

interface SavedSearch {
  id: string
  query: string
  savedAt: string
}

interface SavedSearchesProps {
  currentQuery?: string
  onApply: (query: string) => void
  className?: string
}

function loadSavedSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistSavedSearches(searches: SavedSearch[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
  } catch {
    // Storage full or unavailable
  }
}

export function SavedSearches({ currentQuery, onApply, className }: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([])

  useEffect(() => {
    setSearches(loadSavedSearches())
  }, [])

  const saveCurrentSearch = useCallback(() => {
    if (!currentQuery || currentQuery.trim().length === 0) return

    const trimmed = currentQuery.trim()

    setSearches((prev) => {
      // Avoid duplicates
      const filtered = prev.filter((s) => s.query !== trimmed)
      const next: SavedSearch[] = [
        { id: crypto.randomUUID(), query: trimmed, savedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_SAVED)
      persistSavedSearches(next)
      return next
    })
  }, [currentQuery])

  const deleteSearch = useCallback((id: string) => {
    setSearches((prev) => {
      const next = prev.filter((s) => s.id !== id)
      persistSavedSearches(next)
      return next
    })
  }, [])

  const alreadySaved = searches.some((s) => s.query === currentQuery?.trim())

  return (
    <div className={cn('rounded-sm border border-[#0D3B1E] bg-[#0D1117] p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="size-4 text-[#00FF41]" />
          <h3 className="text-sm font-semibold text-[#00FF41]">Saved Searches</h3>
        </div>
        {currentQuery && currentQuery.trim().length > 0 && !alreadySaved && (
          <Button
            variant="ghost"
            size="sm"
            onClick={saveCurrentSearch}
            className="h-7 text-xs text-[#00FF41] hover:text-[#00FF41] hover:bg-[#0D3B1E]/20"
          >
            <Plus className="size-3 mr-1" />
            Save Current
          </Button>
        )}
      </div>

      {searches.length === 0 ? (
        <p className="text-xs text-[#1A6B35] py-2">No saved searches yet.</p>
      ) : (
        <ul className="space-y-1">
          {searches.map((search) => (
            <li
              key={search.id}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[#0D3B1E]/20 transition-colors"
            >
              <Search className="size-3.5 text-[#1A6B35] shrink-0" />
              <button
                onClick={() => onApply(search.query)}
                className="flex-1 text-left text-sm text-[#00CC33] truncate hover:text-[#00FF41] transition-colors"
              >
                {search.query}
              </button>
              <button
                onClick={() => deleteSearch(search.id)}
                className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 rounded text-[#1A6B35] hover:text-[#FF3333] transition-all"
                aria-label={`Delete saved search: ${search.query}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
