import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <p className="text-[72px] font-bold text-[#27272A] leading-none mb-6">404</p>
        <h1 className="text-[20px] font-semibold text-[#FAFAFA] mb-2">
          Essa página não existe no seu sistema
        </h1>
        <p className="text-[14px] text-[#52525B] mb-8 leading-relaxed">
          A rota que você acessou não foi encontrada. Pode ter sido removida ou você digitou o endereço errado.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] font-medium transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
