import type { Idea, PipelineEvent, ContainerAnalysis } from '@/types'
import { differenceInDays, differenceInHours } from 'date-fns'

export type AlertType = 'danger' | 'warning' | 'info' | 'success'

export interface Alert {
  id: string
  type: AlertType
  message: string
  ideaId?: string
  ideaName?: string
  createdAt: Date
}

interface AlertInput {
  ideas: Idea[]
  events: PipelineEvent[]
  containers: ContainerAnalysis[]
}

export function generateAlerts({ ideas, events, containers }: AlertInput): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()

  const containerMap = new Map<string, ContainerAnalysis[]>()
  for (const c of containers) {
    const list = containerMap.get(c.idea_id) ?? []
    list.push(c)
    containerMap.set(c.idea_id, list)
  }

  const lastEventByIdea = new Map<string, Date>()
  for (const ev of events) {
    const d = new Date(ev.created_at)
    const existing = lastEventByIdea.get(ev.idea_id)
    if (!existing || d > existing) lastEventByIdea.set(ev.idea_id, d)
  }

  // Ideias travadas há +7 dias no mesmo stage
  const stuckByStage = new Map<string, number>()
  for (const idea of ideas) {
    if (idea.status !== 'active') continue
    const lastEvent = lastEventByIdea.get(idea.id)
    const referenceDate = lastEvent ?? new Date(idea.updated_at)
    if (differenceInDays(now, referenceDate) >= 7) {
      const key = idea.pipeline_stage
      stuckByStage.set(key, (stuckByStage.get(key) ?? 0) + 1)
    }
  }
  for (const [stage, count] of stuckByStage.entries()) {
    if (count > 0) {
      const stageLabel: Record<string, string> = {
        epiphany: 'Epifania', triage: 'Triagem', validation: 'Validação',
        mvp: 'MVP', launch: 'Lançamento', retention: 'Retenção',
        monetization: 'Monetização', scale: 'Escala',
      }
      alerts.push({
        id: `stuck-${stage}`,
        type: 'danger',
        message: `${count} ideia${count > 1 ? 's' : ''} travada${count > 1 ? 's' : ''} há +7 dias em ${stageLabel[stage] ?? stage}`,
        createdAt: now,
      })
    }
  }

  // Ideia com score alto mas containers críticos pendentes
  const criticalContainers = ['discovery', 'validation', 'behavior', 'mvp', 'monetization']
  for (const idea of ideas) {
    if (idea.status !== 'active' || idea.score < 60) continue
    const ideaContainers = containerMap.get(idea.id) ?? []
    const approvedTypes = new Set(ideaContainers.filter(c => c.approved).map(c => c.container_type))
    const missing = criticalContainers.filter(t => !approvedTypes.has(t as never))
    if (missing.length > 0) {
      alerts.push({
        id: `pending-container-${idea.id}`,
        type: 'warning',
        message: `"${idea.name}" tem score ${idea.score} mas container ${missing[0]} pendente`,
        ideaId: idea.id,
        ideaName: idea.name,
        createdAt: now,
      })
    }
  }

  // Funil vazio em etapas importantes
  const importantStages = ['validation', 'mvp', 'launch']
  const stageCount = new Map<string, number>()
  for (const idea of ideas) {
    if (idea.status === 'active') {
      stageCount.set(idea.pipeline_stage, (stageCount.get(idea.pipeline_stage) ?? 0) + 1)
    }
  }
  for (const stage of importantStages) {
    if (!stageCount.has(stage)) {
      const label: Record<string, string> = { validation: 'Validação', mvp: 'MVP', launch: 'Lançamento' }
      alerts.push({
        id: `empty-stage-${stage}`,
        type: 'info',
        message: `Nenhuma ideia na fase ${label[stage] ?? stage}`,
        createdAt: now,
      })
    }
  }

  // Avanços recentes (últimas 48h) — positivos
  const recentEvents = events.filter(ev => {
    const d = new Date(ev.created_at)
    return differenceInHours(now, d) <= 48 && !ev.blocked && ev.to_stage
  })
  for (const ev of recentEvents.slice(0, 2)) {
    const idea = ideas.find(i => i.id === ev.idea_id)
    if (!idea) continue
    const stageLabel: Record<string, string> = {
      epiphany: 'Epifania', triage: 'Triagem', validation: 'Validação',
      mvp: 'MVP', launch: 'Lançamento', retention: 'Retenção',
      monetization: 'Monetização', scale: 'Escala',
    }
    alerts.push({
      id: `advance-${ev.id}`,
      type: 'success',
      message: `"${idea.name}" avançou para ${stageLabel[ev.to_stage ?? ''] ?? ev.to_stage} recentemente`,
      ideaId: idea.id,
      ideaName: idea.name,
      createdAt: new Date(ev.created_at),
    })
  }

  return alerts.slice(0, 8)
}
