'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Loader2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Upload,
  Download,
  CheckSquare,
} from 'lucide-react'

interface NFT {
  id: string
  name: string
  description: string | null
  image_url: string | null
  rarity: string | null
  collection: string | null
  status: string
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const rarityColors: Record<string, string> = {
  common: 'bg-[#1A6B35]',
  uncommon: 'bg-[#00FF41]',
  rare: 'bg-[#00FFFF]',
  epic: 'bg-[#00FF41]',
  legendary: 'bg-[#FFB000]',
}

const statusColors: Record<string, string> = {
  draft: 'bg-[#1A6B35]',
  active: 'bg-[#00FF41]',
  burned: 'bg-[#FF3333]',
  transferred: 'bg-[#00FFFF]',
}

export default function NFTsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [nfts, setNfts] = useState<NFT[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [rarityFilter, setRarityFilter] = useState(searchParams.get('rarity') || 'all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  const fetchNFTs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (rarityFilter && rarityFilter !== 'all') params.set('rarity', rarityFilter)

      const res = await fetch(`/api/nfts?${params}`)
      const data = await res.json()

      if (res.ok) {
        setNfts(data.nfts)
        setPagination(data.pagination)
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter, rarityFilter])

  useEffect(() => {
    fetchNFTs()
  }, [fetchNFTs])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchNFTs()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this NFT?')) return

    try {
      const res = await fetch(`/api/nfts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchNFTs()
      }
    } catch {
      // Handle error
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === nfts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(nfts.map((nft) => nft.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleBulkAction = async (action: 'delete' | 'update_status', status?: string) => {
    if (selectedIds.length === 0) return

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete ${selectedIds.length} NFT(s)?`
        : `Update ${selectedIds.length} NFT(s) to ${status}?`

    if (!confirm(confirmMessage)) return

    setIsBulkLoading(true)
    try {
      const res = await fetch('/api/nfts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action,
          ...(status && { status }),
        }),
      })

      if (res.ok) {
        setSelectedIds([])
        fetchNFTs()
      }
    } catch {
      // Handle error
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleExport = (format: 'json' | 'csv') => {
    const params = new URLSearchParams()
    params.set('format', format)
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
    if (rarityFilter && rarityFilter !== 'all') params.set('rarity', rarityFilter)

    window.open(`/api/nfts/export?${params}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00FF41]">NFTs</h1>
          <p className="text-[#00AA2A] mt-1">Manage your NFT collection</p>
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="outline">
            <Link href="/nfts/import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button asChild className="bg-[#00FF41] text-black hover:bg-[#00CC33]">
            <Link href="/nfts/new">
              <Plus className="mr-2 h-4 w-4" />
              Create NFT
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#0D1117] border-[#0D3B1E]">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00AA2A]" />
                <Input
                  placeholder="Search NFTs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#111318] border-[#1A3A2A]"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-[#111318] border-[#1A3A2A]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="burned">Burned</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>

            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="w-[150px] bg-[#111318] border-[#1A3A2A]">
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarity</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="bg-[#0D3B1E]/30 border-[#00FF41]/50">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#00FF41]" />
              <span className="text-[#00FF41]">{selectedIds.length} selected</span>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isBulkLoading}>
                    Change Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('update_status', 'draft')}>
                    Set to Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('update_status', 'active')}>
                    Set to Active
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={isBulkLoading}
              >
                {isBulkLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Selected
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="bg-[#0D1117] border-[#0D3B1E]">
        <CardHeader>
          <CardTitle className="text-[#00FF41]">
            {pagination.total} NFT{pagination.total !== 1 ? 's' : ''} found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
            </div>
          ) : nfts.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-[#1A6B35]" />
              <p className="mt-4 text-[#00AA2A]">No NFTs found</p>
              <Button asChild className="mt-4 bg-[#00FF41] text-black hover:bg-[#00CC33]">
                <Link href="/nfts/new">Create your first NFT</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#0D3B1E]">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === nfts.length && nfts.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-[#00AA2A]">NFT</TableHead>
                    <TableHead className="text-[#00AA2A]">Rarity</TableHead>
                    <TableHead className="text-[#00AA2A]">Collection</TableHead>
                    <TableHead className="text-[#00AA2A]">Status</TableHead>
                    <TableHead className="text-[#00AA2A]">Created</TableHead>
                    <TableHead className="text-[#00AA2A] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nfts.map((nft) => (
                    <TableRow key={nft.id} className="border-[#0D3B1E]">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(nft.id)}
                          onCheckedChange={() => toggleSelect(nft.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-sm bg-[#111318] flex items-center justify-center overflow-hidden">
                            {nft.image_url ? (
                              <img
                                src={nft.image_url}
                                alt={nft.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-[#1A6B35]" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#00FF41]">{nft.name}</p>
                            {nft.description && (
                              <p className="text-sm text-[#00AA2A] truncate max-w-[200px]">
                                {nft.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {nft.rarity && (
                          <Badge
                            className={`${rarityColors[nft.rarity]} text-[#00FF41] capitalize`}
                          >
                            {nft.rarity}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-[#00CC33]">{nft.collection || '-'}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[nft.status]} text-[#00FF41] capitalize`}>
                          {nft.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#00CC33]">
                        {new Date(nft.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/nfts/${nft.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/nfts/${nft.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(nft.id)}
                              className="text-[#FF3333]"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#0D3B1E]">
                  <p className="text-sm text-[#00AA2A]">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
