'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts'
import type { MetricEntry } from '@/types'
import { format, parseISO } from 'date-fns'

interface CacLtvChartProps {
  data: MetricEntry[]
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  const cac = payload.find(p => p.name === 'CAC')?.value ?? 0
  const ltv = payload.find(p => p.name === 'LTV')?.value ?? 0
  const ratio = cac > 0 ? (ltv / cac).toFixed(1) : '—'
  return (
    <div style={{
      background: '#18181B',
      border: '1px solid #3F3F46',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <p style={{ color: '#A1A1AA', marginBottom: 4 }}>{label}</p>
      {payload.map(entry => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: {formatBRL(entry.value)}
        </p>
      ))}
      <p style={{ color: '#A1A1AA', marginTop: 4, borderTop: '1px solid #27272A', paddingTop: 4 }}>
        Ratio LTV/CAC: {ratio}x
      </p>
    </div>
  )
}

export function CacLtvChart({ data }: CacLtvChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[220px] flex flex-col items-center justify-center gap-2">
        <p className="text-2xl">📊</p>
        <p className="text-[12px] text-[#52525B]">Sem dados de CAC</p>
      </div>
    )
  }

  const chartData = data
    .filter(d => d.cac !== null)
    .map(d => {
      const cac = d.cac ?? 0
      const ltv = cac * 3
      const ratio = cac > 0 ? (ltv / cac).toFixed(1) : null
      return {
        date: format(parseISO(d.date), 'dd/MM'),
        CAC: cac,
        LTV: ltv,
        ratio,
        weak: ltv / cac < 3,
      }
    })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="CAC" fill="#EF4444" radius={[3, 3, 0, 0]} maxBarSize={24}>
          <LabelList dataKey="ratio" position="top" style={{ fill: '#A1A1AA', fontSize: 10 }} formatter={(v: unknown) => v ? `${v}x` : ''} />
        </Bar>
        <Bar dataKey="LTV" fill="#22C55E" radius={[3, 3, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}
