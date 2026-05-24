'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { generateIdeasWithSkill } from '@/lib/ai/actions'
import type { GeneratedIdea } from '@/lib/ai/skill'
import { GeneratedIdeaCard } from './generated-idea-card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2, X } from 'lucide-react'

const LOADING_MESSAGES = [
  'Combinando padrões de mercado...',
  'Identificando dores recorrentes...',
  'Mapeando modelos de negócio...',
  'Avaliando potencial de retenção...',
  'Construindo estratégias de distribuição...',
  'Refinando propostas de valor...',
  'Finalizando ideias...',
]

interface IdeaGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IdeaGenerator({ open, onOpenChange }: IdeaGeneratorProps) {
  const [input, setInput] = useState('')
  const [count, setCount] = useState<3 | 5 | 7>(3)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
    if (!open) {
      setIdeas([])
      setInput('')
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    if (!loading) return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[i])
    }, 1500)
    return () => clearInterval(interval)
  }, [loading])

  async function handleGenerate() {
    if (!input.trim()) return
    setLoading(true)
    setLoadingMsg(LOADING_MESSAGES[0])
    setIdeas([])
    try {
      const result = await generateIdeasWithSkill(input.trim(), count)
      setIdeas(result.ideas)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Falha ao gerar ideias', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[680px] bg-[#111113] border border-[#27272A] p-0 max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-[#27272A] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <DialogTitle className="text-[15px] font-semibold text-[#FAFAFA]">
              Gerador de Ideias B2C
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Input section */}
          <div className="px-6 pt-5 pb-4 border-b border-[#27272A]">
            <p className="text-[13px] text-[#A1A1AA] mb-3">
              Descreva um tema, nicho ou combine palavras-chave:
            </p>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
              }}
              placeholder='Ex: "academia + gamificação", "saúde mental para adolescentes", "freelancers e cobrança"'
              rows={3}
              className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none mb-4"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#A1A1AA]">Quantas ideias?</span>
                {([3, 5, 7] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`w-8 h-8 rounded-md text-[12px] font-medium transition-colors ${
                      count === n
                        ? 'bg-violet-600 text-white'
                        : 'bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:border-[#3F3F46]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-[#A1A1AA] hover:text-[#FAFAFA] text-[13px]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !input.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-[13px] gap-1.5 min-w-[140px]"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {loading ? 'Gerando...' : `Gerar ${count} ideias →`}
                </Button>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-[13px] text-[#A1A1AA] animate-pulse">{loadingMsg}</p>
              <div className="w-48 h-1 bg-[#27272A] rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full animate-pulse w-1/2" />
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && ideas.length > 0 && (
            <div className="px-6 py-4 space-y-4">
              <p className="text-[12px] text-[#52525B]">
                {ideas.length} {ideas.length === 1 ? 'ideia gerada' : 'ideias geradas'} — clique em &ldquo;Analisar e Salvar&rdquo; para avaliação completa com a skill
              </p>
              {ideas.map((idea, i) => (
                <GeneratedIdeaCard key={i} idea={idea} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
