'use client'

import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUIStore } from '@/store/ui.store'
import { KpiCard } from './kpi-card'
import { RetentionChart } from './retention-chart'
import { MrrChart } from './mrr-chart'
import { CacLtvChart } from './cac-ltv-chart'
import { ChurnCtrChart } from './churn-ctr-chart'
import { MetricForm } from './metric-form'
import { MetricsHistory } from './metrics-history'
import type { MetricEntry, Idea } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface MetricsClientProps {
  initialMetrics: MetricEntry[]
  ideas: Idea[]
}

function getKpiBorderColor(value: number | null, good: number, medium: number): 'green' | 'yellow' | 'red' | 'neutral' {
  if (value === null) return 'neutral'
  if (value >= good) return 'green'
  if (value >= medium) return 'yellow'
  return 'red'
}

function calcTrend(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null
  return current - previous
}

export function MetricsClient({ initialMetrics, ideas }: MetricsClientProps) {
  const [metrics, setMetrics] = useState<MetricEntry[]>(initialMetrics)
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('all')
  const { openMetricForm } = useUIStore()

  const filtered = selectedIdeaId === 'all'
    ? metrics
    : metrics.filter(m => m.idea_id === selectedIdeaId)

  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]

  const d1 = latest?.d1_retention ?? null
  const d7 = latest?.d7_retention ?? null
  const d30 = latest?.d30_retention ?? null
  const mrr = latest?.mrr ?? null

  const mrrFormatted = mrr !== null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(mrr)
    : '—'

  const mrrTrend = mrr !== null && prev?.mrr !== null && prev?.mrr !== undefined && prev.mrr > 0
    ? ((mrr - prev.mrr) / prev.mrr) * 100
    : null

  const refreshMetrics = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('metrics')
      .select('*')
      .order('date', { ascending: false })
    if (data) setMetrics(data as MetricEntry[])
  }, [])

  function handleDelete(id: string) {
    setMetrics(prev => prev.filter(m => m.id !== id))
  }

  const historyData = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#27272A] shrink-0">
        <Select value={selectedIdeaId} onValueChange={(v) => setSelectedIdeaId(v ?? 'all')}>
          <SelectTrigger className="w-[220px] bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]">
            <SelectValue placeholder="Todos os produtos" />
          </SelectTrigger>
          <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
            <SelectItem value="all">Todos os produtos</SelectItem>
            {ideas.map(idea => (
              <SelectItem key={idea.id} value={idea.id}>{idea.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          onClick={() => openMetricForm()}
          size="sm"
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar Dados
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="D1 Retenção"
            value={d1 !== null ? `${d1.toFixed(1)}%` : '—'}
            benchmark="Bom: >35% | Médio: 25–35%"
            trend={calcTrend(d1, prev?.d1_retention ?? null)}
            borderColor={getKpiBorderColor(d1, 35, 25)}
          />
          <KpiCard
            label="D7 Retenção"
            value={d7 !== null ? `${d7.toFixed(1)}%` : '—'}
            benchmark="Bom: >20% | Médio: 10–20%"
            trend={calcTrend(d7, prev?.d7_retention ?? null)}
            borderColor={getKpiBorderColor(d7, 20, 10)}
          />
          <KpiCard
            label="D30 Retenção"
            value={d30 !== null ? `${d30.toFixed(1)}%` : '—'}
            benchmark="Bom: >10% | Médio: 5–10%"
            trend={calcTrend(d30, prev?.d30_retention ?? null)}
            borderColor={getKpiBorderColor(d30, 10, 5)}
          />
          <KpiCard
            label="MRR"
            value={mrrFormatted}
            benchmark="crescimento MoM %"
            trend={mrrTrend}
            borderColor={mrr !== null && mrr > 0 ? 'green' : 'neutral'}
          />
        </div>

        {/* Full-width retention chart */}
        <div className="rounded-xl border border-[#27272A] bg-[#111113] p-4">
          <p className="text-[13px] font-semibold text-[#A1A1AA] mb-4">Curva de Retenção</p>
          <RetentionChart data={sorted} />
        </div>

        {/* Two side-by-side charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#27272A] bg-[#111113] p-4">
            <p className="text-[13px] font-semibold text-[#A1A1AA] mb-4">Evolução do MRR</p>
            <MrrChart data={sorted} />
          </div>
          <div className="rounded-xl border border-[#27272A] bg-[#111113] p-4">
            <p className="text-[13px] font-semibold text-[#A1A1AA] mb-4">CAC vs LTV</p>
            <CacLtvChart data={sorted} />
          </div>
        </div>

        {/* Full-width churn + CTR */}
        <div className="rounded-xl border border-[#27272A] bg-[#111113] p-4">
          <p className="text-[13px] font-semibold text-[#A1A1AA] mb-4">Churn + CTR</p>
          <ChurnCtrChart data={sorted} />
        </div>

        {/* History table */}
        <div className="rounded-xl border border-[#27272A] bg-[#111113] p-4">
          <p className="text-[13px] font-semibold text-[#A1A1AA] mb-4">Histórico de Registros</p>
          <MetricsHistory
            metrics={historyData}
            ideas={ideas}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <MetricForm
        ideas={ideas}
        selectedIdeaId={selectedIdeaId !== 'all' ? selectedIdeaId : null}
        onSuccess={refreshMetrics}
      />
    </div>
  )
}
