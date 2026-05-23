'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookOpen, FileText, Layers, PenLine, FlaskConical, Lightbulb, Edit2, Trash2 } from 'lucide-react'
import type { LearningResource, Idea } from '@/types'
import { LEARNING_TYPE_LABELS, LEARNING_TYPE_COLORS } from '@/types'
import { useUIStore } from '@/store/ui.store'

const TYPE_ICONS = {
  book: BookOpen,
  article: FileText,
  framework: Layers,
  note: PenLine,
  study: FlaskConical,
  insight: Lightbulb,
}

interface ResourceCardProps {
  resource: LearningResource
  ideas: Idea[]
  onDelete?: (id: string) => void
}

export function ResourceCard({ resource, ideas, onDelete }: ResourceCardProps) {
  const openLearningForm = useUIStore((s) => s.openLearningForm)
  const Icon = TYPE_ICONS[resource.type]
  const color = LEARNING_TYPE_COLORS[resource.type]
  const visibleInsights = resource.key_insights.slice(0, 3)
  const extraInsights = resource.key_insights.length - 3
  const appliedIdeas = ideas.filter((i) => resource.applied_to_idea_ids.includes(i.id))

  return (
    <motion.div
      whileHover={{ scale: 1.012, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.99 }}
      className="group bg-[#111113] border border-[#27272A] rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:border-[#3F3F46] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[14px] font-semibold text-[#FAFAFA] leading-tight">{resource.title}</h3>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => openLearningForm(resource.id)}
                className="p-1 rounded text-[#52525B] hover:text-[#FAFAFA] hover:bg-[#18181B] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(resource.id)}
                  className="p-1 rounded text-[#52525B] hover:text-[#EF4444] hover:bg-[#18181B] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {resource.author && (
            <p className="text-[12px] text-[#52525B] mt-0.5">{resource.author}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {resource.description && (
        <p className="text-[13px] text-[#A1A1AA] line-clamp-2 leading-relaxed">{resource.description}</p>
      )}

      {/* Reading progress — books only */}
      {resource.type === 'book' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#52525B]">
              {resource.progress === 0 ? 'Não iniciado' : resource.progress === 100 ? 'Concluído' : 'Em leitura'}
            </span>
            <span className="text-[11px] font-mono" style={{ color }}>{resource.progress}% lido</span>
          </div>
          <div className="h-1.5 bg-[#18181B] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${resource.progress}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )}

      {/* Key insights */}
      {resource.key_insights.length > 0 && (
        <div className="bg-[#0A0A0B] rounded-md p-2.5 space-y-1">
          {visibleInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-[11px] mt-0.5" style={{ color }}>•</span>
              <p className="text-[12px] text-[#A1A1AA] leading-relaxed">{insight}</p>
            </div>
          ))}
          {extraInsights > 0 && (
            <p className="text-[11px] text-[#52525B] pl-3">+{extraInsights} mais</p>
          )}
        </div>
      )}

      {/* Tags */}
      {resource.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {resource.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded bg-[#18181B] text-[11px] text-[#52525B]">
              {tag}
            </span>
          ))}
          {resource.tags.length > 4 && (
            <span className="text-[11px] text-[#52525B]">+{resource.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Applied ideas */}
      {appliedIdeas.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#1C1C1F]">
          <span className="text-[11px] text-[#52525B]">Aplicado em:</span>
          {appliedIdeas.map((idea) => (
            <Link
              key={idea.id}
              href={`/ideas/${idea.id}`}
              onClick={(e) => e.stopPropagation()}
              className="px-1.5 py-0.5 rounded text-[11px] bg-[#18181B] text-[#6366F1] hover:text-[#818CF8] transition-colors"
            >
              {idea.name}
            </Link>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1C1C1F] mt-auto">
        <span
          className="text-[11px] px-1.5 py-0.5 rounded"
          style={{ color, backgroundColor: `${color}15` }}
        >
          {LEARNING_TYPE_LABELS[resource.type]}
        </span>
        <span className="text-[11px] text-[#52525B]">
          {formatDistanceToNow(new Date(resource.updated_at), { addSuffix: true, locale: ptBR })}
        </span>
      </div>
    </motion.div>
  )
}
