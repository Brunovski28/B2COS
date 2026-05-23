'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  benchmark: string
  trend?: number | null
  borderColor: 'green' | 'yellow' | 'red' | 'neutral'
}

const BORDER_COLORS = {
  green: 'border-[#22C55E]/40',
  yellow: 'border-[#F59E0B]/40',
  red: 'border-[#EF4444]/40',
  neutral: 'border-[#27272A]',
}

export function KpiCard({ label, value, benchmark, trend, borderColor }: KpiCardProps) {
  const isPositive = trend !== null && trend !== undefined && trend > 0
  const isNegative = trend !== null && trend !== undefined && trend < 0

  return (
    <div
      className={`rounded-xl border bg-[#111113] p-4 flex flex-col gap-2 ${BORDER_COLORS[borderColor]}`}
    >
      <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">{label}</p>
      <p className="text-[26px] font-semibold text-[#FAFAFA] leading-none">{value}</p>

      <div className="flex items-center justify-between mt-1">
        {trend !== null && trend !== undefined ? (
          <div className={`flex items-center gap-1 text-[12px] font-medium ${
            isPositive ? 'text-[#22C55E]' : isNegative ? 'text-[#EF4444]' : 'text-[#52525B]'
          }`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> :
             isNegative ? <TrendingDown className="w-3.5 h-3.5" /> :
             <Minus className="w-3.5 h-3.5" />}
            <span>{isPositive ? '+' : ''}{trend.toFixed(1)}%</span>
          </div>
        ) : (
          <span className="text-[11px] text-[#3F3F46]">—</span>
        )}
        <p className="text-[11px] text-[#3F3F46] text-right leading-snug max-w-[140px]">{benchmark}</p>
      </div>
    </div>
  )
}
