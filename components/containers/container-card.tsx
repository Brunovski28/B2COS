'use client'

import { useState } from 'react'
import type { ContainerConfig, ContainerAnalysis } from '@/types'
import { ContainerAnalysisDialog } from './container-analysis'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

interface ContainerCardProps {
  ideaId: string
  config: ContainerConfig
  analysis: ContainerAnalysis | null
  onSaved: () => void
}

export function ContainerCard({ ideaId, config, analysis, onSaved }: ContainerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const status = analysis === null ? 'pending' : analysis.approved ? 'approved' : 'rejected'
  const score = analysis?.score ?? 0

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
          {/* Status icon */}
          <div className="mt-0.5">
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
            <span className="text-[10px] text-[#52525B]">Score</span>
            <span
              className="text-[11px] font-medium"
              style={{ color: status === 'pending' ? '#52525B' : config.color }}
            >
              {status === 'pending' ? '—' : score}
            </span>
          </div>
          <div className="h-1 rounded-full bg-[#27272A] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: status === 'pending' ? '0%' : `${score}%`,
                backgroundColor: config.color,
              }}
            />
          </div>
        </div>
      </button>

      <ContainerAnalysisDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ideaId={ideaId}
        config={config}
        existing={analysis}
        onSaved={onSaved}
      />
    </>
  )
}
