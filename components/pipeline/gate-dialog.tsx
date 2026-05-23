'use client'

import { useRouter } from 'next/navigation'
import { XCircle, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PIPELINE_STAGE_LABELS } from '@/types'
import type { PipelineStage } from '@/types'

interface GateDialogProps {
  open: boolean
  onClose: () => void
  ideaId: string
  ideaName: string
  targetStage: PipelineStage
  blockers: string[]
}

export function GateDialog({ open, onClose, ideaId, ideaName, targetStage, blockers }: GateDialogProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md bg-[#111113] border-[#27272A]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#FAFAFA]">
            <span>⚠️</span>
            Não é possível avançar ainda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-[13px] text-[#A1A1AA]">
            <span className="font-medium text-[#FAFAFA]">{ideaName}</span> não atende os critérios para avançar para{' '}
            <span className="font-medium" style={{ color: '#6366F1' }}>
              {PIPELINE_STAGE_LABELS[targetStage]}
            </span>
            .
          </p>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">Critérios faltando</p>
            {blockers.map((blocker, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg bg-[#18181B] px-3 py-2.5">
                <XCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />
                <span className="text-[12px] text-[#A1A1AA]">{blocker}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[#A1A1AA]">
            Entendido
          </Button>
          <Button
            size="sm"
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
            onClick={() => {
              onClose()
              router.push(`/ideas/${ideaId}`)
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Ver ideia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
