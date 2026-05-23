'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { ScoreGauge } from '@/components/shared/score-gauge'
import { CONTAINER_CONFIGS } from '@/types'
import type { Idea, ContainerAnalysis } from '@/types'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

interface PipelineCardProps {
  idea: Idea
  containers: ContainerAnalysis[]
  isBlocked: boolean
  isDragging?: boolean
}

export function PipelineCard({ idea, containers, isBlocked, isDragging }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: idea.id })
  const router = useRouter()
  const didDrag = useRef(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const containerStatusMap = new Map(containers.map(c => [c.container_type, c.approved]))

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={() => { didDrag.current = false }}
      onPointerMove={() => { didDrag.current = true }}
      onClick={() => { if (!didDrag.current) router.push(`/ideas/${idea.id}`) }}
      className={cn(
        'rounded-lg border bg-[#111113] p-3 cursor-grab active:cursor-grabbing select-none',
        'border-[#27272A] hover:border-[#3F3F46] transition-colors',
        isDragging && 'opacity-50',
        isBlocked && 'border-[#EF4444]/30'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[13px] font-semibold text-[#FAFAFA] leading-tight line-clamp-2 flex-1">
          {idea.name}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isBlocked && <Lock className="w-3 h-3 text-[#EF4444]" />}
          <ScoreGauge score={idea.score} size={28} strokeWidth={3} showLabel={false} />
        </div>
      </div>

      {/* Score label */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-[11px] font-semibold" style={{ color: getScoreColor(idea.score) }}>
          {idea.score}
        </span>
        <span className="text-[10px] text-[#52525B]">pontos</span>
      </div>

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {idea.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#18181B] text-[#71717A] border border-[#27272A]">
              {tag}
            </span>
          ))}
          {idea.tags.length > 2 && (
            <span className="text-[10px] text-[#52525B]">+{idea.tags.length - 2}</span>
          )}
        </div>
      )}

      {/* Container dots */}
      <div className="flex items-center gap-1">
        {CONTAINER_CONFIGS.map(config => {
          const status = containerStatusMap.get(config.type)
          return (
            <div
              key={config.type}
              title={`${config.label}: ${status === true ? 'Aprovado' : status === false ? 'Reprovado' : 'Pendente'}`}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  status === true ? '#22C55E' :
                  status === false ? '#EF4444' :
                  '#3F3F46',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#3B82F6'
  if (score >= 40) return '#F59E0B'
  if (score >= 20) return '#F97316'
  return '#EF4444'
}
