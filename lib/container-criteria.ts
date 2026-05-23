import type { ContainerType, ContainerScoreResult } from '@/types'

// ── Container 1: Descoberta ──────────────────────────────────────────────────
function scoreDiscovery(answers: Record<string, unknown>): ContainerScoreResult {
  let score = 0

  // Intensidade da dor (1–10) → valor * 10 — capped at 100 contribution weighted
  const intensity = Number(answers.pain_intensity ?? 0)
  score += Math.min(intensity, 10) * 10 // 0–100 base, will normalize

  // Busca ativa: Sim=30 / Às vezes=15 / Não=0
  const seeksSolution: Record<string, number> = { yes: 30, sometimes: 15, no: 0 }
  score += seeksSolution[String(answers.seeks_solution ?? 'no')] ?? 0

  // Frequência: Diária=40 / Semanal=25 / Mensal=10 / Raramente=0
  const freqPoints: Record<string, number> = { daily: 40, weekly: 25, monthly: 10, rarely: 0 }
  score += freqPoints[String(answers.pain_frequency ?? 'rarely')] ?? 0

  // Custo da dor: Alto=20 / Médio=10 / Baixo=0
  const costPoints: Record<string, number> = { high: 20, medium: 10, low: 0 }
  score += costPoints[String(answers.pain_cost ?? 'low')] ?? 0

  // Segmento definido: Claro=10 / Vago=3 / Indefinido=0
  const segmentPoints: Record<string, number> = { clear: 10, vague: 3, undefined: 0 }
  score += segmentPoints[String(answers.segment_clarity ?? 'undefined')] ?? 0

  // Normalizar: max teórico = 100 + 30 + 40 + 20 + 10 = 200 → normalize to 100
  const normalized = Math.round(Math.min(100, (score / 200) * 100))

  const intensity_val = Number(answers.pain_intensity ?? 0)
  const freq = String(answers.pain_frequency ?? 'rarely')
  const seeks = String(answers.seeks_solution ?? 'no')
  const approved = intensity_val >= 7 && (freq === 'daily' || freq === 'weekly') && seeks === 'yes'

  return { score: normalized, approved }
}

// ── Container 2: Validação ───────────────────────────────────────────────────
function scoreValidation(answers: Record<string, unknown>): ContainerScoreResult {
  let score = 0

  // Entrevistas: ≥10=30 / 5–9=20 / 1–4=10 / 0=0
  const interviews = Number(answers.interviews_count ?? 0)
  if (interviews >= 10) score += 30
  else if (interviews >= 5) score += 20
  else if (interviews >= 1) score += 10

  // Fake door: com dados=35 / criada sem dados=15 / Não=0
  const fakeDoorPoints: Record<string, number> = { with_data: 35, without_data: 15, no: 0 }
  score += fakeDoorPoints[String(answers.fake_door ?? 'no')] ?? 0

  // CTR/waitlist: >15%=25 / 5–15%=15 / <5%=5 / sem dados=0
  const ctrPoints: Record<string, number> = { high: 25, medium: 15, low: 5, none: 0 }
  score += ctrPoints[String(answers.interest_rate ?? 'none')] ?? 0

  // Risco de viés: Baixo=10 / Médio=5 / Alto=0
  const biasPoints: Record<string, number> = { low: 10, medium: 5, high: 0 }
  score += biasPoints[String(answers.confirmation_bias ?? 'high')] ?? 0

  const normalized = Math.min(100, score)

  const hasInterviews = interviews >= 1
  const hasFakeDoor = String(answers.fake_door ?? 'no') === 'with_data'
  const approved = (hasInterviews && hasFakeDoor) || interviews >= 5

  return { score: normalized, approved }
}

// ── Container 3: Retenção ────────────────────────────────────────────────────
function scoreRetention(answers: Record<string, unknown>): ContainerScoreResult {
  let score = 0

  // Loop de habituação: Forte=30 / Fraco=15 / Nenhum=0
  const loopPoints: Record<string, number> = { strong: 30, weak: 15, none: 0 }
  score += loopPoints[String(answers.habit_loop ?? 'none')] ?? 0

  // D1 projetado: >40%=25 / 25–40%=15 / <25%=5
  const d1Points: Record<string, number> = { high: 25, medium: 15, low: 5 }
  score += d1Points[String(answers.d1_projected ?? 'low')] ?? 0

  // D7 projetado: >20%=25 / 10–20%=15 / <10%=5
  const d7Points: Record<string, number> = { high: 25, medium: 15, low: 5 }
  score += d7Points[String(answers.d7_projected ?? 'low')] ?? 0

  // D30 projetado: >10%=15 / 5–10%=10 / <5%=3
  const d30Points: Record<string, number> = { high: 15, medium: 10, low: 3 }
  score += d30Points[String(answers.d30_projected ?? 'low')] ?? 0

  // Custo de troca cresce: Sim=5 / Não=0
  score += answers.switching_cost === 'yes' ? 5 : 0

  const normalized = Math.min(100, score)

  const hasLoop = String(answers.habit_loop ?? 'none') !== 'none'
  const d30 = String(answers.d30_projected ?? 'low')
  const approved = hasLoop && d30 !== 'low'

  return { score: normalized, approved }
}

