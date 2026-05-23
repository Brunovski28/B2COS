import { Header } from '@/components/layout/header'
import Link from 'next/link'
import { Lightbulb, GitBranch, BarChart2 } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" breadcrumb="B2C OS" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-xl font-semibold text-[#FAFAFA] mb-2">Dashboard em construção</h2>
          <p className="text-[13px] text-[#52525B] mb-8">O painel principal está sendo desenvolvido na Fase 2. Por enquanto, acesse o Banco de Ideias.</p>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/ideas" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] transition-colors">
              <Lightbulb className="w-5 h-5 text-[#6366F1]" />
              <span className="text-[13px] font-medium text-[#A1A1AA]">Ideias</span>
            </Link>
            <Link href="/pipeline" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] transition-colors">
              <GitBranch className="w-5 h-5 text-[#10B981]" />
              <span className="text-[13px] font-medium text-[#A1A1AA]">Pipeline</span>
            </Link>
            <Link href="/metrics" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] transition-colors">
              <BarChart2 className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-[13px] font-medium text-[#A1A1AA]">Métricas</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
