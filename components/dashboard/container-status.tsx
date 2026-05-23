import { CONTAINER_CONFIGS } from '@/types'
import type { ContainerAnalysis } from '@/types'
import { cn } from '@/lib/utils'

interface ContainerStatusProps {
  containers: ContainerAnalysis[]
  totalIdeas: number
}

export function ContainerStatus({ containers, totalIdeas }: ContainerStatusProps) {
  const statsByType = new Map<string, { approved: number; rejected: number; total: number }>()

  for (const c of containers) {
    const existing = statsByType.get(c.container_type) ?? { approved: 0, rejected: 0, total: 0 }
    existing.total++
    if (c.approved === true) existing.approved++
    else if (c.approved === false) existing.rejected++
    statsByType.set(c.container_type, existing)
  }

  const worstType = [...statsByType.entries()].sort((a, b) => {
    const rateA = a[1].total > 0 ? a[1].rejected / a[1].total : 0
    const rateB = b[1].total > 0 ? b[1].rejected / b[1].total : 0
    return rateB - rateA
  })[0]?.[0]

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111113] p-5 flex flex-col gap-4">
      <p className="text-[13px] font-semibold text-[#FAFAFA]">Status dos Containers</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {CONTAINER_CONFIGS.map(config => {
          const stats = statsByType.get(config.type) ?? { approved: 0, rejected: 0, total: 0 }
          const isWorst = config.type === worstType && stats.rejected > 0
          return (
            <div
              key={config.type}
              className={cn(
                'rounded-lg border p-2.5 flex flex-col gap-1.5 items-center text-center',
                isWorst ? 'border-[#EF4444]/30 bg-[#EF4444]/5' : 'border-[#27272A] bg-[#18181B]'
              )}
            >
              <span className="text-base">{config.icon}</span>
              <span className="text-[10px] font-medium text-[#71717A] leading-tight">{config.label}</span>
              <span className="text-[11px] font-semibold" style={{ color: config.color }}>
                {stats.approved}/{Math.max(stats.total, totalIdeas > 0 ? 1 : 0)}
              </span>
              {isWorst && (
                <span className="text-[9px] text-[#EF4444]">⚠ mais falhas</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
