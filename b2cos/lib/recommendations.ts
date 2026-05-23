import type { Idea, ContainerAnalysis, PipelineEvent } from '@/types'
import { differenceInDays } from 'date-fns'

export interface Recommendation {
  id: string
  priority: number
  message: string
  ideaId: string
  ideaName: string
}

interface RecommendationInput {
  ideas: Idea[]
  containers: ContainerAnalysis[]
  events: PipelineEvent[]
}

const STAGE_REQUIRED_CONTAINERS: Record<string, string[]> = {
  validation: ['discovery'],
  mvp: ['validation', 'behavior'],
  launch: ['mvp', 'monetization'],
  retention: ['mvp', 'monetization'],
  monetization: ['retention'],
  scale: ['scale', 'monetization'],
}

const CONTAINER_LABELS: Record<string, string> = {
  discovery: 'Descoberta', validation: 'Validação', retention: 'Retenção',
  distribution: 'Distribuição', mvp: 'MVP', monetization: 'Monetização',
  scale: 'Escala', behavior: 'Comportamento',
}

export function generateRecommendations({ ideas, containers, events }: RecommendationInput): Recommendation[] {
  const recs: Recommendation[] = []
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

  for (const idea of ideas) {
    if (idea.status !== 'active') continue

    const ideaContainers = containerMap.get(idea.id) ?? []
    const approvedTypes = new Set(ideaContainers.filter(c => c.approved).map(c => c.container_type))
    const required = STAGE_REQUIRED_CONTAINERS[idea.pipeline_stage] ?? []

    // Missing required containers for current stage
    for (const containerType of required) {
      if (!approvedTypes.has(containerType as never)) {
        const label = CONTAINER_LABELS[containerType] ?? containerType
        recs.push({
          id: `complete-container-${idea.id}-${containerType}`,
          priority: idea.score >= 60 ? 1 : 2,
          message: `Completar container ${label} de "${idea.name}" (score ${idea.score}, bloqueado)`,
          ideaId: idea.id,
          ideaName: idea.name,
        })
        break
      }
    }

    // Ideas stuck without movement for 7+ days
    const lastEvent = lastEventByIdea.get(idea.id)
    const reference = lastEvent ?? new Date(idea.updated_at)
    const daysSince = differenceInDays(now, reference)
    if (daysSince >= 7) {
      recs.push({
        id: `stuck-${idea.id}`,
        priority: 3,
        message: `Registrar dados de "${idea.name}" (${daysSince} dias sem movimento)`,
        ideaId: idea.id,
        ideaName: idea.name,
      })
    }

    // Ideas in monetization/scale stage without monetization notes
    if (['monetization', 'scale'].includes(idea.pipeline_stage) && !idea.monetization_notes) {
      recs.push({
        id: `monetization-notes-${idea.id}`,
        priority: 2,
        message: `Preencher notas de monetização de "${idea.name}" (está em ${idea.pipeline_stage})`,
        ideaId: idea.id,
        ideaName: idea.name,
      })
    }
  }

  recs.sort((a, b) => a.priority - b.priority)

  const seen = new Set<string>()
  return recs.filter(r => {
    if (seen.has(r.ideaId + r.priority)) return false
    seen.add(r.ideaId + r.priority)
    return true
  }).slice(0, 5)
}
