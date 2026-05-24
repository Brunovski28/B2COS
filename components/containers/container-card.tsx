'use client'

import { useState } from 'react'
import type { ContainerConfig, ContainerAnalysis } from '@/types'
import { ContainerAnalysisDialog } from './container-analysis'
import { CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react'

interface ContainerCardProps {
  ideaId: string
  ideaData?: Record<string, unknown>
  config: ContainerConfig
  analysis: ContainerAnalysis | null
  aiLoading?: boolean
  onSaved: () => void
}

export function ContainerCard({ ideaId, ideaData, config, analysis, aiLoading, onSaved }: ContainerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const status = analysis === null ? 'pending' : analysis.approved ? 'approved' : 'rejected'
  const score = analysis?.score ?? 0
  const isAiAnalyzed = !!(analysis?.answers as Record<string, unknown> | undefined)?.ai_analyzed

  if (aiLoading) {
    return (
      <div className="w-full text-left p-4 rounded-lg bg-[#111113] border border-violet-800/40 animate-pulse">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: config.color + '20' }}
          >
            {config.icon}
          </div>
          <Sparkles className="w-4 h-4 text-violet-400 animate-spin mt-0.5" />
        </div>
        <p className="text-[13px] font-medium text-[#FAFAFA] mb-0.5">{config.label}</p>
        <p className="text-[11px] text-violet-400/70">Analisando...</p>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="w-full text-left p-4 rounded-lg bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] transition-colors group"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: config.color + '20' }}
          >
            {config.icon}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isAiAnalyzed && (
              <Sparkles className="w-3.5 h-3.5 text-violet-400" aria-label="Analisado por IA" />
            )}
            {status === 'approved' && <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />}
            {status === 'rejected' && <XCircle className="w-4 h-4 text-[#EF4444]" />}
            {status === 'pending' && <Clock className="w-4 h-4 text-[#52525B]" />}
          </div>
        </div>

        <p className="text-[13px] font-medium text-[#FAFAFA] mb-0.5">{config.label}</p>
        <p className="text-[11px] text-[#52525B] mb-3 line-clamp-2">{config.description}</p>

        {/* Score bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#52525B]">
              {isAiAnalyzed ? 'Score IA' : 'Score'}
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: status === 'pending' ? '#52525B' : isAiAnalyzed ? '#8B5CF6' : config.color }}
            >
              {status === 'pending' ? '—' : score}
            </span>
          </div>
          <div className="h-1 rounded-full bg-[#27272A] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: status === 'pending' ? '0%' : `${score}%`,
                backgroundColor: isAiAnalyzed ? '#8B5CF6' : config.color,
              }}
            />
          </div>
        </div>
      </button>

      <ContainerAnalysisDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ideaId={ideaId}
        ideaData={ideaData}
        config={config}
        existing={analysis}
        onSaved={onSaved}
      />
    </>
  )
}
