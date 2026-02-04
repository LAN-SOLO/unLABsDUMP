'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-white">Welcome Back</CardTitle>
        <CardDescription className="text-slate-400">
          Sign in to access the admin dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger
              value="wallet"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
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
          <p className="text-xs text-slate-500">Protected by UnstableLabs Security</p>
        </div>
      </CardContent>
    </Card>
  )
}
