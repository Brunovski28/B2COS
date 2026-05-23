'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Problem, Idea } from '@/types'
import { PROBLEM_FREQUENCY_LABELS, PROBLEM_SOURCE_LABELS } from '@/types'

const SOURCE_ICONS: Record<string, string> = {
  observation: '👁',
  interview: '🎤',
  personal: '🧠',
  research: '📚',
  social: '💬',
}

const FREQUENCY_COLORS: Record<string, string> = {
  daily: '#EF4444',
  weekly: '#F59E0B',
  monthly: '#3B82F6',
  rarely: '#52525B',
}

interface ProblemCardProps {
  problem: Problem
  ideas: Idea[]
  onEdit: () => void
  onDelete: () => void
}

export function ProblemCard({ problem, ideas, onEdit, onDelete }: ProblemCardProps) {
  const relatedIdeas = ideas.filter(i => problem.related_idea_ids.includes(i.id))
  const intensity = problem.emotional_intensity ?? 0
  const freqColor = problem.frequency ? FREQUENCY_COLORS[problem.frequency] : '#52525B'

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111113] p-4 break-inside-avoid group hover:border-[#3F3F46] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-[14px] font-semibold text-[#FAFAFA] leading-snug flex-1">{problem.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            className="p-1 rounded text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#27272A] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-[#52525B] hover:text-[#EF4444] hover:bg-[#27272A] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      {problem.description && (
        <p className="text-[13px] text-[#A1A1AA] leading-relaxed mb-3 line-clamp-3">{problem.description}</p>
      )}

      {/* Real quote */}
      {problem.real_quote && (
        <blockquote className="border-l-2 border-[#6366F1] pl-3 mb-3">
          <p className="text-[13px] italic text-[#6366F1] leading-relaxed">&ldquo;{problem.real_quote}&rdquo;</p>
        </blockquote>
      )}

      {/* Intensity bubbles */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[11px] text-[#52525B] mr-1">Intensidade:</span>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i < intensity ? 8 : 6,
              height: i < intensity ? 8 : 6,
              backgroundColor: i < intensity
                ? intensity >= 8 ? '#EF4444' : intensity >= 5 ? '#F59E0B' : '#3B82F6'
                : '#27272A',
            }}
          />
        ))}
        <span className="text-[11px] font-semibold ml-1" style={{
          color: intensity >= 8 ? '#EF4444' : intensity >= 5 ? '#F59E0B' : '#3B82F6'
        }}>{intensity}/10</span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {problem.frequency && (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${freqColor}1A`, color: freqColor }}
          >
            {PROBLEM_FREQUENCY_LABELS[problem.frequency]}
          </span>
        )}
        {problem.source && (
          <span className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
            <span>{SOURCE_ICONS[problem.source]}</span>
            {PROBLEM_SOURCE_LABELS[problem.source]}
          </span>
        )}
      </div>

      {/* Tags */}
      {problem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {problem.tags.map(tag => (
            <span key={tag} className="text-[11px] text-[#52525B] bg-[#18181B] border border-[#27272A] rounded-full px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Related ideas */}
      {relatedIdeas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {relatedIdeas.map(idea => (
            <a
              key={idea.id}
              href={`/ideas/${idea.id}`}
              className="text-[11px] text-[#6366F1] hover:text-[#818CF8] bg-[#6366F1]/10 rounded-full px-2 py-0.5 transition-colors"
            >
              {idea.name}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
