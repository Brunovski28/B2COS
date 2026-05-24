import type { Idea, ScoreClassification } from '@/types'
import type { SkillAnalysisResult } from '@/lib/ai/skill'

export function calculateIdeaScore(idea: Partial<Idea>): number {
  let score = 0

  // Retenção potencial (25%) — valor / 10 * 25
  if (idea.retention_potential != null) {
    score += (idea.retention_potential / 10) * 25
  }

  // Frequência da dor (20%) — daily=20, weekly=15, monthly=8, rarely=2
  const freqMap: Record<string, number> = {
    daily: 20,
    weekly: 15,
    monthly: 8,
    rarely: 2,
  }
  if (idea.pain_frequency) {
    score += freqMap[idea.pain_frequency] ?? 0
  }

  // Monetização/Recorrência (20%) — high=20, medium=13, low=6
  const recurrenceMap: Record<string, number> = {
    high: 20,
    medium: 13,
    low: 6,
  }
  if (idea.recurrence) {
    score += recurrenceMap[idea.recurrence] ?? 0
  }

  // Distribuição (15%) — (10 - valor) / 10 * 15 (invertido, 1=fácil)
  if (idea.distribution_difficulty != null) {
    score += ((10 - idea.distribution_difficulty) / 10) * 15
  }

  // Comportamento humano (10%) — valor / 10 * 10
  if (idea.pain_intensity != null) {
    score += (idea.pain_intensity / 10) * 10
  }

  // Complexidade inverso (5%) — (10 - valor) / 10 * 5
  if (idea.complexity != null) {
    score += ((10 - idea.complexity) / 10) * 5
  }

  // Risco inverso (5%) — (10 - valor) / 10 * 5
  if (idea.risk != null) {
    score += ((10 - idea.risk) / 10) * 5
  }

  return Math.round(Math.min(100, Math.max(0, score)) * 10) / 10
}

export function getScoreClassification(score: number): ScoreClassification {
  if (score >= 80) {
    return { label: 'Oportunidade crítica', color: '#22C55E', bgColor: 'rgba(34,197,94,0.1)', emoji: '🔥' }
  }
  if (score >= 60) {
    return { label: 'Alta prioridade', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.1)', emoji: '✅' }
  }
  if (score >= 40) {
    return { label: 'Potencial moderado', color: '#F59E0B', bgColor: 'rgba(245,158,11,0.1)', emoji: '⚠️' }
  }
  if (score >= 20) {
    return { label: 'Baixo potencial', color: '#F97316', bgColor: 'rgba(249,115,22,0.1)', emoji: '🔻' }
  }
  return { label: 'Descartar', color: '#EF4444', bgColor: 'rgba(239,68,68,0.1)', emoji: '❌' }
}

export function getScoreColor(score: number): string {
  return getScoreClassification(score).color
}

export function calculateCombinedScore(
  manualScore: number | null,
  aiScore: number | null
): number {
  if (manualScore !== null && aiScore !== null) {
    return Math.round(manualScore * 0.4 + aiScore * 0.6)
  }
  return manualScore ?? aiScore ?? 0
}

export function getSkillScoreFromAnalysis(result: SkillAnalysisResult): number {
  return result.total_score
}

export function getSkillVerdict(score: number): { label: string; color: string; description: string } {
  if (score >= 80) return { label: 'Aprovada', color: '#22C55E', description: 'Alta viabilidade, vale aprofundar' }
  if (score >= 60) return { label: 'Condicional', color: '#F59E0B', description: 'Validar hipóteses específicas antes de construir' }
  if (score >= 40) return { label: 'Risco Alto', color: '#F97316', description: 'Reavaliar modelo, nicho ou público-alvo' }
  return { label: 'Reprovada', color: '#EF4444', description: 'Ideia não sustenta viabilidade de mercado atual' }
}
