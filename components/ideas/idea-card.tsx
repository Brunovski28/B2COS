'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit2, Archive, ExternalLink } from 'lucide-react'
import type { Idea } from '@/types'
import { ScoreGauge } from '@/components/shared/score-gauge'
import { StatusBadge } from '@/components/shared/status-badge'
import { useUIStore } from '@/store/ui.store'

interface IdeaCardProps {
  idea: Idea
  onArchive?: (id: string) => void
}

export function IdeaCard({ idea, onArchive }: IdeaCardProps) {
  const openIdeaForm = useUIStore((s) => s.openIdeaForm)
  const visibleTags = idea.tags.slice(0, 3)
  const extraTags = idea.tags.length - 3

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className="group bg-[#111113] border border-[#27272A] rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:border-[#3F3F46] hover:shadow-lg transition-colors relative"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link href={`/ideas/${idea.id}`}>
            <h3 className="text-[14px] font-semibold text-[#FAFAFA] truncate hover:text-[#6366F1] transition-colors">
              {idea.name}
            </h3>
          </Link>
          {idea.main_pain && (
            <p className="text-[12px] text-[#52525B] mt-0.5 line-clamp-1">{idea.main_pain}</p>
          )}
        </div>
        <ScoreGauge score={idea.score} size={44} strokeWidth={3.5} />
      </div>

      {/* Stage */}
      <div className="flex items-center gap-2">
        <StatusBadge stage={idea.pipeline_stage} />
        {idea.target_segment && (
          <span className="text-[11px] text-[#52525B] truncate max-w-[120px]">{idea.target_segment}</span>
        )}
      </div>

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded bg-[#18181B] text-[11px] text-[#52525B]"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="text-[11px] text-[#52525B]">+{extraTags}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-[#1C1C1F]">
        <span className="text-[11px] text-[#52525B]">
          {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true, locale: ptBR })}
        </span>
        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => openIdeaForm(idea.id)}
            className="p-1 rounded text-[#52525B] hover:text-[#FAFAFA] hover:bg-[#18181B] transition-colors"
            title="Editar"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <Link
            href={`/ideas/${idea.id}`}
            className="p-1 rounded text-[#52525B] hover:text-[#FAFAFA] hover:bg-[#18181B] transition-colors"
            title="Ver detalhes"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          {onArchive && (
            <button
              onClick={() => onArchive(idea.id)}
              className="p-1 rounded text-[#52525B] hover:text-[#F59E0B] hover:bg-[#18181B] transition-colors"
              title="Arquivar"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
