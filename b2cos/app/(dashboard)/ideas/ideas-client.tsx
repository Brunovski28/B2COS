'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Idea } from '@/types'
import { useUIStore } from '@/store/ui.store'
import { useIdeasStore } from '@/store/ideas.store'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { IdeaCard } from '@/components/ideas/idea-card'
import { IdeaFilters } from '@/components/ideas/idea-filters'
import { IdeaForm } from '@/components/ideas/idea-form'
import { EmptyState } from '@/components/shared/empty-state'

interface IdeasClientProps {
  initialIdeas: Idea[]
}

export function IdeasClient({ initialIdeas }: IdeasClientProps) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const { openIdeaForm } = useUIStore()
  const { filters } = useIdeasStore()

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('ideas').select('*').order('score', { ascending: false })
    if (data) setIdeas(data)
  }, [])

  // Keyboard shortcut: N = nova ideia
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        openIdeaForm()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [openIdeaForm])

  async function handleArchive(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('ideas').update({ status: 'archived' }).eq('id', id)
    if (error) {
      toast.error('Erro ao arquivar ideia')
      return
    }
    toast.success('Ideia arquivada')
    setIdeas((prev) => prev.map((i) => i.id === id ? { ...i, status: 'archived' } : i))
  }

  const filtered = useMemo(() => {
    let result = [...ideas]

    if (filters.status !== 'all') {
      result = result.filter((i) => i.status === filters.status)
    }
    if (filters.pipelineStage !== 'all') {
      result = result.filter((i) => i.pipeline_stage === filters.pipelineStage)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.main_pain ?? '').toLowerCase().includes(q) ||
          (i.description ?? '').toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      if (filters.sortBy === 'score') return b.score - a.score
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return result
  }, [ideas, filters])

  const activeCount = ideas.filter((i) => i.status === 'active').length

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Banco de Ideias"
        breadcrumb={`${activeCount} idea${activeCount !== 1 ? 's' : ''} ativa${activeCount !== 1 ? 's' : ''}`}
        actions={
          <Button
            onClick={() => openIdeaForm()}
            size="sm"
            className="h-8 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[12px] gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Ideia
            <kbd className="ml-1 px-1 py-0.5 rounded text-[10px] bg-white/10">N</kbd>
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Filters */}
        <div className="mb-5">
          <IdeaFilters />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="💡"
            title="Nenhuma ideia encontrada"
            description={
              ideas.length === 0
                ? 'Capture sua primeira ideia e comece a validar o potencial de mercado.'
                : 'Tente ajustar os filtros para encontrar o que procura.'
            }
            actionLabel={ideas.length === 0 ? 'Criar primeira ideia' : undefined}
            onAction={ideas.length === 0 ? () => openIdeaForm() : undefined}
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence>
              {filtered.map((idea) => (
                <motion.div
                  key={idea.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <IdeaCard idea={idea} onArchive={handleArchive} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <IdeaForm onSuccess={refresh} />
    </div>
  )
}
