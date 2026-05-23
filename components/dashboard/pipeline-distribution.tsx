import { PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLORS } from '@/types'
import type { PipelineStage } from '@/types'
import Link from 'next/link'

const STAGES: PipelineStage[] = [
  'epiphany', 'triage', 'validation', 'mvp',
  'launch', 'retention', 'monetization', 'scale',
]

interface PipelineDistributionProps {
  countByStage: Record<string, number>
}

export function PipelineDistribution({ countByStage }: PipelineDistributionProps) {
  const max = Math.max(...STAGES.map(s => countByStage[s] ?? 0), 1)

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111113] p-5 flex flex-col gap-4">
      <p className="text-[13px] font-semibold text-[#FAFAFA]">Distribuição no Pipeline</p>
      <div className="space-y-2.5">
        {STAGES.map(stage => {
          const count = countByStage[stage] ?? 0
          const pct = (count / max) * 100
          const color = PIPELINE_STAGE_COLORS[stage]
          return (
            <Link key={stage} href={`/pipeline`} className="flex items-center gap-3 group">
              <span className="text-[11px] text-[#71717A] w-20 shrink-0 group-hover:text-[#A1A1AA] transition-colors">
                {PIPELINE_STAGE_LABELS[stage]}
              </span>
              <div className="flex-1 h-5 rounded bg-[#18181B] overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color, opacity: count === 0 ? 0.2 : 0.8 }}
                />
              </div>
              <span className="text-[11px] font-medium w-4 text-right shrink-0" style={{ color: count > 0 ? color : '#3F3F46' }}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
