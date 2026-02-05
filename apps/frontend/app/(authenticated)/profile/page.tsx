'use client'

import { ProfileCard } from '@/components/profile/profile-card'
import { TerminalFrame } from '@/components/ui/terminal-frame'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <TerminalFrame
            title="PROFILE.usr"
            pid="060"
            status="AUTH: VERIFIED"
            statusLabel="ACTIVE"
            borderStyle="mixed"
          >
            <div className="px-4 py-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#00FF41]/50">&gt;</span>
                <h1 className="text-2xl font-bold text-[#00FF41]">Player Profile</h1>
              </div>
              <div className="ml-5 border-l border-dashed border-[#00FF41]/20 pl-4">
                <p className="text-sm text-[#00AA2A]">
                  Manage your wallet and view your on-chain balances
                </p>
              </div>
            </div>
          </TerminalFrame>
        </div>

        {/* Profile Card with Balance Display */}
        <ProfileCard />
      </div>
    </div>
  )
}
