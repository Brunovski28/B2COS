'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { calculateContainerScore } from '@/lib/container-criteria'
import type { ContainerType, ContainerAnalysis, ContainerConfig } from '@/types'
import { ContainerFormFields } from './container-form-fields'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScoreGauge } from '@/components/shared/score-gauge'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ContainerAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ideaId: string
  config: ContainerConfig
  existing: ContainerAnalysis | null
  onSaved: () => void
}

export function ContainerAnalysisDialog({
  open,
  onOpenChange,
  ideaId,
  config,
  existing,
  onSaved,
}: ContainerAnalysisDialogProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(existing?.answers ?? {})
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setAnswers(existing?.answers ?? {})
      setNotes(existing?.notes ?? '')
    }
  }, [open, existing])

  function handleAnswerChange(key: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const { score, approved } = calculateContainerScore(config.type as ContainerType, answers)

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()

    const payload = {
      idea_id: ideaId,
      container_type: config.type,
      score,
      approved,
      answers,
      notes: notes || null,
    }

    const { error } = await supabase
      .from('container_analyses')
      .upsert(payload, { onConflict: 'idea_id,container_type' })

    if (error) {
      toast.error('Erro ao salvar análise')
      setLoading(false)
      return
    }

    toast.success(`Container ${config.label} salvo`)
    setLoading(false)
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] bg-[#111113] border border-[#27272A] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-[#27272A] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: config.color + '20' }}
            >
              {config.icon}
            </div>
            <div>
              <DialogTitle className="text-[14px] font-semibold text-[#FAFAFA]">
                {config.label}
              </DialogTitle>
              <p className="text-[11px] text-[#52525B]">{config.description}</p>
            </div>
            {/* Live score */}
            <div className="ml-auto flex flex-col items-center gap-1">
              <ScoreGauge score={score} size={48} strokeWidth={4} />
              <div className="flex items-center gap-1">
                {approved ? (
                  <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                ) : (
                  <XCircle className="w-3 h-3 text-[#EF4444]" />
                )}
                <span
                  className="text-[10px] font-medium"
                  style={{ color: approved ? '#22C55E' : '#EF4444' }}
                >
                  {approved ? 'Aprovado' : 'Reprovado'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <ContainerFormFields
            type={config.type as ContainerType}
            answers={answers}
            onChange={handleAnswerChange}
          />

          <div className="space-y-1.5 pt-2 border-t border-[#27272A]">
            <Label className="text-[12px] text-[#A1A1AA]">Notas e observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexto adicional, evidências, fontes..."
              rows={3}
              className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#27272A] shrink-0 flex gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-[#A1A1AA] hover:text-[#FAFAFA] text-[13px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] flex-1"
          >
            {loading ? 'Salvando...' : 'Salvar análise'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
