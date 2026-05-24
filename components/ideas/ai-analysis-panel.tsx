'use client'

import { CheckCircle2, XCircle, HelpCircle, TrendingUp, AlertTriangle } from 'lucide-react'
import { ScoreGauge } from '@/components/shared/score-gauge'
import { getSkillVerdict } from '@/lib/scoring'
import type { ContainerAIResult } from '@/lib/ai/skill'

interface AIAnalysisPanelProps {
  result: ContainerAIResult
}

export function AIAnalysisPanel({ result }: AIAnalysisPanelProps) {
  const verdict = getSkillVerdict(result.score)

  return (
    <div className="space-y-5">
      {/* Score + status header */}
      <div className="flex items-center gap-4 p-4 bg-[#0A0A0B] rounded-lg border border-[#27272A]">
        <ScoreGauge score={result.score} size={60} strokeWidth={5} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            {result.approved ? (
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            ) : (
              <XCircle className="w-4 h-4 text-[#EF4444]" />
            )}
            <span
              className="text-[13px] font-semibold"
              style={{ color: result.approved ? '#22C55E' : '#EF4444' }}
            >
              {result.approved ? 'Aprovado' : 'Reprovado'}
            </span>
          </div>
          <p className="text-[11px] text-[#52525B]">Score IA: {result.score}/100</p>
          <p className="text-[11px]" style={{ color: verdict.color }}>{verdict.description}</p>
        </div>
      </div>

      {/* Analysis prose */}
      {result.analysis && (
        <div>
          <p className="text-[10px] text-[#52525B] uppercase tracking-wider font-semibold mb-2">Análise</p>
          <p className="text-[13px] text-[#A1A1AA] leading-relaxed">{result.analysis}</p>
        </div>
      )}

      {/* Strengths */}
      {result.strengths?.length > 0 && (
        <div>
          <p className="text-[10px] text-[#52525B] uppercase tracking-wider font-semibold mb-2">Pontos Fortes</p>
          <ul className="space-y-1.5">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-[#A1A1AA]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {result.weaknesses?.length > 0 && (
        <div>
          <p className="text-[10px] text-[#52525B] uppercase tracking-wider font-semibold mb-2">Pontos Fracos</p>
          <ul className="space-y-1.5">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-[#A1A1AA]">
                <XCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <div>
          <p className="text-[10px] text-[#52525B] uppercase tracking-wider font-semibold mb-2">Recomendações</p>
          <ol className="space-y-1.5 list-none">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-[#A1A1AA]">
                <span className="text-[10px] font-mono text-[#6366F1] shrink-0 mt-0.5 w-4">{i + 1}.</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#6366F1] shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Critical questions */}
      {result.critical_questions?.length > 0 && (
        <div>
          <p className="text-[10px] text-[#52525B] uppercase tracking-wider font-semibold mb-2">
            Perguntas Críticas a Responder
          </p>
          <ul className="space-y-1.5">
            {result.critical_questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-amber-300/80">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface FullSkillAnalysisPanelProps {
  criterionKey: string
  criterionData: { score: number; justification: string; improvement: string }
  containerScore: number
  containerApproved: boolean
}

export function FullSkillAnalysisPanel({ criterionKey, criterionData, containerScore, containerApproved }: FullSkillAnalysisPanelProps) {
  const verdict = getSkillVerdict(containerScore)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-[#0A0A0B] rounded-lg border border-[#27272A]">
        <ScoreGauge score={containerScore} size={56} strokeWidth={4} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            {containerApproved ? (
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            ) : (
              <XCircle className="w-4 h-4 text-[#EF4444]" />
            )}
            <span className="text-[13px] font-semibold" style={{ color: containerApproved ? '#22C55E' : '#EF4444' }}>
              {containerApproved ? 'Aprovado' : 'Reprovado'}
            </span>
          </div>
          <p className="text-[11px]" style={{ color: verdict.color }}>{verdict.description}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#52525B] uppercase tracking-wider font-semibold mb-2">
          Justificativa (critério: {criterionKey})
        </p>
        <p className="text-[13px] text-[#A1A1AA] leading-relaxed">{criterionData.justification}</p>
      </div>

      <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A]">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-1">
              Para subir a nota:
            </p>
            <p className="text-[12px] text-amber-200/70 leading-relaxed">{criterionData.improvement}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
