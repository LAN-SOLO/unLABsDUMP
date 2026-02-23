'use client'

/**
 * Database Inspector Page
 *
 * Browse all tables (read-only) and run SELECT queries.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Database, Play, AlertTriangle, Download, Loader2 } from 'lucide-react'

// Known tables in the schema
const TABLES = [
  'admins',
  'players',
  'nfts',
  'nft_ownership_history',
  'packages',
  'purchases',
  'deliveries',
  'burn_events',
  'trades',
  'notifications',
  'audit_logs',
  'admin_sessions',
  'mint_pool_rounds',
  'mint_pool_participants',
  'mint_pool_slices',
  'mint_pool_hash_submissions',
  'mint_pool_stakes',
  'mint_pool_assemblies',
  'dev_access_logs',
]

export default function DatabasePage() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const executeQuery = useCallback(async (sql: string) => {
    // Security check: only allow SELECT queries
    const trimmed = sql.trim().toLowerCase()
    if (!trimmed.startsWith('select')) {
      setError('Only SELECT queries are allowed')
      return
    }

    // Check for dangerous patterns
    if (
      trimmed.includes('drop') ||
      trimmed.includes('delete') ||
      trimmed.includes('update') ||
      trimmed.includes('insert') ||
      trimmed.includes('alter') ||
      trimmed.includes('truncate')
    ) {
      setError('Query contains forbidden operations')
      return
    }

    setIsLoading(true)
    setError(null)

    // Note: In a real implementation, this would call a secure API endpoint
    // that validates and executes the query with read-only permissions.
    // For this demo, we'll show a placeholder.
    try {
      // Simulate query execution
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Placeholder results
      setResults([
        {
          message: 'Database query execution requires server-side implementation',
          note: 'Add a secure /api/dev/query endpoint that:',
          steps: [
            '1. Validates query is read-only',
            '2. Uses a read-only database connection',
            '3. Limits result size',
            '4. Logs all queries for audit',
          ],
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadTable = useCallback(
    (table: string) => {
      setSelectedTable(table)
      setQuery(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 100`)
      executeQuery(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 100`)
    },
    [executeQuery]
  )

  const exportResults = useCallback(() => {
    if (!results) return

    const json = JSON.stringify(results, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [results])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Database Inspector</h1>
        <p className="text-zinc-400">Browse tables and run read-only queries</p>
      </div>

      {/* Warning */}
      <Alert className="border-yellow-900/50 bg-yellow-950/20">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-200">
          Read-only access. Only SELECT queries are permitted.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Table list */}
        <Card className="border-zinc-800 bg-zinc-900 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Database className="h-4 w-4 text-purple-500" />
              <span>Tables</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {TABLES.map((table) => (
                <li key={table}>
                  <button
                    onClick={() => loadTable(table)}
                    className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
                      selectedTable === table
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {table}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Query panel */}
        <div className="space-y-4 lg:col-span-3">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Query Editor</CardTitle>
              <CardDescription className="text-zinc-400">
                Write and execute SELECT queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM table_name LIMIT 100"
                className="h-32 border-zinc-800 bg-zinc-950 font-mono text-sm text-white"
              />

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => executeQuery(query)}
                  disabled={isLoading || !query.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Query
                    </>
                  )}
                </Button>

                {results && results.length > 0 && (
                  <Button
                    onClick={exportResults}
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export JSON
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error display */}
          {error && (
            <Alert variant="destructive" className="border-red-900 bg-red-950/50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results table */}
          {results && results.length > 0 && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-white">Results ({results.length} rows)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800">
                        {Object.keys(results[0]).map((key) => (
                          <TableHead key={key} className="text-zinc-400">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((row, i) => (
                        <TableRow key={i} className="border-zinc-800">
                          {Object.values(row).map((value, j) => (
                            <TableCell key={j} className="text-zinc-300">
                              <div className="max-w-xs truncate">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
