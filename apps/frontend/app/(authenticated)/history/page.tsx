'use client'

import { History } from 'lucide-react'
import { PurchaseList } from '@/components/history/purchase-list'

export default function PurchaseHistoryPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#0D3B1E]/20 flex items-center justify-center">
            <History className="size-5 text-[#00FF41]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#00FF41]">Purchase History</h1>
            <p className="text-[#00AA2A] text-sm">
              Track your purchases, delivery status, and transaction details.
            </p>
          </div>
        </div>

        {/* Purchase list with filters */}
        <PurchaseList />
      </div>
    </div>
  )
}
