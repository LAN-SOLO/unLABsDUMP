'use client'

import { PackageCard, type PackageCardProps } from './package-card'
import { Skeleton } from '@/components/ui/skeleton'

interface PackageGridProps {
  packages: PackageCardProps[]
  featuredPackage?: PackageCardProps | null
  isLoading?: boolean
}

function PackageCardSkeleton() {
  return (
    <div className="rounded-sm border border-[#0D3B1E] bg-[#0D1117] overflow-hidden">
      <Skeleton className="h-40 w-full bg-[#111318]" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4 bg-[#111318]" />
        <Skeleton className="h-4 w-full bg-[#111318]" />
        <Skeleton className="h-4 w-2/3 bg-[#111318]" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-20 bg-[#111318]" />
          <Skeleton className="h-4 w-24 bg-[#111318]" />
        </div>
        <div className="pt-3 border-t border-[#0D3B1E] flex items-end justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-24 bg-[#111318]" />
            <Skeleton className="h-3 w-16 bg-[#111318]" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md bg-[#111318]" />
        </div>
      </div>
    </div>
  )
}

export function PackageGrid({ packages, featuredPackage, isLoading }: PackageGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Featured skeleton */}
        <div className="max-w-2xl mx-auto">
          <PackageCardSkeleton />
        </div>
        {/* Grid skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <PackageCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (packages.length === 0 && !featuredPackage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#111318] flex items-center justify-center mb-4">
          <svg
            className="size-8 text-[#1A6B35]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#00FF41] mb-1">No packages found</h3>
        <p className="text-[#00AA2A] text-sm max-w-md">
          Try adjusting your filters or check back later for new packages.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Featured package - larger card at top */}
      {featuredPackage && (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-[#00FF41] rounded-sm opacity-30 blur-sm" />
          <div className="relative max-w-2xl mx-auto">
            <PackageCard {...featuredPackage} />
          </div>
        </div>
      )}

      {/* Package grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} {...pkg} />
        ))}
      </div>
    </div>
  )
}
