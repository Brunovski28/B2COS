import type { Idea, ContainerAnalysis, PipelineStage } from '@/types'

interface GateCheckResult {
  canAdvance: boolean
  blockers: string[]
}

type ContainerMap = Partial<Record<string, ContainerAnalysis>>

function getApproved(containers: ContainerMap, type: string): boolean {
  return containers[type]?.approved === true
}

export function checkGate(
  idea: Idea,
  containers: ContainerMap,
  targetStage: PipelineStage
): GateCheckResult {
  const blockers: string[] = []

  switch (targetStage) {
    case 'triage': {
      if (!idea.name) blockers.push('Nome da ideia obrigatório')
      if (!idea.description) blockers.push('Descrição obrigatória')
      if (!idea.main_pain) blockers.push('Dor principal obrigatória')
      break
    }
    case 'validation': {
      if (idea.score < 50) blockers.push('Score mínimo: 50 (atual: ' + idea.score + ')')
      if (!idea.pain_intensity || idea.pain_intensity < 5) blockers.push('Intensidade da dor mínima: 5')
      if (!idea.pain_frequency) blockers.push('Frequência da dor obrigatória')
      if (!idea.retention_potential) blockers.push('Retenção potencial obrigatória')
      if (!getApproved(containers, 'discovery')) blockers.push('Container Descoberta precisa ser aprovado')
      break
    }
    case 'mvp': {
      if (!getApproved(containers, 'validation')) blockers.push('Container Validação precisa ser aprovado')
      if (!getApproved(containers, 'behavior')) blockers.push('Container Comportamento precisa ser aprovado')
      if (idea.score < 60) blockers.push('Score mínimo: 60 (atual: ' + idea.score + ')')
      const valAnswers = containers['validation']?.answers as Record<string, unknown> | undefined
      const signals = Number(valAnswers?.interviews_count ?? 0)
      if (signals < 3) blockers.push('Mínimo 3 sinais reais de validação')
      break
    }
    case 'launch': {
      if (!getApproved(containers, 'mvp')) blockers.push('Container MVP precisa ser aprovado')
      if (!getApproved(containers, 'monetization')) blockers.push('Container Monetização precisa ter score ≥ 60')
      break
    }
    case 'retention': {
      blockers.push('Necessário pelo menos 7 dias de dados reais e D1 registrado')
      break
    }
    case 'monetization': {
      if (!getApproved(containers, 'retention')) blockers.push('Container Retenção precisa ser aprovado')
      blockers.push('D7 ≥ 15% necessário (registre em Métricas)')
      break
    }
    case 'scale': {
      blockers.push('MRR > 0 registrado, Churn < 8%, LTV/CAC ≥ 3 necessários')
      if (!getApproved(containers, 'scale')) blockers.push('Container Escala precisa ser aprovado')
      if (!getApproved(containers, 'monetization')) blockers.push('Container Monetização score ≥ 70')
      break
    }
  }

  return { canAdvance: blockers.length === 0, blockers }
}

export function getNextStage(current: PipelineStage): PipelineStage | null {
  const stages: PipelineStage[] = [
    'epiphany', 'triage', 'validation', 'mvp',
    'launch', 'retention', 'monetization', 'scale'
  ]
  const idx = stages.indexOf(current)
  if (idx === -1 || idx === stages.length - 1) return null
  return stages[idx + 1]
}
