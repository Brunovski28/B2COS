'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { MetricEntry } from '@/types'
import { format, parseISO } from 'date-fns'

interface MrrChartProps {
  data: MetricEntry[]
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#18181B',
      border: '1px solid #3F3F46',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <p style={{ color: '#A1A1AA', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#22C55E' }}>MRR: {formatBRL(payload[0].value)}</p>
    </div>
  )
}

export function MrrChart({ data }: MrrChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[220px] flex flex-col items-center justify-center gap-2">
        <p className="text-2xl">💰</p>
        <p className="text-[12px] text-[#52525B]">Sem dados de MRR</p>
      </div>
    )
  }

  const chartData = data
    .filter(d => d.mrr !== null)
    .map(d => ({
      date: format(parseISO(d.date), 'dd/MM'),
      mrr: d.mrr ?? 0,
    }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="mrr" stroke="#22C55E" strokeWidth={2} fill="url(#mrrGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
