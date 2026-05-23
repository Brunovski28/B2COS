'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, Download, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/ui.store'
import type { MetricEntry, Idea } from '@/types'

interface MetricsHistoryProps {
  metrics: MetricEntry[]
  ideas: Idea[]
  onDelete: (id: string) => void
}

const fmt = (v: number | null, suffix = '%') => v !== null ? `${v.toFixed(1)}${suffix}` : '—'
const fmtBRL = (v: number | null) => v !== null
  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
  : '—'

export function MetricsHistory({ metrics, ideas, onDelete }: MetricsHistoryProps) {
  const { openMetricForm } = useUIStore()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const ideaMap = new Map(ideas.map(i => [i.id, i.name]))

  async function handleDelete(id: string) {
    if (!confirm('Excluir este registro? Esta ação não pode ser desfeita.')) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('metrics').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir registro')
    } else {
      toast.success('Registro excluído')
      onDelete(id)
    }
    setDeletingId(null)
  }

  function exportCSV() {
    const headers = ['Data', 'Produto', 'D1%', 'D7%', 'D30%', 'MRR', 'CAC', 'Churn%', 'CTR%', 'Novos', 'Ativos', 'Notas']
    const rows = metrics.map(m => [
      m.date,
      m.idea_id ? (ideaMap.get(m.idea_id) ?? '') : '',
      m.d1_retention ?? '',
      m.d7_retention ?? '',
      m.d30_retention ?? '',
      m.mrr ?? '',
      m.cac ?? '',
      m.churn_rate ?? '',
      m.ctr ?? '',
      m.new_users ?? '',
      m.active_users ?? '',
      m.notes ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'metricas.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (metrics.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-[13px] text-[#52525B]">Nenhum registro ainda.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-[#A1A1AA]">{metrics.length} registro{metrics.length !== 1 ? 's' : ''}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={exportCSV}
          className="text-[12px] text-[#52525B] hover:text-[#FAFAFA] gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#27272A]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#111113]">
              <th className="text-left px-3 py-2.5 text-[#52525B] font-medium">Data</th>
              <th className="text-left px-3 py-2.5 text-[#52525B] font-medium">Produto</th>
              <th className="text-right px-3 py-2.5 text-[#6366F1] font-medium">D1</th>
              <th className="text-right px-3 py-2.5 text-[#10B981] font-medium">D7</th>
              <th className="text-right px-3 py-2.5 text-[#F59E0B] font-medium">D30</th>
              <th className="text-right px-3 py-2.5 text-[#22C55E] font-medium">MRR</th>
              <th className="text-right px-3 py-2.5 text-[#EF4444] font-medium">CAC</th>
              <th className="text-right px-3 py-2.5 text-[#EC4899] font-medium">Churn</th>
              <th className="px-3 py-2.5 text-[#52525B] font-medium">Notas</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.id} className="border-b border-[#27272A] hover:bg-[#111113] transition-colors">
                <td className="px-3 py-2.5 text-[#FAFAFA] whitespace-nowrap">
                  {format(parseISO(m.date), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="px-3 py-2.5 text-[#A1A1AA] whitespace-nowrap">
                  {m.idea_id ? (ideaMap.get(m.idea_id) ?? '—') : '—'}
                </td>
                <td className="px-3 py-2.5 text-right text-[#6366F1]">{fmt(m.d1_retention)}</td>
                <td className="px-3 py-2.5 text-right text-[#10B981]">{fmt(m.d7_retention)}</td>
                <td className="px-3 py-2.5 text-right text-[#F59E0B]">{fmt(m.d30_retention)}</td>
                <td className="px-3 py-2.5 text-right text-[#22C55E]">{fmtBRL(m.mrr)}</td>
                <td className="px-3 py-2.5 text-right text-[#EF4444]">{fmtBRL(m.cac)}</td>
                <td className="px-3 py-2.5 text-right text-[#EC4899]">{fmt(m.churn_rate)}</td>
                <td className="px-3 py-2.5 text-[#52525B] max-w-[160px] truncate">{m.notes ?? '—'}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => openMetricForm(m.id)}
                      className="p-1 rounded text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#27272A] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="p-1 rounded text-[#52525B] hover:text-[#EF4444] hover:bg-[#27272A] transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
