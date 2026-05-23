'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts'
import type { MetricEntry } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RetentionChartProps {
  data: MetricEntry[]
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
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
      {payload.map(entry => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: {entry.value?.toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

export function RetentionChart({ data }: RetentionChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center gap-3">
        <p className="text-3xl">📈</p>
        <p className="text-[13px] text-[#52525B]">Registre dados para ver a curva de retenção</p>
      </div>
    )
  }

  const chartData = data
    .filter(d => d.d1_retention !== null || d.d7_retention !== null || d.d30_retention !== null)
    .map(d => ({
      date: format(parseISO(d.date), 'dd/MM', { locale: ptBR }),
      D1: d.d1_retention ?? undefined,
      D7: d.d7_retention ?? undefined,
      D30: d.d30_retention ?? undefined,
    }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="d1Fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="d7Fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="d30Fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={35} stroke="#6366F1" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Bom D1', fill: '#6366F1', fontSize: 10 }} />
        <ReferenceLine y={20} stroke="#10B981" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Bom D7', fill: '#10B981', fontSize: 10 }} />
        <ReferenceLine y={10} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Bom D30', fill: '#F59E0B', fontSize: 10 }} />
        <Area type="monotone" dataKey="D1" fill="url(#d1Fill)" stroke="none" />
        <Area type="monotone" dataKey="D7" fill="url(#d7Fill)" stroke="none" />
        <Area type="monotone" dataKey="D30" fill="url(#d30Fill)" stroke="none" />
        <Line type="monotone" dataKey="D1" stroke="#6366F1" strokeWidth={2} dot={false} name="D1" />
        <Line type="monotone" dataKey="D7" stroke="#10B981" strokeWidth={2} dot={false} name="D7" />
        <Line type="monotone" dataKey="D30" stroke="#F59E0B" strokeWidth={2} dot={false} name="D30" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
