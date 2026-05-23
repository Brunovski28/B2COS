import { PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLORS } from '@/types'
import type { PipelineStage } from '@/types'
import { cn } from '@/lib/utils'

interface StageBadgeProps {
  stage: PipelineStage
  size?: 'sm' | 'md'
  className?: string
}

export function StageBadge({ stage, size = 'md', className }: StageBadgeProps) {
  const color = PIPELINE_STAGE_COLORS[stage]
  const label = PIPELINE_STAGE_LABELS[stage]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium leading-none',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]',
        className
      )}
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {label}
    </span>
  )
}
