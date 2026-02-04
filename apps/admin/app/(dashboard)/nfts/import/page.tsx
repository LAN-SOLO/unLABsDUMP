'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ArrowLeft, Upload, FileJson, FileText, Check } from 'lucide-react'

interface ImportResult {
  success: boolean
  message: string
  nfts?: Array<{ id: string; name: string }>
}

export default function ImportNFTsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [jsonInput, setJsonInput] = useState('')
  const [csvInput, setCsvInput] = useState('')

  const parseCSV = (csv: string): Array<Record<string, string>> => {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const items: Array<Record<string, string>> = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
      const item: Record<string, string> = {}
      headers.forEach((header, index) => {
        if (values[index]) {
          item[header] = values[index]
        }
      })
      if (item.name) {
        items.push(item)
      }
    }

    return items
  }

  const handleImportJSON = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const items = JSON.parse(jsonInput)

      if (!Array.isArray(items)) {
        throw new Error('JSON must be an array of NFT objects')
      }

      const res = await fetch('/api/nfts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data)
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format')
      } else {
        setError(err instanceof Error ? err.message : 'Import failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportCSV = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const items = parseCSV(csvInput)

      if (items.length === 0) {
        throw new Error('No valid items found in CSV')
      }

      const res = await fetch('/api/nfts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'json' | 'csv') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (type === 'json') {
        setJsonInput(content)
      } else {
        setCsvInput(content)
      }
    }
    reader.readAsText(file)
  }

  if (result?.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/nfts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Import Complete</h1>
            <p className="text-slate-400 mt-1">{result.message}</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-8">
              <div className="h-16 w-16 rounded-full bg-green-600/20 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-white text-lg font-medium mb-2">
                Successfully imported {result.nfts?.length || 0} NFTs
              </p>
              <div className="flex gap-3 mt-4">
                <Button asChild variant="outline">
                  <Link href="/nfts">View All NFTs</Link>
                </Button>
                <Button
                  onClick={() => {
                    setResult(null)
                    setJsonInput('')
                    setCsvInput('')
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Import More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/nfts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Import NFTs</h1>
          <p className="text-slate-400 mt-1">Bulk import NFTs from JSON or CSV</p>
        </div>
      </div>

      <Tabs defaultValue="json" className="w-full">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="json" className="data-[state=active]:bg-purple-600">
            <FileJson className="mr-2 h-4 w-4" />
            JSON
          </TabsTrigger>
          <TabsTrigger value="csv" className="data-[state=active]:bg-purple-600">
            <FileText className="mr-2 h-4 w-4" />
            CSV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json" className="mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Import from JSON</CardTitle>
              <CardDescription className="text-slate-400">
                Paste JSON array or upload a .json file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">JSON Data</p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => handleFileUpload(e, 'json')}
                      className="hidden"
                    />
                    <span className="text-sm text-purple-400 hover:text-purple-300">
                      Upload file
                    </span>
                  </label>
                </div>
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`[
  {
    "name": "NFT Name",
    "description": "Description",
    "image_url": "https://...",
    "rarity": "rare",
    "collection": "Collection Name",
    "status": "draft"
  }
]`}
                  className="bg-slate-800 border-slate-700 min-h-[300px] font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleImportJSON}
                disabled={isLoading || !jsonInput.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import JSON
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Import from CSV</CardTitle>
              <CardDescription className="text-slate-400">
                Paste CSV data or upload a .csv file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">CSV Data</p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'csv')}
                      className="hidden"
                    />
                    <span className="text-sm text-purple-400 hover:text-purple-300">
                      Upload file
                    </span>
                  </label>
                </div>
                <Textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder={`name,description,image_url,rarity,collection,status
"NFT Name","Description","https://...",rare,"Collection Name",draft`}
                  className="bg-slate-800 border-slate-700 min-h-[300px] font-mono text-sm"
                />
              </div>

              <Alert className="border-slate-700 bg-slate-800/50">
                <AlertDescription className="text-slate-300 text-sm">
                  Required columns: <code className="text-purple-400">name</code>
                  <br />
                  Optional columns: <code className="text-purple-400">description</code>,{' '}
                  <code className="text-purple-400">image_url</code>,{' '}
                  <code className="text-purple-400">rarity</code>,{' '}
                  <code className="text-purple-400">collection</code>,{' '}
                  <code className="text-purple-400">status</code>
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleImportCSV}
                disabled={isLoading || !csvInput.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
