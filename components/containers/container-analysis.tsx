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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScoreGauge } from '@/components/shared/score-gauge'
import { AIAnalysisPanel, FullSkillAnalysisPanel } from '@/components/ideas/ai-analysis-panel'
import { CheckCircle2, XCircle, Sparkles, RotateCcw, Loader2 } from 'lucide-react'
import { analyzeContainer } from '@/lib/ai/actions'
import type { ContainerAIResult } from '@/lib/ai/skill'

const AI_LOADING_MESSAGES = [
  'Analisando a intensidade da dor...',
  'Verificando padrões comportamentais...',
  'Avaliando potencial de retenção...',
  'Mapeando concorrência de mercado...',
  'Calculando velocidade de validação...',
  'Identificando nicho defensável...',
  'Consolidando análise estratégica...',
]

interface ContainerAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ideaId: string
  ideaData?: Record<string, unknown>
  config: ContainerConfig
  existing: ContainerAnalysis | null
  onSaved: () => void
}

export function ContainerAnalysisDialog({
  open,
  onOpenChange,
  ideaId,
  ideaData,
  config,
  existing,
  onSaved,
}: ContainerAnalysisDialogProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(existing?.answers ?? {})
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<ContainerAIResult | null>(null)
  const [aiLoadingMsg, setAiLoadingMsg] = useState(AI_LOADING_MESSAGES[0])
  const [activeTab, setActiveTab] = useState('manual')

  // Determine if there is prior AI data in existing answers
  const priorAiResult = existing?.answers?.ai_result as ContainerAIResult | undefined

  useEffect(() => {
    if (open) {
      setAnswers(existing?.answers ?? {})
      setNotes(existing?.notes ?? '')
      setAiResult(priorAiResult ?? null)
      setActiveTab(priorAiResult ? 'ai' : 'manual')
    }
  }, [open, existing])

  // Rotate loading messages
  useEffect(() => {
    if (!aiLoading) return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % AI_LOADING_MESSAGES.length
      setAiLoadingMsg(AI_LOADING_MESSAGES[i])
    }, 1500)
    return () => clearInterval(interval)
  }, [aiLoading])

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
      answers: aiResult ? { ...answers, ai_result: aiResult, ai_analyzed: true } : answers,
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

  async function handleAnalyzeWithAI() {
    setAiLoading(true)
    setAiLoadingMsg(AI_LOADING_MESSAGES[0])
    try {
      const data = ideaData ?? { id: ideaId }
      const result = await analyzeContainer(config.type, data)
      setAiResult(result)
      setActiveTab('ai')

      // Auto-save the AI result
      const supabase = createClient()
      await supabase.from('container_analyses').upsert({
        idea_id: ideaId,
        container_type: config.type,
        score: result.score,
        approved: result.approved,
        answers: { ...answers, ai_result: result, ai_analyzed: true },
        notes: notes || null,
      }, { onConflict: 'idea_id,container_type' })

      toast.success(`Container ${config.label} analisado pela IA`)
      onSaved()
    } catch {
      toast.error('Análise com IA falhou. Tente novamente ou preencha manualmente.')
    } finally {
      setAiLoading(false)
    }
  }

  function handleRestoreAI() {
    if (priorAiResult) {
      setAiResult(priorAiResult)
      setActiveTab('ai')
    }
  }

  const hasAiData = aiResult !== null

  // Check for full-skill criterion data stored in answers
  const skillCriterionMap: Record<string, string> = {
    discovery: 'tam',
    behavior: 'desired_pain',
    monetization: 'willingness_to_pay',
    distribution: 'competitive_edge',
    mvp: 'validation_speed',
    scale: 'scalability',
    retention: 'retention_d30_d90',
    validation: 'validation_speed',
  }
  const criterionKey = skillCriterionMap[config.type] ?? ''
  const fullSkillCriterion = existing?.answers?.[criterionKey] as { score: number; justification: string; improvement: string } | undefined
  const containerAiScore = existing?.score ?? null
  const containerAiApproved = existing?.approved ?? false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[580px] bg-[#111113] border border-[#27272A] p-0 overflow-hidden max-h-[90vh] flex flex-col">
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
              <ScoreGauge score={hasAiData ? (aiResult?.score ?? score) : score} size={48} strokeWidth={4} />
              <div className="flex items-center gap-1">
                {(hasAiData ? (aiResult?.approved ?? approved) : approved) ? (
                  <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                ) : (
                  <XCircle className="w-3 h-3 text-[#EF4444]" />
                )}
                <span
                  className="text-[10px] font-medium"
                  style={{ color: (hasAiData ? (aiResult?.approved ?? approved) : approved) ? '#22C55E' : '#EF4444' }}
                >
                  {(hasAiData ? (aiResult?.approved ?? approved) : approved) ? 'Aprovado' : 'Reprovado'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="bg-[#18181B] border-b border-[#27272A] rounded-none h-9 px-6 w-full justify-start shrink-0">
              <TabsTrigger
                value="ai"
                className="text-[12px] data-[state=active]:bg-[#27272A] data-[state=active]:text-[#FAFAFA] gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                Análise da IA
                {hasAiData && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 ml-0.5" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="text-[12px] data-[state=active]:bg-[#27272A] data-[state=active]:text-[#FAFAFA]"
              >
                Ajuste Manual
              </TabsTrigger>
            </TabsList>

            {/* AI Tab */}
            <TabsContent value="ai" className="px-6 py-4 flex-1 m-0">
              {aiLoading ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                  <p className="text-[13px] text-[#A1A1AA] text-center animate-pulse">{aiLoadingMsg}</p>
                  <div className="w-48 h-1 bg-[#27272A] rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full animate-pulse w-2/3" />
                  </div>
                </div>
              ) : hasAiData ? (
                <AIAnalysisPanel result={aiResult!} />
              ) : fullSkillCriterion && containerAiScore !== null ? (
                <FullSkillAnalysisPanel
                  criterionKey={criterionKey}
                  criterionData={fullSkillCriterion}
                  containerScore={containerAiScore}
                  containerApproved={containerAiApproved}
                />
              ) : (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <Sparkles className="w-10 h-10 text-[#3F3F46]" />
                  <div>
                    <p className="text-[13px] text-[#A1A1AA] mb-1">Nenhuma análise de IA disponível</p>
                    <p className="text-[11px] text-[#52525B]">Use o botão abaixo para analisar este container com IA</p>
                  </div>
                  <Button
                    onClick={handleAnalyzeWithAI}
                    disabled={aiLoading}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-[12px] gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Analisar com IA
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Manual Tab */}
            <TabsContent value="manual" className="px-6 py-4 space-y-5 m-0">
              {hasAiData && (
                <div className="text-[11px] text-[#52525B] bg-[#18181B] border border-[#27272A] rounded px-3 py-2">
                  Ajuste manual sobrescreve a análise da IA ao salvar.{' '}
                  {priorAiResult && (
                    <button
                      onClick={handleRestoreAI}
                      className="text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 ml-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restaurar análise da IA
                    </button>
                  )}
                </div>
              )}
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
            </TabsContent>
          </Tabs>
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
            onClick={handleAnalyzeWithAI}
            disabled={aiLoading}
            variant="outline"
            className="border-violet-700 text-violet-400 hover:bg-violet-900/20 text-[13px] gap-1.5"
          >
            {aiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Analisar com IA
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
