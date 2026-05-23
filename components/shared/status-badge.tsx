import type { PipelineStage } from '@/types'
import { PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLORS } from '@/types'

interface StatusBadgeProps {
  stage: PipelineStage
}

export function StatusBadge({ stage }: StatusBadgeProps) {
  const label = PIPELINE_STAGE_LABELS[stage]
  const color = PIPELINE_STAGE_COLORS[stage]

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
      style={{ color, backgroundColor: color + '18' }}
    >
      {label}
    </span>
  )
}
