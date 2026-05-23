'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Flag, CalendarDays, Link2, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { RoadmapItem, Idea } from '@/types'
import {
  ROADMAP_STATUS_LABELS,
  ROADMAP_STATUS_COLORS,
  ROADMAP_PRIORITY_COLORS,
} from '@/types'
import { cn } from '@/lib/utils'

interface RoadmapCardProps {
  item: RoadmapItem
  ideas: Idea[]
  onEdit: () => void
  onDelete: () => void
}

export function RoadmapCard({ item, ideas, onEdit, onDelete }: RoadmapCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const linkedIdea = ideas.find(i => i.id === item.idea_id)
  const priorityColor = ROADMAP_PRIORITY_COLORS[item.priority]
  const statusColor = ROADMAP_STATUS_COLORS[item.status]
  const statusLabel = ROADMAP_STATUS_LABELS[item.status]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'rounded-xl border bg-[#111113] p-3.5 group cursor-grab active:cursor-grabbing transition-colors hover:border-[#3F3F46] relative overflow-hidden',
        item.is_milestone
          ? 'border-[#6366F1]/50 bg-[#6366F1]/5'
          : 'border-[#27272A]'
      )}
    >
      {/* Priority bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ backgroundColor: priorityColor }}
      />

      {/* Milestone flag */}
      {item.is_milestone && (
        <div className="absolute top-2.5 right-2.5 text-[#6366F1]">
          <Flag className="w-3.5 h-3.5 fill-current" />
        </div>
      )}

      <div className="pl-2">
        {/* Title */}
        <p className={cn(
          'text-[13px] font-semibold text-[#FAFAFA] leading-snug mb-1.5',
          item.is_milestone && 'pr-6'
        )}>
          {item.title}
        </p>

        {/* Description */}
        {item.description && (
          <p className="text-[12px] text-[#52525B] leading-relaxed line-clamp-2 mb-2">{item.description}</p>
        )}

        {/* Status badge */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${statusColor}1A`, color: statusColor }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          {linkedIdea && (
            <a
              href={`/ideas/${linkedIdea.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] text-[#6366F1] hover:text-[#818CF8] transition-colors"
            >
              <Link2 className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{linkedIdea.name}</span>
            </a>
          )}
          {item.due_date && (
            <span className="flex items-center gap-1 text-[11px] text-[#52525B]">
              <CalendarDays className="w-3 h-3" />
              {format(parseISO(item.due_date), 'dd/MM/yy', { locale: ptBR })}
            </span>
          )}
        </div>
      </div>

      {/* Edit / delete */}
      <div className="absolute bottom-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1 rounded text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#27272A] transition-colors"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1 rounded text-[#52525B] hover:text-[#EF4444] hover:bg-[#27272A] transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
