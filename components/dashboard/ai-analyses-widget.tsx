'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getSkillVerdict } from '@/lib/scoring'
import { Sparkles, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface AIAnalysisRow {
  id: string
  idea_id: string
  container_type: string
  score: number | null
  answers: Record<string, unknown>
  updated_at: string
  ideas?: { name: string } | null
}

export function AIAnalysesWidget() {
  const [rows, setRows] = useState<AIAnalysisRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('container_analyses')
        .select('id, idea_id, container_type, score, answers, updated_at, ideas(name)')
        .filter('answers->ai_analyzed', 'eq', 'true')
        .order('updated_at', { ascending: false })
        .limit(8)

      setRows((data ?? []) as unknown as AIAnalysisRow[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4">
        <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider mb-3">Análises IA Recentes</p>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#18181B] rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">Análises IA Recentes</p>
        </div>
        <p className="text-[12px] text-[#52525B] py-4 text-center">
          Nenhuma análise de IA realizada ainda.
          <br />Use &ldquo;Analisar todos com IA&rdquo; em uma ideia.
        </p>
      </div>
    )
  }

  const CONTAINER_LABELS: Record<string, string> = {
    discovery: '🔍 Descoberta',
    validation: '🧪 Validação',
    retention: '🔄 Retenção',
    distribution: '📡 Distribuição',
    mvp: '🛠️ MVP',
    monetization: '💰 Monetização',
    scale: '🚀 Escala',
    behavior: '🧠 Comportamento',
  }

  return (
    <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">Análises IA Recentes</p>
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          const score = row.score ?? 0
          const verdict = getSkillVerdict(score)
          const hasBehavioralAlert = !!(row.answers?.behavioral_alert as { detected?: boolean } | undefined)?.detected
          const ideaName = (row.ideas as { name?: string } | null)?.name ?? 'Ideia'

          return (
            <Link
              key={row.id}
              href={`/ideas/${row.idea_id}`}
              className="flex items-center gap-3 py-2 px-2 rounded hover:bg-[#18181B] transition-colors group"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#FAFAFA] truncate">{ideaName}</p>
                <p className="text-[10px] text-[#52525B]">{CONTAINER_LABELS[row.container_type] ?? row.container_type}</p>
              </div>
              {hasBehavioralAlert && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label="Alerta comportamental" />
              )}
              <Badge
                variant="secondary"
                className="text-[9px] px-1.5 py-0 h-4 shrink-0"
                style={{ backgroundColor: verdict.color + '20', color: verdict.color, borderColor: verdict.color + '40' }}
              >
                {score}
              </Badge>
              <span className="text-[10px] text-[#52525B] shrink-0">
                {formatDistanceToNow(new Date(row.updated_at), { locale: ptBR, addSuffix: true })}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
