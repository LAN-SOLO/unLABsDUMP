'use client'

import { ProfileCard } from '@/components/profile/profile-card'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Player Profile</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your wallet and view your on-chain balances
          </p>
        </div>

        {/* Profile Card with Balance Display */}
        <ProfileCard />
      </div>
    </div>
  )
}