// ── Container 4: Distribuição ────────────────────────────────────────────────
function scoreDistribution(answers: Record<string, unknown>): ContainerScoreResult {
  let score = 0

  // Canal primário: Claro=30 / Hipótese=15 / Indefinido=0
  const channelPoints: Record<string, number> = { clear: 30, hypothesis: 15, undefined: 0 }
  score += channelPoints[String(answers.primary_channel ?? 'undefined')] ?? 0

  // Potencial SEO: Alto=25 / Médio=15 / Baixo=5 / Inexistente=0
  const seoPoints: Record<string, number> = { high: 25, medium: 15, low: 5, none: 0 }
  score += seoPoints[String(answers.seo_potential ?? 'none')] ?? 0

  // Viral: Alto=25 / Médio=15 / Baixo=5
  const viralPoints: Record<string, number> = { high: 25, medium: 15, low: 5 }
  score += viralPoints[String(answers.viral_potential ?? 'low')] ?? 0

  // CAC/LTV: Sim=20 / Incerto=8 / Não=0
  const cacPoints: Record<string, number> = { yes: 20, uncertain: 8, no: 0 }
  score += cacPoints[String(answers.cac_ltv_viable ?? 'no')] ?? 0

  const normalized = Math.min(100, score)

  const hasChannel = String(answers.primary_channel ?? 'undefined') !== 'undefined'
  const cacOk = String(answers.cac_ltv_viable ?? 'no') !== 'no'
  const approved = hasChannel && cacOk

  return { score: normalized, approved }
}

// ── Container 5: MVP ─────────────────────────────────────────────────────────
function scoreMvp(answers: Record<string, unknown>): ContainerScoreResult {
  let score = 0

  // Features: ≤3=30 / 4–5=15 / >5=0
  const featuresPoints: Record<string, number> = { few: 30, medium: 15, many: 0 }
  score += featuresPoints[String(answers.feature_count ?? 'many')] ?? 0

  // Tempo de build: <2sem=40 / 2–4sem=25 / 1–2meses=10 / >2meses=0
  const buildPoints: Record<string, number> = { under_2w: 40, under_4w: 25, under_2m: 10, over_2m: 0 }
  score += buildPoints[String(answers.build_time ?? 'over_2m')] ?? 0

  // Diferenciação: Sim=20 / Parcial=10 / Não=0
  const diffPoints: Record<string, number> = { yes: 20, partial: 10, no: 0 }
  score += diffPoints[String(answers.differentiator ?? 'no')] ?? 0

  // Hipótese testável: Sim=10 / Parcial=5 / Não=0
  const hypPoints: Record<string, number> = { yes: 10, partial: 5, no: 0 }
  score += hypPoints[String(answers.testable_hypothesis ?? 'no')] ?? 0

  const normalized = Math.min(100, score)

  const buildTime = String(answers.build_time ?? 'over_2m')
  const features = String(answers.feature_count ?? 'many')
  const hypothesis = String(answers.testable_hypothesis ?? 'no')
  const approved =
    (buildTime === 'under_2w' || buildTime === 'under_4w') &&
    (features === 'few' || features === 'medium') &&
    hypothesis !== 'no'

  return { score: normalized, approved }
}

