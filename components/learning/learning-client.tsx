'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, BookOpen, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUIStore } from '@/store/ui.store'
import type { LearningResource, Idea, LearningResourceType } from '@/types'
import { LEARNING_TYPE_COLORS } from '@/types'
import { ResourceCard } from '@/components/learning/resource-card'
import { ResourceForm } from '@/components/learning/resource-form'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TABS: { key: LearningResourceType | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'book', label: 'Livros' },
  { key: 'framework', label: 'Frameworks' },
  { key: 'article', label: 'Artigos' },
  { key: 'insight', label: 'Insights' },
  { key: 'note', label: 'Notas' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

interface LearningClientProps {
  initialResources: LearningResource[]
  ideas: Idea[]
}

export function LearningClient({ initialResources, ideas }: LearningClientProps) {
  const [resources, setResources] = useState(initialResources)
  const [activeTab, setActiveTab] = useState<LearningResourceType | 'all'>('all')
  const [search, setSearch] = useState('')
  const openLearningForm = useUIStore((s) => s.openLearningForm)

  const handleRefresh = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('learning_resources').select('*').order('updated_at', { ascending: false })
    if (data) setResources(data as LearningResource[])
  }, [])

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('learning_resources').delete().eq('id', id)
    if (error) { toast.error('Erro ao remover recurso'); return }
    toast.success('Recurso removido')
    setResources((prev) => prev.filter((r) => r.id !== id))
  }

  const filtered = resources.filter((r) => {
    const matchesTab = activeTab === 'all' || r.type === activeTab
    const q = search.toLowerCase()
    const matchesSearch = !q || r.title.toLowerCase().includes(q) ||
      (r.author ?? '').toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    return matchesTab && matchesSearch
  })

  const inProgress = resources.filter((r) => r.type === 'book' && r.progress > 0 && r.progress < 100)
    .sort((a, b) => b.progress - a.progress)

  const totalInsights = resources.reduce((sum, r) => sum + r.key_insights.length, 0)
  const allTags = resources.flatMap((r) => r.tags)
  const tagCounts = allTags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1
    return acc
  }, {})
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag)
  const withIdeas = resources.filter((r) => r.applied_to_idea_ids.length > 0).length
  const applicationRate = resources.length > 0 ? Math.round((withIdeas / resources.length) * 100) : 0

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-[#27272A] flex items-center gap-3 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525B]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar recursos..."
              className="pl-8 h-8 bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px]"
            />
          </div>
          <Button
            onClick={() => openLearningForm()}
            size="sm"
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] h-8 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </Button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-2 border-b border-[#27272A] flex items-center gap-1 shrink-0 overflow-x-auto">
          {TABS.map(({ key, label }) => {
            const count = key === 'all' ? resources.length : resources.filter((r) => r.type === key).length
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === key
                    ? 'bg-[#18181B] text-[#FAFAFA]'
                    : 'text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#18181B]'
                }`}
              >
                {label}
                <span className={`text-[11px] px-1 rounded ${activeTab === key ? 'bg-[#27272A] text-[#A1A1AA]' : 'text-[#3F3F46]'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState
                  icon="📚"
                  title="Nenhum recurso encontrado"
                  description={search ? 'Tente outros termos de busca.' : 'Adicione livros, artigos e insights ao seu sistema de aprendizado.'}
                  actionLabel="Adicionar recurso"
                  onAction={() => openLearningForm()}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filtered.map((resource) => (
                  <motion.div key={resource.id} variants={itemVariants}>
                    <ResourceCard resource={resource} ideas={ideas} onDelete={handleDelete} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Knowledge footer */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-[#6366F1]" />
              </div>
              <div>
                <p className="text-[22px] font-bold text-[#FAFAFA]">{totalInsights}</p>
                <p className="text-[11px] text-[#52525B]">Insights registrados</p>
              </div>
            </div>
            <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4">
              <p className="text-[11px] text-[#52525B] mb-2">Áreas mais estudadas</p>
              <div className="flex flex-wrap gap-1.5">
                {topTags.length > 0 ? topTags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded bg-[#18181B] text-[11px] text-[#A1A1AA]">{tag}</span>
                )) : (
                  <span className="text-[12px] text-[#3F3F46]">Nenhuma tag ainda</span>
                )}
              </div>
            </div>
            <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center shrink-0">
                <span className="text-[14px] font-bold text-[#22C55E]">{applicationRate}%</span>
              </div>
              <div>
                <p className="text-[22px] font-bold text-[#FAFAFA]">{withIdeas}</p>
                <p className="text-[11px] text-[#52525B]">Recursos aplicados a ideias</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar — Em Progresso */}
      {inProgress.length > 0 && (
        <div className="w-[240px] shrink-0 border-l border-[#27272A] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27272A]">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <h3 className="text-[13px] font-semibold text-[#FAFAFA]">Em Progresso</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {inProgress.map((book) => (
              <div key={book.id} className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#8B5CF620', border: '1px solid #8B5CF630' }}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  </div>
                  <p className="text-[12px] text-[#A1A1AA] leading-tight line-clamp-2 flex-1">{book.title}</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1 bg-[#18181B] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${book.progress}%`, backgroundColor: '#8B5CF6' }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[#8B5CF6]">{book.progress}%</span>
                    <span className="text-[10px] text-[#52525B]">
                      {formatDistanceToNow(new Date(book.updated_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ResourceForm ideas={ideas} onSuccess={handleRefresh} />
    </div>
  )
}
