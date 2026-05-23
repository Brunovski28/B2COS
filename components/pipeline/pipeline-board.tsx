'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { checkGate } from '@/lib/pipeline-rules'
import { PipelineColumn } from './pipeline-column'
import { GateDialog } from './gate-dialog'
import type { Idea, ContainerAnalysis, PipelineStage } from '@/types'
import { PIPELINE_STAGE_LABELS } from '@/types'
import { toast } from 'sonner'

const STAGES: PipelineStage[] = [
  'epiphany', 'triage', 'validation', 'mvp',
  'launch', 'retention', 'monetization', 'scale',
]

interface PipelineBoardProps {
  initialIdeas: Idea[]
  containers: ContainerAnalysis[]
  minScore?: number
}

interface GateBlock {
  ideaId: string
  ideaName: string
  targetStage: PipelineStage
  blockers: string[]
}

export function PipelineBoard({ initialIdeas, containers, minScore = 0 }: PipelineBoardProps) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [gateBlock, setGateBlock] = useState<GateBlock | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const containersByIdea = new Map<string, ContainerAnalysis[]>()
  for (const c of containers) {
    const list = containersByIdea.get(c.idea_id) ?? []
    list.push(c)
    containersByIdea.set(c.idea_id, list)
  }

  const containerMap = new Map<string, ContainerAnalysis>()
  for (const c of containers) {
    containerMap.set(`${c.idea_id}:${c.container_type}`, c)
  }

  const filteredIdeas = ideas.filter(i => i.status === 'active' && i.score >= minScore)

  const ideasByStage = new Map<PipelineStage, Idea[]>()
  for (const stage of STAGES) ideasByStage.set(stage, [])
  for (const idea of filteredIdeas) {
    ideasByStage.get(idea.pipeline_stage)?.push(idea)
  }

  const blockedIds = new Set<string>()
  for (const idea of filteredIdeas) {
    const stageIdx = STAGES.indexOf(idea.pipeline_stage)
    if (stageIdx < STAGES.length - 1) {
      const nextStage = STAGES[stageIdx + 1]
      const ideaContainers = Object.fromEntries(
        (containersByIdea.get(idea.id) ?? []).map(c => [c.container_type, c])
      )
      const { canAdvance } = checkGate(idea, ideaContainers, nextStage)
      if (!canAdvance) blockedIds.add(idea.id)
    }
  }

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const ideaId = String(active.id)
    const idea = ideas.find(i => i.id === ideaId)
    if (!idea) return

    // Determine target stage — over can be a column (stage) or another idea
    let targetStage: PipelineStage | null = null
    if (STAGES.includes(over.id as PipelineStage)) {
      targetStage = over.id as PipelineStage
    } else {
      const targetIdea = ideas.find(i => i.id === over.id)
      if (targetIdea) targetStage = targetIdea.pipeline_stage
    }

    if (!targetStage || targetStage === idea.pipeline_stage) return

    const ideaContainers = Object.fromEntries(
      (containersByIdea.get(ideaId) ?? []).map(c => [c.container_type, c])
    )
    const { canAdvance, blockers } = checkGate(idea, ideaContainers, targetStage)

    if (!canAdvance) {
      setGateBlock({ ideaId, ideaName: idea.name, targetStage, blockers })
      return
    }

    // Optimistic update
    const previousStage = idea.pipeline_stage
    setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, pipeline_stage: targetStage! } : i))

    const supabase = createClient()
    const { error } = await supabase
      .from('ideas')
      .update({ pipeline_stage: targetStage, updated_at: new Date().toISOString() })
      .eq('id', ideaId)

    if (error) {
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, pipeline_stage: previousStage } : i))
      toast.error('Erro ao mover ideia')
      return
    }

    await supabase.from('pipeline_events').insert({
      idea_id: ideaId,
      from_stage: previousStage,
      to_stage: targetStage,
      notes: 'Movido manualmente via Pipeline',
      blocked: false,
    })

    toast.success(`"${idea.name}" movida para ${PIPELINE_STAGE_LABELS[targetStage]}`)
  }, [ideas, containersByIdea])

  const activeIdea = activeId ? ideas.find(i => i.id === activeId) : null

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {STAGES.map(stage => (
            <PipelineColumn
              key={stage}
              stage={stage}
              ideas={ideasByStage.get(stage) ?? []}
              containersByIdea={containersByIdea}
              blockedIds={blockedIds}
              onAddIdea={() => {
                // Redirect to ideas page — create form doesn't live in pipeline
                window.location.href = `/ideas?create=true&stage=${stage}`
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeIdea && (
            <div className="rounded-lg border border-[#6366F1] bg-[#111113] p-3 w-[264px] opacity-90 shadow-2xl">
              <span className="text-[13px] font-semibold text-[#FAFAFA]">{activeIdea.name}</span>
              <div className="mt-1 text-[11px] font-semibold" style={{ color: getScoreColor(activeIdea.score) }}>
                {activeIdea.score} pts
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {gateBlock && (
        <GateDialog
          open
          onClose={() => setGateBlock(null)}
          ideaId={gateBlock.ideaId}
          ideaName={gateBlock.ideaName}
          targetStage={gateBlock.targetStage}
          blockers={gateBlock.blockers}
        />
      )}
    </>
  )
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#3B82F6'
  if (score >= 40) return '#F59E0B'
  if (score >= 20) return '#F97316'
  return '#EF4444'
}
