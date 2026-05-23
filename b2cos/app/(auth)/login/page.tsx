'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Credenciais inválidas. Verifique email e senha.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#6366F1] flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[22px] font-semibold text-[#FAFAFA]">B2C OS</h1>
          <p className="text-[13px] text-[#52525B] mt-1">Operating System para fundadores</p>
        </div>

        {/* Card */}
        <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6">
          <h2 className="text-[15px] font-semibold text-[#FAFAFA] mb-1">Entrar</h2>
          <p className="text-[12px] text-[#52525B] mb-6">Acesso exclusivo ao seu painel operacional</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[12px] text-[#A1A1AA]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] placeholder:text-[#52525B] h-9 text-[13px] focus:border-[#6366F1]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[12px] text-[#A1A1AA]">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] placeholder:text-[#52525B] h-9 text-[13px] focus:border-[#6366F1]"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] font-medium"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#52525B] mt-4">
          Sistema privado. Cadastro não disponível.
        </p>
      </div>
    </div>
  )
}
