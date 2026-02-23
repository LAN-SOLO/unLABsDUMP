'use client'

/**
 * Dev Area Authentication Page
 *
 * Multi-step authentication flow for accessing the dev area.
 */

import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues with wallet adapter
const AuthFlow = dynamic(() => import('@/components/dev/auth-flow').then((m) => m.AuthFlow), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <p className="text-white">Loading...</p>
    </div>
  ),
})

export default function DevAuthPage() {
  return <AuthFlow />
}
