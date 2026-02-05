'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Package as PackageIcon,
  Star,
} from 'lucide-react'

interface Package {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  is_active: boolean
  is_featured: boolean
  max_supply: number | null
  sold_count: number
  created_at: string
  package_nfts: Array<{ id: string; name: string; image_url: string | null }>
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function PackagesPage() {
  const router = useRouter()

  const [packages, setPackages] = useState<Package[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [featuredFilter, setFeaturedFilter] = useState('all')

  const fetchPackages = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.set('is_active', statusFilter)
      if (featuredFilter && featuredFilter !== 'all') params.set('is_featured', featuredFilter)

      const res = await fetch(`/api/packages?${params}`)
      const data = await res.json()

      if (res.ok) {
        setPackages(data.packages)
        setPagination(data.pagination)
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter, featuredFilter])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchPackages()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return

    try {
      const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchPackages()
      }
    } catch {
      // Handle error
    }
  }

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'SOL') return `${price} SOL`
    if (currency === 'USDC') return `$${price}`
    return `${price} ${currency}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00FF41]">Packages</h1>
          <p className="text-[#00AA2A] mt-1">Manage NFT packages and bundles</p>
        </div>
        <Button asChild className="bg-[#00FF41] text-black hover:bg-[#00CC33]">
          <Link href="/packages/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Package
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#0D1117] border-[#0D3B1E]">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00AA2A]" />
                <Input
                  placeholder="Search packages..."
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
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-[150px] bg-[#111318] border-[#1A3A2A]">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Not Featured</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-[#0D1117] border-[#0D3B1E]">
        <CardHeader>
          <CardTitle className="text-[#00FF41]">
            {pagination.total} Package{pagination.total !== 1 ? 's' : ''} found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <PackageIcon className="mx-auto h-12 w-12 text-[#1A6B35]" />
              <p className="mt-4 text-[#00AA2A]">No packages found</p>
              <Button asChild className="mt-4 bg-[#00FF41] text-black hover:bg-[#00CC33]">
                <Link href="/packages/new">Create your first package</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#0D3B1E]">
                    <TableHead className="text-[#00AA2A]">Package</TableHead>
                    <TableHead className="text-[#00AA2A]">Price</TableHead>
                    <TableHead className="text-[#00AA2A]">NFTs</TableHead>
                    <TableHead className="text-[#00AA2A]">Sales</TableHead>
                    <TableHead className="text-[#00AA2A]">Status</TableHead>
                    <TableHead className="text-[#00AA2A] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id} className="border-[#0D3B1E]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-sm bg-[#00FF41] flex items-center justify-center">
                            <PackageIcon className="h-5 w-5 text-[#00FF41]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[#00FF41]">{pkg.name}</p>
                              {pkg.is_featured && (
                                <Star className="h-4 w-4 text-[#FFB000] fill-[#FFB000]" />
                              )}
                            </div>
                            {pkg.description && (
                              <p className="text-sm text-[#00AA2A] truncate max-w-[200px]">
                                {pkg.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#00FF41] font-medium">
                        {formatPrice(pkg.price, pkg.currency)}
                      </TableCell>
                      <TableCell className="text-[#00CC33]">
                        {pkg.package_nfts?.length || 0} NFT
                        {(pkg.package_nfts?.length || 0) !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="text-[#00CC33]">
                        {pkg.sold_count || 0}
                        {pkg.max_supply && ` / ${pkg.max_supply}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            pkg.is_active
                              ? 'bg-[#00FF41] text-[#00FF41]'
                              : 'bg-[#1A6B35] text-[#00FF41]'
                          }
                        >
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/packages/${pkg.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/packages/${pkg.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(pkg.id)}
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
