'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  calculateIdeaScore,
  getScoreClassification,
  calculateCombinedScore,
  getSkillVerdict,
} from '@/lib/scoring'
import { getNextStage, checkGate } from '@/lib/pipeline-rules'
import { analyzeIdeaWithSkill } from '@/lib/ai/actions'
import { mapSkillToContainers } from '@/lib/ai/skill'
import type { Idea, ContainerAnalysis, PipelineEvent, ContainerType } from '@/types'
import { CONTAINER_CONFIGS, PIPELINE_STAGE_LABELS } from '@/types'
import { useUIStore } from '@/store/ui.store'
import { Header } from '@/components/layout/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScoreGauge } from '@/components/shared/score-gauge'
import { StatusBadge } from '@/components/shared/status-badge'
import { ContainerCard } from '@/components/containers/container-card'
import { BehavioralAlertBanner } from '@/components/ideas/behavioral-alert'
import { IdeaForm } from '@/components/ideas/idea-form'
import type { BehavioralAlert } from '@/lib/ai/skill'
import {
  Edit2, Archive, ArrowRight, ChevronRight, Sparkles, Loader2,
} from 'lucide-react'

interface IdeaDetailClientProps {
  idea: Idea
  containers: ContainerAnalysis[]
  events: PipelineEvent[]
}

function ScoreBreakdownRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[12px]">
        <span className="text-[#A1A1AA]">{label}</span>
        <span className="font-mono text-[#FAFAFA]">{value.toFixed(1)} / {max}</span>
      </div>
      <div className="h-1 rounded-full bg-[#27272A]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export function IdeaDetailClient({ idea: initialIdea, containers: initialContainers, events: initialEvents }: IdeaDetailClientProps) {
  const [idea, setIdea] = useState<Idea>(initialIdea)
  const [containers, setContainers] = useState<ContainerAnalysis[]>(initialContainers)
  const [events] = useState<PipelineEvent[]>(initialEvents)
  const [analyzingAll, setAnalyzingAll] = useState(false)
  const [analyzingContainers, setAnalyzingContainers] = useState<Set<string>>(new Set())
  const [aiScore, setAiScore] = useState<number | null>(null)
  const [behavioralAlert, setBehavioralAlert] = useState<BehavioralAlert | null>(null)
  const { openIdeaForm } = useUIStore()
  const router = useRouter()

  const containerMap = Object.fromEntries(containers.map((c) => [c.container_type, c]))
  const manualScore = calculateIdeaScore(idea)
  const combinedScore = calculateCombinedScore(manualScore, aiScore)
  const scoreClass = getScoreClassification(combinedScore)
  const nextStage = getNextStage(idea.pipeline_stage)

  const ideaData = {
    name: idea.name,
    description: idea.description,
    main_pain: idea.main_pain,
    pain_frequency: idea.pain_frequency,
    target_segment: idea.target_segment,
    market_size: idea.market_size,
    monetization_notes: idea.monetization_notes,
    recurrence: idea.recurrence,
    complexity: idea.complexity,
    competition_level: idea.competition_level,
  }

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('ideas').select('*').eq('id', idea.id).single()
    if (data) setIdea(data)
    const { data: c } = await supabase.from('container_analyses').select('*').eq('idea_id', idea.id)
    if (c) setContainers(c)
  }, [idea.id])

  async function handleArchive() {
    const supabase = createClient()
    const { error } = await supabase.from('ideas').update({ status: 'archived' }).eq('id', idea.id)
    if (error) { toast.error('Erro ao arquivar'); return }
    toast.success('Ideia arquivada')
    router.push('/ideas')
  }

  async function handleAdvancePipeline() {
    if (!nextStage) return
    const gate = checkGate(idea, containerMap, nextStage)
    if (!gate.canAdvance) {
      toast.error('Gate não cumprido', { description: gate.blockers.join(' • ') })
      return
    }
    const supabase = createClient()
    const score = calculateIdeaScore(idea)
    await supabase.from('ideas').update({ pipeline_stage: nextStage, score }).eq('id', idea.id)
    await supabase.from('pipeline_events').insert({
      idea_id: idea.id,
      from_stage: idea.pipeline_stage,
      to_stage: nextStage,
    })
    toast.success(`Avançou para ${PIPELINE_STAGE_LABELS[nextStage]}`)
    setIdea((prev) => ({ ...prev, pipeline_stage: nextStage, score }))
  }

  async function handleAnalyzeAll() {
    setAnalyzingAll(true)
    const allTypes = CONTAINER_CONFIGS.map(c => c.type)
    setAnalyzingContainers(new Set(allTypes))

    try {
      const result = await analyzeIdeaWithSkill(ideaData)
      const containerMapAI = mapSkillToContainers(result)
      const supabase = createClient()

      await Promise.all(
        Object.entries(containerMapAI).map(([type, data]) =>
          supabase.from('container_analyses').upsert({
            idea_id: idea.id,
            container_type: type,
            score: data.score,
            approved: data.approved,
            answers: data.answers,
          }, { onConflict: 'idea_id,container_type' })
        )
      )

      const newAiScore = result.total_score
      setAiScore(newAiScore)

      const combined = calculateCombinedScore(manualScore, newAiScore)
      await supabase.from('ideas').update({ score: combined }).eq('id', idea.id)
      setIdea(prev => ({ ...prev, score: combined }))

      if (result.behavioral_alert.detected) {
        setBehavioralAlert(result.behavioral_alert)
        toast.warning('Concorrência Comportamental detectada', {
          description: result.behavioral_alert.signals.join(', '),
        })
      } else {
        setBehavioralAlert(null)
      }

      toast.success(`Análise completa — Score IA: ${newAiScore}/100`)
      await refresh()
    } catch {
      toast.error('Análise com IA falhou. Tente novamente ou preencha manualmente.')
    } finally {
      setAnalyzingAll(false)
      setAnalyzingContainers(new Set())
    }
  }

  // Score breakdown (manual)
  const breakdown = [
    { label: 'Retenção potencial', value: ((idea.retention_potential ?? 0) / 10) * 25, max: 25, color: '#10B981' },
    { label: 'Frequência da dor', value: { daily: 20, weekly: 15, monthly: 8, rarely: 2 }[idea.pain_frequency ?? 'rarely'] ?? 0, max: 20, color: '#6366F1' },
    { label: 'Recorrência (monetização)', value: { high: 20, medium: 13, low: 6 }[idea.recurrence ?? 'low'] ?? 0, max: 20, color: '#22C55E' },
    { label: 'Distribuição (inverso)', value: ((10 - (idea.distribution_difficulty ?? 5)) / 10) * 15, max: 15, color: '#F59E0B' },
    { label: 'Intensidade da dor', value: ((idea.pain_intensity ?? 0) / 10) * 10, max: 10, color: '#EF4444' },
    { label: 'Complexidade (inverso)', value: ((10 - (idea.complexity ?? 5)) / 10) * 5, max: 5, color: '#8B5CF6' },
    { label: 'Risco (inverso)', value: ((10 - (idea.risk ?? 5)) / 10) * 5, max: 5, color: '#EC4899' },
  ]

  // Get behavioral alert from existing containers if present
  const existingBehaviorContainer = containerMap['behavior']
  const storedBehavioralAlert = (existingBehaviorContainer?.answers as Record<string, unknown> | undefined)?.behavioral_alert as BehavioralAlert | undefined
  const activeBehavioralAlert = behavioralAlert ?? (storedBehavioralAlert?.detected ? storedBehavioralAlert : null)

  const aiVerdict = aiScore !== null ? getSkillVerdict(aiScore) : null

  return (
    <div className="flex flex-col h-full">
      <Header
        title={idea.name}
        breadcrumb="Ideias"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openIdeaForm(idea.id)}
              className="h-8 text-[#A1A1AA] hover:text-[#FAFAFA] text-[12px] gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchive}
              className="h-8 text-[#A1A1AA] hover:text-[#F59E0B] text-[12px] gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" /> Arquivar
            </Button>
            {nextStage && (
              <Button
                size="sm"
                onClick={handleAdvancePipeline}
                className="h-8 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[12px] gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Avançar para {PIPELINE_STAGE_LABELS[nextStage]}
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex gap-6 max-w-[1200px]">
          {/* Left column (60%) */}
          <motion.div
            className="flex-[3] min-w-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Meta row */}
            <div className="flex items-center gap-3 mb-6">
              <ScoreGauge score={combinedScore} size={56} strokeWidth={4} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge stage={idea.pipeline_stage} />
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: scoreClass.color }}
                  >
                    {scoreClass.emoji} {scoreClass.label}
                  </span>
                </div>
                {/* Dual scores */}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[#3B82F6]">
                    Manual: {manualScore.toFixed(0)}/100
                  </span>
                  {aiScore !== null && (
                    <>
                      <span className="text-[#3F3F46]">|</span>
                      <span className="text-[11px] text-violet-400">
                        IA: {aiScore}/100
                      </span>
                      {aiVerdict && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 h-4"
                          style={{ backgroundColor: aiVerdict.color + '20', color: aiVerdict.color, borderColor: aiVerdict.color + '40' }}
                        >
                          {aiVerdict.label}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                {idea.target_segment && (
                  <p className="text-[12px] text-[#52525B] mt-0.5">{idea.target_segment}</p>
                )}
                {idea.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {idea.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="bg-[#18181B] text-[#52525B] text-[10px] px-1.5 py-0.5">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview">
              <TabsList className="bg-[#18181B] border border-[#27272A] mb-5 h-9">
                <TabsTrigger value="overview" className="text-[12px] data-[state=active]:bg-[#27272A] data-[state=active]:text-[#FAFAFA]">
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="containers" className="text-[12px] data-[state=active]:bg-[#27272A] data-[state=active]:text-[#FAFAFA]">
                  Containers ({containers.filter(c => c.approved !== null).length}/8)
                </TabsTrigger>
                <TabsTrigger value="history" className="text-[12px] data-[state=active]:bg-[#27272A] data-[state=active]:text-[#FAFAFA]">
                  Histórico
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-5">
                <Section title="O Problema">
                  <DataGrid>
                    <DataItem label="Dor principal" value={idea.main_pain} />
                    <DataItem label="Segmento" value={idea.target_segment} />
                    <DataItem label="Frequência" value={idea.pain_frequency ? { daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal', rarely: 'Raramente' }[idea.pain_frequency] : null} />
                    <DataItem label="Intensidade" value={idea.pain_intensity != null ? `${idea.pain_intensity}/10` : null} />
                    <DataItem label="Recorrência" value={idea.recurrence ? { high: 'Alta', medium: 'Média', low: 'Baixa' }[idea.recurrence] : null} />
                    <DataItem label="Mercado" value={idea.market_size} />
                  </DataGrid>
                </Section>

                <Section title="Avaliação">
                  <DataGrid>
                    <DataItem label="Retenção potencial" value={idea.retention_potential != null ? `${idea.retention_potential}/10` : null} />
                    <DataItem label="Distribuição" value={idea.distribution_difficulty != null ? `${idea.distribution_difficulty}/10` : null} />
                    <DataItem label="Complexidade" value={idea.complexity != null ? `${idea.complexity}/10` : null} />
                    <DataItem label="Risco" value={idea.risk != null ? `${idea.risk}/10` : null} />
                    <DataItem label="Concorrência" value={idea.competition_level ? { none: 'Nenhuma', low: 'Baixa', medium: 'Média', high: 'Alta', saturated: 'Saturada' }[idea.competition_level] : null} />
                  </DataGrid>
                </Section>

                {(idea.monetization_notes || idea.observations || idea.insights) && (
                  <Section title="Notas">
                    {idea.monetization_notes && <NoteBlock label="Monetização" text={idea.monetization_notes} />}
                    {idea.observations && <NoteBlock label="Observações" text={idea.observations} />}
                    {idea.insights && <NoteBlock label="Insights" text={idea.insights} />}
                  </Section>
                )}
              </TabsContent>

              {/* Containers Tab */}
              <TabsContent value="containers">
                {/* Behavioral alert */}
                {activeBehavioralAlert && <BehavioralAlertBanner alert={activeBehavioralAlert} />}

                {/* Analyze all button */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[12px] text-[#52525B]">
                    {containers.filter(c => c.approved !== null).length}/8 containers analisados
                  </p>
                  <Button
                    onClick={handleAnalyzeAll}
                    disabled={analyzingAll}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-[12px] gap-1.5 h-8"
                  >
                    {analyzingAll ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {analyzingAll ? 'Analisando...' : '⚡ Analisar todos com IA'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {CONTAINER_CONFIGS.map((config) => (
                    <ContainerCard
                      key={config.type}
                      ideaId={idea.id}
                      ideaData={ideaData}
                      config={config}
                      analysis={containerMap[config.type] ?? null}
                      aiLoading={analyzingContainers.has(config.type)}
                      onSaved={refresh}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                {events.length === 0 ? (
                  <p className="text-[13px] text-[#52525B] py-8 text-center">Nenhum evento de pipeline registrado</p>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 py-3 border-b border-[#27272A] last:border-0">
                        <div className="w-7 h-7 rounded-full bg-[#18181B] flex items-center justify-center shrink-0 mt-0.5">
                          <ChevronRight className="w-3.5 h-3.5 text-[#52525B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-[#FAFAFA]">
                            {event.from_stage ? PIPELINE_STAGE_LABELS[event.from_stage] : 'Criação'}{' '}
                            <span className="text-[#52525B]">→</span>{' '}
                            {event.to_stage ? PIPELINE_STAGE_LABELS[event.to_stage] : '?'}
                          </p>
                          {event.notes && <p className="text-[12px] text-[#52525B] mt-0.5">{event.notes}</p>}
                        </div>
                        <span className="text-[11px] text-[#52525B] shrink-0">
                          {format(new Date(event.created_at), "d 'de' MMM", { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Right column (40%) */}
          <motion.div
            className="flex-[2] min-w-0 space-y-4"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            {/* Score breakdown */}
            <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider mb-4">Score Breakdown</p>
              <div className="space-y-3">
                {breakdown.map((b) => (
                  <ScoreBreakdownRow key={b.label} {...b} />
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[#27272A] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#3B82F6]">Score Manual</span>
                  <span className="text-[12px] font-semibold text-[#3B82F6]">{manualScore.toFixed(1)}</span>
                </div>
                {aiScore !== null && (
                  <div className="flex justify-between">
                    <span className="text-[11px] text-violet-400">Score IA</span>
                    <span className="text-[12px] font-semibold text-violet-400">{aiScore}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-[#27272A]">
                  <span className="text-[12px] text-[#A1A1AA]">Score Combinado</span>
                  <span className="text-[14px] font-semibold" style={{ color: scoreClass.color }}>
                    {combinedScore.toFixed(0)} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Container status */}
            <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider mb-4">Containers</p>
              <div className="space-y-2">
                {CONTAINER_CONFIGS.map((config) => {
                  const analysis = containerMap[config.type as ContainerType]
                  const status = !analysis ? 'pending' : analysis.approved ? 'approved' : 'rejected'
                  const isAI = !!(analysis?.answers as Record<string, unknown> | undefined)?.ai_analyzed
                  return (
                    <div key={config.type} className="flex items-center gap-2.5">
                      <span className="text-base w-6 shrink-0">{config.icon}</span>
                      <span className="text-[12px] text-[#A1A1AA] flex-1">{config.label}</span>
                      {isAI && <Sparkles className="w-3 h-3 text-violet-400" />}
                      <span className="text-[11px]" style={{ color: status === 'approved' ? '#22C55E' : status === 'rejected' ? '#EF4444' : '#52525B' }}>
                        {status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <IdeaForm onSuccess={refresh} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4">
      <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  )
}

function DataGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function DataItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] text-[#52525B] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[13px] text-[#FAFAFA]">{value}</p>
    </div>
  )
}

function NoteBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[10px] text-[#52525B] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[13px] text-[#A1A1AA] leading-relaxed">{text}</p>
    </div>
  )
}
