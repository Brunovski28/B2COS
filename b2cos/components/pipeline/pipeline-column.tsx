'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { PipelineCard } from './pipeline-card'
import { PIPELINE_STAGE_LABELS } from '@/types'
import type { Idea, ContainerAnalysis, PipelineStage } from '@/types'
import { cn } from '@/lib/utils'

const STAGE_ICONS: Record<PipelineStage, string> = {
  epiphany: '✨',
  triage: '🔍',
  validation: '🧪',
  mvp: '🛠️',
  launch: '🚀',
  retention: '🔄',
  monetization: '💰',
  scale: '📈',
}

const STAGE_COLORS: Record<PipelineStage, string> = {
  epiphany: '#8B5CF6',
  triage: '#3B82F6',
  validation: '#06B6D4',
  mvp: '#6366F1',
  launch: '#22C55E',
  retention: '#10B981',
  monetization: '#EAB308',
  scale: '#EC4899',
}

interface PipelineColumnProps {
  stage: PipelineStage
  ideas: Idea[]
  containersByIdea: Map<string, ContainerAnalysis[]>
  blockedIds: Set<string>
  onAddIdea: (stage: PipelineStage) => void
}

export function PipelineColumn({ stage, ideas, containersByIdea, blockedIds, onAddIdea }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const color = STAGE_COLORS[stage]

  return (
    <div className="flex flex-col w-[280px] shrink-0">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border-t border-x border-[#27272A]"
        style={{ backgroundColor: `${color}14`, borderTopColor: color }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{STAGE_ICONS[stage]}</span>
          <span className="text-[13px] font-semibold" style={{ color }}>
            {PIPELINE_STAGE_LABELS[stage]}
          </span>
          <span
            className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {ideas.length}
          </span>
        </div>
        <button
          onClick={() => onAddIdea(stage)}
          className="w-5 h-5 rounded flex items-center justify-center text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#27272A] transition-colors"
          title={`Adicionar ideia em ${PIPELINE_STAGE_LABELS[stage]}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drop area */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 flex flex-col gap-2 p-2 rounded-b-xl border border-t-0 border-[#27272A] min-h-[120px] transition-colors',
          isOver && 'border-[#6366F1] bg-[#6366F1]/5'
        )}
        style={isOver ? { borderColor: color, backgroundColor: `${color}08` } : undefined}
      >
        <SortableContext items={ideas.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {ideas.map(idea => (
            <div key={idea.id} className="relative">
              <PipelineCard
                idea={idea}
                containers={containersByIdea.get(idea.id) ?? []}
                isBlocked={blockedIds.has(idea.id)}
              />
            </div>
          ))}
        </SortableContext>

        {ideas.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] text-[#3F3F46]">Sem ideias</p>
          </div>
        )}
      </div>
    </div>
  )
}
