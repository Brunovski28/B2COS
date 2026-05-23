import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' }
  icon?: LucideIcon
  color?: string
  alert?: boolean
  className?: string
}

export function MetricCard({ label, value, trend, icon: Icon, color = '#6366F1', alert, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#27272A] bg-[#111113] p-5 flex flex-col gap-3',
        alert && 'border-[#EF4444]/40',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#A1A1AA]">{label}</span>
        {Icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span
          className={cn('text-[28px] font-semibold leading-none tracking-tight', alert && 'text-[#EF4444]')}
          style={alert ? undefined : { color: '#FAFAFA' }}
        >
          {value}
        </span>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-[11px] font-medium mb-0.5',
              trend.direction === 'up' && 'text-[#22C55E]',
              trend.direction === 'down' && 'text-[#EF4444]',
              trend.direction === 'neutral' && 'text-[#A1A1AA]'
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
    </div>
  )
}
