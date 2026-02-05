'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WalletLogin } from '@/components/auth/wallet-login'
import { EmailLogin } from '@/components/auth/email-login'
import { Wallet, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [requires2FA, setRequires2FA] = useState(false)
  const [adminId, setAdminId] = useState<string | null>(null)

  const handleSuccess = () => {
    router.push('/')
    router.refresh()
  }

  const handleRequires2FA = (id: string) => {
    setAdminId(id)
    setRequires2FA(true)
    router.push(`/2fa/verify?adminId=${id}`)
  }

  if (requires2FA && adminId) {
    return null // Will redirect to 2FA page
  }

  return (
    <Card className="bg-[#0D1117] border-[#0D3B1E] overflow-hidden">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#111318] border-b border-[#0D3B1E]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF3333]" />
          <span className="w-3 h-3 rounded-full bg-[#FFB000]" />
          <span className="w-3 h-3 rounded-full bg-[#00FF41]" />
        </div>
        <span className="text-xs text-[#1A6B35] font-mono uppercase tracking-widest ml-2">
          _unOS // AUTH_TERMINAL
        </span>
      </div>

      <CardHeader className="text-center pt-8">
        <h2
          className="text-xl font-bold text-[#00FF41] uppercase tracking-widest"
          style={{ textShadow: '0 0 5px #00FF41, 0 0 10px rgba(0,255,65,0.3)' }}
        >
          Authentication Required
        </h2>
        <p className="text-[#00AA2A] text-sm mt-2">Sign in to access the admin dashboard</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#111318]">
            <TabsTrigger
              value="wallet"
              className="data-[state=active]:bg-[#00FF41] data-[state=active]:text-black"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="data-[state=active]:bg-[#00FF41] data-[state=active]:text-black"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-6">
            <WalletLogin onSuccess={handleSuccess} onRequires2FA={handleRequires2FA} />
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <EmailLogin onSuccess={handleSuccess} onRequires2FA={handleRequires2FA} />
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#1A6B35] uppercase tracking-widest font-mono">
            [Secured by _unOS Protocol]
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
