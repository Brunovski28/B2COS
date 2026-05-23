export type PipelineStage =
  | 'epiphany'
  | 'triage'
  | 'validation'
  | 'mvp'
  | 'launch'
  | 'retention'
  | 'monetization'
  | 'scale'

export type ContainerType =
  | 'discovery'
  | 'validation'
  | 'retention'
  | 'distribution'
  | 'mvp'
  | 'monetization'
  | 'scale'
  | 'behavior'

export type IdeaStatus = 'active' | 'archived' | 'discarded'

export type PainFrequency = 'daily' | 'weekly' | 'monthly' | 'rarely'

export type RecurrenceLevel = 'high' | 'medium' | 'low'

export type CompetitionLevel = 'none' | 'low' | 'medium' | 'high' | 'saturated'

export interface Idea {
  id: string
  name: string
  description: string | null
  main_pain: string | null
  pain_frequency: PainFrequency | null
  pain_intensity: number | null
  recurrence: RecurrenceLevel | null
  retention_potential: number | null
  distribution_difficulty: number | null
  monetization_notes: string | null
  competition_level: CompetitionLevel | null
  complexity: number | null
  risk: number | null
  target_segment: string | null
  market_size: string | null
  observations: string | null
  insights: string | null
  score: number
  status: IdeaStatus
  pipeline_stage: PipelineStage
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ContainerAnalysis {
  id: string
  idea_id: string
  container_type: ContainerType
  score: number | null
  approved: boolean | null
  answers: Record<string, unknown>
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PipelineEvent {
  id: string
  idea_id: string
  from_stage: PipelineStage | null
  to_stage: PipelineStage | null
  notes: string | null
  blocked: boolean
  created_at: string
}

export interface ScoreClassification {
  label: string
  color: string
  bgColor: string
  emoji: string
}

export interface ContainerScoreResult {
  score: number
  approved: boolean
}

export interface ContainerConfig {
  type: ContainerType
  label: string
  icon: string
  color: string
  description: string
}

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  epiphany: 'Epifania',
  triage: 'Triagem',
  validation: 'Validação',
  mvp: 'MVP',
  launch: 'Lançamento',
  retention: 'Retenção',
  monetization: 'Monetização',
  scale: 'Escala',
}

export const PIPELINE_STAGE_COLORS: Record<PipelineStage, string> = {
  epiphany: '#52525B',
  triage: '#3B82F6',
  validation: '#8B5CF6',
  mvp: '#6366F1',
  launch: '#F59E0B',
  retention: '#10B981',
  monetization: '#22C55E',
  scale: '#EC4899',
}

export const CONTAINER_CONFIGS: ContainerConfig[] = [
  { type: 'discovery', label: 'Descoberta', icon: '🔍', color: '#8B5CF6', description: 'Valida se a dor é real e intensa' },
  { type: 'validation', label: 'Validação', icon: '🧪', color: '#3B82F6', description: 'Distingue interesse de curiosidade' },
  { type: 'retention', label: 'Retenção', icon: '🔄', color: '#10B981', description: 'Potencial de hábito do produto' },
  { type: 'distribution', label: 'Distribuição', icon: '📡', color: '#F59E0B', description: 'Crescimento orgânico e escalável' },
  { type: 'mvp', label: 'MVP', icon: '🛠️', color: '#6366F1', description: 'Menor escopo para testar hipótese' },
  { type: 'monetization', label: 'Monetização', icon: '💰', color: '#22C55E', description: 'Validação do modelo financeiro' },
  { type: 'scale', label: 'Escala', icon: '🚀', color: '#EC4899', description: 'Crescimento sem dependência linear' },
  { type: 'behavior', label: 'Comportamento', icon: '🧠', color: '#EF4444', description: 'Alinhamento psicológico real' },
]
