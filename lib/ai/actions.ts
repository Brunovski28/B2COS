'use server'

import {
  SKILL_SYSTEM_PROMPT,
  buildEvaluationPrompt,
  buildGenerationPrompt,
  buildContainerPrompt,
  CONTAINER_QUESTIONS,
} from './prompts'
import type {
  SkillAnalysisResult,
  SkillGenerationResult,
  ContainerAIResult,
} from './skill'

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error ${response.status}: ${err}`)
  }

  const data = await response.json() as {
    content?: Array<{ type: string; text: string }>
  }
  const text = data.content?.find((b) => b.type === 'text')?.text ?? ''
  return text.replace(/```json\s*|```/g, '').trim()
}

export async function analyzeIdeaWithSkill(
  idea: Record<string, unknown>
): Promise<SkillAnalysisResult> {
  const prompt = buildEvaluationPrompt(idea as Parameters<typeof buildEvaluationPrompt>[0])
  const raw = await callClaude(SKILL_SYSTEM_PROMPT, prompt)
  return JSON.parse(raw) as SkillAnalysisResult
}

export async function generateIdeasWithSkill(
  input: string,
  count?: number
): Promise<SkillGenerationResult> {
  const prompt = buildGenerationPrompt(input, count)
  const raw = await callClaude(SKILL_SYSTEM_PROMPT, prompt)
  return JSON.parse(raw) as SkillGenerationResult
}

export async function analyzeContainer(
  containerType: string,
  idea: Record<string, unknown>
): Promise<ContainerAIResult> {
  const question = CONTAINER_QUESTIONS[containerType] ?? ''
  const prompt = buildContainerPrompt(containerType, idea, question)
  const raw = await callClaude(SKILL_SYSTEM_PROMPT, prompt)
  return JSON.parse(raw) as ContainerAIResult
}
