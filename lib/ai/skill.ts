// TypeScript types for the ideia-b2c skill

export interface CriterionResult {
  score: number
  justification: string
  improvement: string
}

export interface BehavioralAlert {
  detected: boolean
  signals: string[]
  message: string
}

export interface SkillAnalysisResult {
  behavioral_alert: BehavioralAlert
  criteria: {
    tam: CriterionResult
    recurring_pain: CriterionResult
    desired_pain: CriterionResult
    willingness_to_pay: CriterionResult
    competitive_edge: CriterionResult
    validation_speed: CriterionResult
    scalability: CriterionResult
    regulatory_risk: CriterionResult
    retention_d30_d90: CriterionResult
    defensible_niche: CriterionResult
  }
  total_score: number
  verdict: 'approved' | 'conditional' | 'high_risk' | 'rejected'
  critical_points: string[]
  next_steps: string[]
}

export interface SkillGenerationResult {
  ideas: GeneratedIdea[]
}

export interface GeneratedIdea {
  title: string
  description: string
  target_profile: string
  main_pain: string
  purchase_motivation: string
  platforms: string[]
  business_model: string
  mvp_description: string
  main_channel: string
  key_message: string
  validation_method_1: string
  validation_method_2: string
  validation_method_3: string
  go_nogo_criteria: string
}

export interface ContainerAIResult {
  score: number
  approved: boolean
  analysis: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  critical_questions: string[]
}

export function mapSkillToContainers(result: SkillAnalysisResult): Record<string, {
  score: number
  approved: boolean
  answers: Record<string, unknown>
}> {
  const { criteria, behavioral_alert } = result
  return {
    discovery: {
      score: Math.round((criteria.tam.score + criteria.recurring_pain.score) / 2 * 10),
      approved: criteria.tam.score >= 6 && criteria.recurring_pain.score >= 6,
      answers: { tam: criteria.tam, recurring_pain: criteria.recurring_pain, ai_analyzed: true },
    },
    behavior: {
      score: Math.round((criteria.desired_pain.score + (behavioral_alert.detected ? 3 : 8)) / 2 * 10),
      approved: criteria.desired_pain.score >= 6 && !behavioral_alert.detected,
      answers: { desired_pain: criteria.desired_pain, behavioral_alert, ai_analyzed: true },
    },
    monetization: {
      score: criteria.willingness_to_pay.score * 10,
      approved: criteria.willingness_to_pay.score >= 6,
      answers: { willingness_to_pay: criteria.willingness_to_pay, ai_analyzed: true },
    },
    distribution: {
      score: Math.round((criteria.competitive_edge.score + criteria.defensible_niche.score) / 2 * 10),
      approved: criteria.competitive_edge.score >= 5 && criteria.defensible_niche.score >= 5,
      answers: { competitive_edge: criteria.competitive_edge, defensible_niche: criteria.defensible_niche, ai_analyzed: true },
    },
    mvp: {
      score: Math.round((criteria.validation_speed.score + criteria.regulatory_risk.score) / 2 * 10),
      approved: criteria.validation_speed.score >= 6 && criteria.regulatory_risk.score >= 7,
      answers: { validation_speed: criteria.validation_speed, regulatory_risk: criteria.regulatory_risk, ai_analyzed: true },
    },
    scale: {
      score: criteria.scalability.score * 10,
      approved: criteria.scalability.score >= 6,
      answers: { scalability: criteria.scalability, ai_analyzed: true },
    },
    retention: {
      score: criteria.retention_d30_d90.score * 10,
      approved: criteria.retention_d30_d90.score >= 6,
      answers: { retention_d30_d90: criteria.retention_d30_d90, ai_analyzed: true },
    },
    validation: {
      score: criteria.validation_speed.score * 10,
      approved: criteria.validation_speed.score >= 6,
      answers: { validation_speed: criteria.validation_speed, ai_analyzed: true },
    },
  }
}
