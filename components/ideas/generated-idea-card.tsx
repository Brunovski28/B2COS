'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { analyzeIdeaWithSkill } from '@/lib/ai/actions'
import { mapSkillToContainers } from '@/lib/ai/skill'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GeneratedIdea } from '@/lib/ai/skill'
import { Sparkles, Database, Loader2, Monitor, Smartphone, Globe } from 'lucide-react'

interface GeneratedIdeaCardProps {
  idea: GeneratedIdea
  onSaved?: (ideaId: string) => void
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  web: <Globe className="w-3 h-3" />,
  mobile: <Smartphone className="w-3 h-3" />,
  desktop: <Monitor className="w-3 h-3" />,
}

export function GeneratedIdeaCard({ idea, onSaved }: GeneratedIdeaCardProps) {
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  async function saveIdea(): Promise<string | null> {
    const supabase = createClient()
    const { data, error } = await supabase.from('ideas').insert({
      name: idea.title,
      description: idea.description,
      main_pain: idea.main_pain,
      target_segment: idea.target_profile,
      monetization_notes: idea.purchase_motivation,
      observations: `MVP: ${idea.mvp_description}\nCanal: ${idea.main_channel}\nValidação: ${idea.go_nogo_criteria}`,
    }).select('id').single()

    if (error || !data) {
      toast.error('Erro ao salvar ideia')
      return null
    }
    return data.id
  }

  async function handleSave() {
    setSaving(true)
    const id = await saveIdea()
    if (id) {
      setSavedId(id)
      toast.success(`"${idea.title}" salva no Banco de Ideias`)
      onSaved?.(id)
    }
    setSaving(false)
  }

  async function handleAnalyzeAndSave() {
    setAnalyzing(true)
    try {
      const id = await saveIdea()
      if (!id) { setAnalyzing(false); return }
      setSavedId(id)

      const ideaPayload = {
        name: idea.title,
        description: idea.description,
        main_pain: idea.main_pain,
        target_segment: idea.target_profile,
        monetization_notes: idea.purchase_motivation,
        business_model: idea.business_model,
      }

      const result = await analyzeIdeaWithSkill(ideaPayload)
      const containerMap = mapSkillToContainers(result)
      const supabase = createClient()

      await Promise.all(
        Object.entries(containerMap).map(([type, data]) =>
          supabase.from('container_analyses').upsert({
            idea_id: id,
            container_type: type,
            score: data.score,
            approved: data.approved,
            answers: data.answers,
          }, { onConflict: 'idea_id,container_type' })
        )
      )

      // Update the idea score
      await supabase.from('ideas').update({
        score: result.total_score,
      }).eq('id', id)

      toast.success(`"${idea.title}" salva e analisada pela IA — score ${result.total_score}/100`)
      onSaved?.(id)
    } catch {
      toast.error('Análise com IA falhou, mas a ideia foi salva.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-[#FAFAFA] mb-0.5">{idea.title}</h3>
          <p className="text-[12px] text-[#A1A1AA] leading-relaxed">{idea.description}</p>
        </div>
        <Badge
          variant="secondary"
          className="text-[10px] bg-[#18181B] text-[#A1A1AA] border border-[#27272A] shrink-0"
        >
          {idea.business_model}
        </Badge>
      </div>

      {/* Target + Pain */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-[#52525B] uppercase tracking-wider mb-0.5">Público</p>
          <p className="text-[12px] text-[#A1A1AA]">{idea.target_profile}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#52525B] uppercase tracking-wider mb-0.5">Dor</p>
          <p className="text-[12px] text-[#A1A1AA]">{idea.main_pain}</p>
        </div>
      </div>

      {/* MVP */}
      <div className="bg-[#0A0A0B] rounded-md p-3 border border-[#27272A]">
        <p className="text-[10px] text-[#52525B] uppercase tracking-wider mb-1">MVP</p>
        <p className="text-[12px] text-[#A1A1AA]">{idea.mvp_description}</p>
      </div>

      {/* Key message + platforms */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[#6366F1] italic flex-1 min-w-0 truncate">&ldquo;{idea.key_message}&rdquo;</p>
        <div className="flex items-center gap-1.5 ml-3 text-[#52525B]">
          {idea.platforms.map((p) => (
            <span key={p} title={p}>{PLATFORM_ICONS[p.toLowerCase()] ?? p}</span>
          ))}
        </div>
      </div>

      {/* Go/no-go */}
      <div>
        <p className="text-[10px] text-[#52525B] uppercase tracking-wider mb-0.5">Critério Go/No-go</p>
        <p className="text-[12px] text-[#22C55E]">{idea.go_nogo_criteria}</p>
      </div>

      {/* Actions */}
      {savedId ? (
        <div className="text-[12px] text-[#22C55E] text-center py-1">✅ Salva no banco</div>
      ) : (
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving || analyzing}
            className="flex-1 text-[12px] border-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] gap-1.5"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
            Salvar no Banco
          </Button>
          <Button
            size="sm"
            onClick={handleAnalyzeAndSave}
            disabled={saving || analyzing}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-[12px] gap-1.5"
          >
            {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Analisar e Salvar
          </Button>
        </div>
      )}
    </div>
  )
}
