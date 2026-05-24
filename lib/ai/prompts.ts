export const SKILL_SYSTEM_PROMPT = `
Você é um avaliador estratégico especializado em produtos digitais B2C.
Sua função é analisar ideias de produto com rigor e honestidade.
Nunca suavize pontuações baixas — uma reprovação honesta poupa meses de trabalho.
Diferenciais genéricos como "IA personalizada" ou "UX intuitiva" valem zero em 2025.
Sempre verifique concorrência comportamental ANTES de qualquer nota.
Responda SEMPRE em JSON puro, sem markdown, sem explicações fora do JSON.
`

export function buildEvaluationPrompt(idea: {
  name: string
  description?: string | null
  main_pain?: string | null
  pain_frequency?: string | null
  target_segment?: string | null
  market_size?: string | null
  monetization_notes?: string | null
  recurrence?: string | null
  complexity?: number | null
  competition_level?: string | null
}): string {
  return `
Avalie esta ideia de produto B2C com rigor máximo.

IDEIA: ${idea.name}
DESCRIÇÃO: ${idea.description ?? 'não definida'}
DOR PRINCIPAL: ${idea.main_pain ?? 'não definida'}
FREQUÊNCIA DA DOR: ${idea.pain_frequency ?? 'não definida'}
SEGMENTO-ALVO: ${idea.target_segment ?? 'não definido'}
MERCADO ESTIMADO: ${idea.market_size ?? 'não definido'}
MONETIZAÇÃO: ${idea.monetization_notes ?? 'não definida'}
RECORRÊNCIA: ${idea.recurrence ?? 'não definida'}
COMPLEXIDADE TÉCNICA: ${idea.complexity ?? 'não definida'}/10
NÍVEL DE CONCORRÊNCIA: ${idea.competition_level ?? 'não definido'}

Retorne um JSON com a seguinte estrutura exata:
{
  "behavioral_alert": {
    "detected": boolean,
    "signals": ["sinal 1", "sinal 2"],
    "message": "explicação se detectado, string vazia se não"
  },
  "criteria": {
    "tam": { "score": 0, "justification": "...", "improvement": "..." },
    "recurring_pain": { "score": 0, "justification": "...", "improvement": "..." },
    "desired_pain": { "score": 0, "justification": "...", "improvement": "..." },
    "willingness_to_pay": { "score": 0, "justification": "...", "improvement": "..." },
    "competitive_edge": { "score": 0, "justification": "...", "improvement": "..." },
    "validation_speed": { "score": 0, "justification": "...", "improvement": "..." },
    "scalability": { "score": 0, "justification": "...", "improvement": "..." },
    "regulatory_risk": { "score": 0, "justification": "...", "improvement": "..." },
    "retention_d30_d90": { "score": 0, "justification": "...", "improvement": "..." },
    "defensible_niche": { "score": 0, "justification": "...", "improvement": "..." }
  },
  "total_score": 0,
  "verdict": "approved|conditional|high_risk|rejected",
  "critical_points": ["ponto 1", "ponto 2", "ponto 3"],
  "next_steps": ["ação 1", "ação 2", "ação 3"]
}

Notas de pontuação para dor desejada (critério desired_pain):
- 9-10: usuário busca ativamente soluções, já paga por alternativas
- 6-8: quer resolver mas procrastina
- 3-5: convive sem urgência
- 0-2: evita ou contorna sistematicamente

Notas de pontuação para retenção D30/D90 (critério retention_d30_d90):
- 9-10: uso diário, valor aumenta com o tempo
- 6-8: uso semanal, algum lock-in
- 3-5: uso esporádico, fácil de abandonar
- 0-2: produto de uma vez só

Risco regulatório (regulatory_risk): escala invertida, 10 = sem risco.
`
}

export function buildGenerationPrompt(input: string, count: number = 3): string {
  return `
Gere ${count} ideias B2C originais a partir da seguinte entrada: "${input}"

Para cada ideia, retorne JSON puro com a estrutura:
{
  "ideas": [
    {
      "title": "...",
      "description": "2-3 frases do produto",
      "target_profile": "quem são, idade, contexto",
      "main_pain": "a dor específica",
      "purchase_motivation": "por que pagariam",
      "platforms": ["web"],
      "business_model": "assinatura|freemium|compra única|marketplace",
      "mvp_description": "o que seria suficiente para testar em 4-8 semanas",
      "main_channel": "onde o público passa mais tempo",
      "key_message": "pitch de 1 frase",
      "validation_method_1": "teste de demanda concreto",
      "validation_method_2": "entrevistas: quem, o que perguntar",
      "validation_method_3": "proxy de mercado existente",
      "go_nogo_criteria": "ex: 50 cadastros em 2 semanas"
    }
  ]
}

Não use diferenciais genéricos como "IA personalizada" ou "UX intuitiva".
`
}

export function buildContainerPrompt(
  containerType: string,
  idea: Record<string, unknown>,
  specificQuestion: string
): string {
  return `
Você é o especialista em ${containerType} do sistema B2C Operating System.
Analise a ideia abaixo focando APENAS no critério da sua especialidade.

IDEIA: ${JSON.stringify(idea, null, 2)}

PERGUNTA ESPECÍFICA: ${specificQuestion}

Retorne JSON puro:
{
  "score": 0,
  "approved": false,
  "analysis": "análise detalhada em 2-3 parágrafos",
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
  "recommendations": ["ação 1", "ação 2", "ação 3"],
  "critical_questions": ["pergunta que precisa de resposta 1", "pergunta 2"]
}
`
}

export const CONTAINER_QUESTIONS: Record<string, string> = {
  discovery: 'A dor é real, intensa e frequente? Existe mercado endereçável claro?',
  validation: 'É possível validar a hipótese com rapidez e baixo custo?',
  retention: 'Existe loop de hábito natural? D30/D90 são sustentáveis?',
  distribution: 'Existe canal orgânico escalável e nicho defensável?',
  mvp: 'Qual o menor escopo possível? Qual hipótese ele testa? Há risco regulatório?',
  monetization: 'O usuário paga? Há recorrência? LTV/CAC é viável?',
  scale: 'O modelo escala sem dependência linear do fundador?',
  behavior: 'A dor é desejada (não apenas recorrente)? Compete com comportamento impulsivo?',
}
