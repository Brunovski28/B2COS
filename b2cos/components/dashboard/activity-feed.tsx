import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLORS } from '@/types'
import type { PipelineEvent, Idea, PipelineStage } from '@/types'

interface ActivityFeedProps {
  events: PipelineEvent[]
  ideas: Idea[]
}

export function ActivityFeed({ events, ideas }: ActivityFeedProps) {
  const ideaMap = new Map(ideas.map(i => [i.id, i]))
  const recent = events.slice(0, 10)

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111113] p-5 flex flex-col gap-4">
      <p className="text-[13px] font-semibold text-[#FAFAFA]">Atividade Recente</p>
      {recent.length === 0 && (
        <p className="text-[12px] text-[#52525B]">Nenhum evento registrado ainda.</p>
      )}
      <div className="flex flex-col gap-2">
        {recent.map(event => {
          const idea = ideaMap.get(event.idea_id)
          if (!idea) return null
          const toColor = event.to_stage ? PIPELINE_STAGE_COLORS[event.to_stage as PipelineStage] : '#52525B'
          const toLabel = event.to_stage ? PIPELINE_STAGE_LABELS[event.to_stage as PipelineStage] : '—'
          return (
            <Link
              key={event.id}
              href={`/ideas/${event.idea_id}`}
              className="flex items-center gap-3 rounded-lg hover:bg-[#18181B] px-2 py-2 -mx-2 transition-colors group"
            >
              <div className="w-6 h-6 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center shrink-0">
                <ArrowRight className="w-3 h-3 text-[#52525B]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#A1A1AA] group-hover:text-[#FAFAFA] transition-colors truncate">
                  {idea.name}
                </p>
                {event.from_stage && event.to_stage && (
                  <p className="text-[11px] text-[#52525B] flex items-center gap-1">
                    <span>{PIPELINE_STAGE_LABELS[event.from_stage as PipelineStage]}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span style={{ color: toColor }}>{toLabel}</span>
                  </p>
                )}
              </div>
              <span className="text-[10px] text-[#3F3F46] shrink-0 whitespace-nowrap">
                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
