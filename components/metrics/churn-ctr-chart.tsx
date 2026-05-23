'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { MetricEntry } from '@/types'
import { format, parseISO } from 'date-fns'

interface ChurnCtrChartProps {
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

export function ChurnCtrChart({ data }: ChurnCtrChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center gap-3">
        <p className="text-3xl">📉</p>
        <p className="text-[13px] text-[#52525B]">Registre dados para ver churn e CTR</p>
      </div>
    )
  }

  const chartData = data
    .filter(d => d.churn_rate !== null || d.ctr !== null)
    .map(d => ({
      date: format(parseISO(d.date), 'dd/MM'),
      Churn: d.churn_rate ?? undefined,
      CTR: d.ctr ?? undefined,
    }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#A1A1AA' }} />
        <Line yAxisId="left" type="monotone" dataKey="Churn" stroke="#EC4899" strokeWidth={2} dot={false} name="Churn" />
        <Line yAxisId="right" type="monotone" dataKey="CTR" stroke="#3B82F6" strokeWidth={2} dot={false} name="CTR" />
      </LineChart>
    </ResponsiveContainer>
  )
}
