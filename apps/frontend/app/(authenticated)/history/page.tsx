'use client'

import { History } from 'lucide-react'
import { PurchaseList } from '@/components/history/purchase-list'
import { TerminalFrame } from '@/components/ui/terminal-frame'

export default function PurchaseHistoryPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page header */}
        <TerminalFrame
          title="HISTORY.log"
          pid="050"
          status="RECORDS: LOADED"
          statusLabel="INDEXED"
          borderStyle="single"
        >
          <div className="px-4 py-5">
            <div className="flex items-center gap-2 mb-2">
              <History className="size-5 text-[#00FF41]" />
              <h1 className="text-3xl font-bold text-[#00FF41]">Purchase History</h1>
            </div>
            <div className="ml-5 border-l border-dashed border-[#00FF41]/20 pl-4">
              <p className="text-sm text-[#00AA2A]">
                Track your purchases, delivery status, and transaction details.
              </p>
            </div>
          </div>
        </TerminalFrame>

        {/* Purchase list with filters */}
        <PurchaseList />
      </div>
    </div>
  )
}