// ── Container 6: Monetização ─────────────────────────────────────────────────
function scoreMonetization(answers: Record<string, unknown>): ContainerScoreResult {
  let score = 0

  // Modelo definido: Claro=30 / Hipótese=15 / Indefinido=0
  const modelPoints: Record<string, number> = { clear: 30, hypothesis: 15, undefined: 0 }
  score += modelPoints[String(answers.monetization_model ?? 'undefined')] ?? 0

  // LTV/CAC: ≥5:1=30 / 3–5:1=20 / 1–3:1=8 / <1:1=0
  const ltvcacPoints: Record<string, number> = { excellent: 30, good: 20, poor: 8, bad: 0 }
  score += ltvcacPoints[String(answers.ltv_cac_ratio ?? 'bad')] ?? 0

  // Recorrência: Mensal/anual=25 / Transacional=12 / One-time=5
  const recPoints: Record<string, number> = { subscription: 25, transactional: 12, one_time: 5 }
  score += recPoints[String(answers.payment_recurrence ?? 'one_time')] ?? 0

  // Payback: <6m=15 / 6–12m=10 / >12m=3
  const paybackPoints: Record<string, number> = { fast: 15, medium: 10, slow: 3 }
  score += paybackPoints[String(answers.payback_period ?? 'slow')] ?? 0

  const normalized = Math.min(100, score)

  const ltvcac = String(answers.ltv_cac_ratio ?? 'bad')
  const recurrence = String(answers.payment_recurrence ?? 'one_time')
  const approved = (ltvcac === 'excellent' || ltvcac === 'good') && recurrence !== 'one_time'

  return { score: normalized, approved }
}

// ── Container 7: Escala ──────────────────────────────────────────────────────
function scoreScale(answers: Record<string, unknown>): ContainerScoreResult {
  let score = 0

  // Automação: >80%=35 / 50–80%=20 / <50%=8
  const autoPoints: Record<string, number> = { high: 35, medium: 20, low: 8 }
  score += autoPoints[String(answers.automation_level ?? 'low')] ?? 0

  // Dependência do fundador: <20%=30 / 20–50%=15 / >50%=0
  const depPoints: Record<string, number> = { low: 30, medium: 15, high: 0 }
  score += depPoints[String(answers.founder_dependency ?? 'high')] ?? 0

  // Unit economics: Melhora=25 / Neutro=12 / Piora=0
  const econPoints: Record<string, number> = { improves: 25, neutral: 12, worsens: 0 }
  score += econPoints[String(answers.unit_economics ?? 'neutral')] ?? 0

  // Processos documentados: Sim=10 / Parcialmente=5 / Não=0
  const processPoints: Record<string, number> = { yes: 10, partial: 5, no: 0 }
  score += processPoints[String(answers.processes_documented ?? 'no')] ?? 0

  const normalized = Math.min(100, score)

  const automation = String(answers.automation_level ?? 'low')
  const dependency = String(answers.founder_dependency ?? 'high')
  const approved = automation !== 'low' && dependency !== 'high'

  return { score: normalized, approved }
}

// ── Container 8: Comportamento Humano ───────────────────────────────────────
function scoreBehavior(answers: Record<string, unknown>): ContainerScoreResult {
  let score = 0

  // Gatilho emocional: Forte=30 / Fraco=12 / Ausente=0
  const triggerPoints: Record<string, number> = { strong: 30, weak: 12, none: 0 }
  score += triggerPoints[String(answers.emotional_trigger ?? 'none')] ?? 0

  // Medo vs desejo: Medo=25 / Desejo=18 / Neutro=5
  const motivationPoints: Record<string, number> = { fear: 25, desire: 18, neutral: 5 }
  score += motivationPoints[String(answers.primary_motivation ?? 'neutral')] ?? 0

  // Conveniência: Alta=25 / Média=12 / Baixa=3
  const convPoints: Record<string, number> = { high: 25, medium: 12, low: 3 }
  score += convPoints[String(answers.convenience_level ?? 'low')] ?? 0

  // Identidade: Sim=15 / Não=5
  score += answers.identity_involved === 'yes' ? 15 : 5

  // Momento de uso: Claro=5 / Vago=2
  score += answers.usage_moment === 'clear' ? 5 : 2

  const normalized = Math.min(100, score)

  const trigger = String(answers.emotional_trigger ?? 'none')
  const convenience = String(answers.convenience_level ?? 'low')
  const approved = trigger !== 'none' && convenience !== 'low'

  return { score: normalized, approved }
}

export function calculateContainerScore(
  containerType: ContainerType,
  answers: Record<string, unknown>
): ContainerScoreResult {
  switch (containerType) {
    case 'discovery': return scoreDiscovery(answers)
    case 'validation': return scoreValidation(answers)
    case 'retention': return scoreRetention(answers)
    case 'distribution': return scoreDistribution(answers)
    case 'mvp': return scoreMvp(answers)
    case 'monetization': return scoreMonetization(answers)
    case 'scale': return scoreScale(answers)
    case 'behavior': return scoreBehavior(answers)
  }
}
