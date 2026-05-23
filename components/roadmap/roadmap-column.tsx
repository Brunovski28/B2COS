'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { RoadmapCard } from './roadmap-card'
import type { RoadmapItem, Idea, RoadmapTimeframe } from '@/types'
import { ROADMAP_TIMEFRAME_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const TIMEFRAME_COLORS: Record<RoadmapTimeframe, string> = {
  short: '#22C55E',
  medium: '#3B82F6',
  long: '#8B5CF6',
}

const TIMEFRAME_DESCRIPTIONS: Record<RoadmapTimeframe, string> = {
  short: '30–90 dias',
  medium: '3–12 meses',
  long: '1+ ano',
}

interface RoadmapColumnProps {
  timeframe: RoadmapTimeframe
  items: RoadmapItem[]
  ideas: Idea[]
  droppableId: string
  onAdd: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function RoadmapColumn({ timeframe, items, ideas, droppableId, onAdd, onEdit, onDelete }: RoadmapColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId })
  const color = TIMEFRAME_COLORS[timeframe]

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border-t border-x border-[#27272A]"
        style={{ backgroundColor: `${color}12`, borderTopColor: color }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold" style={{ color }}>{ROADMAP_TIMEFRAME_LABELS[timeframe]}</span>
          <span className="text-[10px] text-[#52525B]">{TIMEFRAME_DESCRIPTIONS[timeframe]}</span>
          <span
            className="text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {items.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="w-5 h-5 rounded flex items-center justify-center text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#27272A] transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 flex flex-col gap-2 p-2 rounded-b-xl border border-t-0 border-[#27272A] min-h-[120px] transition-colors',
          isOver && 'bg-[#6366F1]/5 border-[#6366F1]'
        )}
        style={isOver ? { borderColor: color, backgroundColor: `${color}08` } : undefined}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <RoadmapCard
              key={item.id}
              item={item}
              ideas={ideas}
              onEdit={() => onEdit(item.id)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] text-[#3F3F46]">Sem itens</p>
          </div>
        )}
      </div>
    </div>
  )
}
