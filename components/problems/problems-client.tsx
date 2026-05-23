'use client'

import { useState, useCallback, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { useUIStore } from '@/store/ui.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProblemCard } from './problem-card'
import { ProblemForm } from './problem-form'
import { TagCloud } from './tag-cloud'
import type { Problem, Idea, ProblemFrequency, ProblemSource } from '@/types'
import { PROBLEM_FREQUENCY_LABELS } from '@/types'

interface ProblemsClientProps {
  initialProblems: Problem[]
  ideas: Idea[]
}

const FREQ_ORDER: ProblemFrequency[] = ['daily', 'weekly', 'monthly', 'rarely']

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: '#A1A1AA' }}>{label}: {payload[0].value}</p>
    </div>
  )
}

export function ProblemsClient({ initialProblems, ideas }: ProblemsClientProps) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems)
  const [search, setSearch] = useState('')
  const [filterFreq, setFilterFreq] = useState<ProblemFrequency | 'all'>('all')
  const [filterSource, setFilterSource] = useState<ProblemSource | 'all'>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const { openProblemForm } = useUIStore()

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of problems) {
      for (const t of p.tags) {
        map.set(t, (map.get(t) ?? 0) + 1)
      }
    }
    return map
  }, [problems])

  const freqData = useMemo(() =>
    FREQ_ORDER
      .map(f => ({ name: PROBLEM_FREQUENCY_LABELS[f], count: problems.filter(p => p.frequency === f).length }))
      .filter(d => d.count > 0),
    [problems]
  )

  const topByIntensity = useMemo(() =>
    [...problems]
      .filter(p => p.emotional_intensity !== null)
      .sort((a, b) => (b.emotional_intensity ?? 0) - (a.emotional_intensity ?? 0))
      .slice(0, 5),
    [problems]
  )

  const filtered = useMemo(() => {
    let list = problems
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.real_quote ?? '').toLowerCase().includes(q)
      )
    }
    if (filterFreq !== 'all') list = list.filter(p => p.frequency === filterFreq)
    if (filterSource !== 'all') list = list.filter(p => p.source === filterSource)
    if (activeTag) list = list.filter(p => p.tags.includes(activeTag))
    return list
  }, [problems, search, filterFreq, filterSource, activeTag])

  const refreshProblems = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('problems').select('*').order('created_at', { ascending: false })
    if (data) setProblems(data as Problem[])
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir este problema? Esta ação não pode ser desfeita.')) return
    const supabase = createClient()
    const { error } = await supabase.from('problems').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir')
    } else {
      toast.success('Problema excluído')
      setProblems(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#27272A] shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525B]" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar problema..."
            className="pl-9 bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]"
          />
        </div>
        <Select value={filterFreq} onValueChange={(v) => setFilterFreq((v ?? 'all') as ProblemFrequency | 'all')}>
          <SelectTrigger className="w-[150px] bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]">
            <SelectValue placeholder="Frequência" />
          </SelectTrigger>
          <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
            <SelectItem value="all">Todas as freq.</SelectItem>
            <SelectItem value="daily">Diária</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="rarely">Raramente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={(v) => setFilterSource((v ?? 'all') as ProblemSource | 'all')}>
          <SelectTrigger className="w-[150px] bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
            <SelectItem value="all">Todas as fontes</SelectItem>
            <SelectItem value="observation">Observação</SelectItem>
            <SelectItem value="interview">Entrevista</SelectItem>
            <SelectItem value="personal">Pessoal</SelectItem>
            <SelectItem value="research">Pesquisa</SelectItem>
            <SelectItem value="social">Rede Social</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          onClick={() => openProblemForm()}
          size="sm"
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar Problema
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-3xl">🧩</p>
            <p className="text-[15px] font-semibold text-[#FAFAFA]">Nenhum problema encontrado</p>
            <p className="text-[13px] text-[#52525B]">
              {problems.length === 0
                ? 'Comece registrando dores e problemas observados'
                : 'Tente ajustar os filtros'}
            </p>
            {problems.length === 0 && (
              <Button
                onClick={() => openProblemForm()}
                size="sm"
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] mt-2"
              >
                Registrar primeiro problema
              </Button>
            )}
          </div>
        ) : (
          /* Masonry grid */
          <div style={{ columns: 2, columnGap: '16px' }}>
            {filtered.map(problem => (
              <div key={problem.id} style={{ breakInside: 'avoid', marginBottom: 16 }}>
                <ProblemCard
                  problem={problem}
                  ideas={ideas}
                  onEdit={() => openProblemForm(problem.id)}
                  onDelete={() => handleDelete(problem.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Patterns section */}
        {problems.length > 0 && (
          <div className="space-y-5">
            <div className="border-t border-[#27272A] pt-5">
              <p className="text-[13px] font-semibold text-[#A1A1AA] mb-3">Nuvem de Tags</p>
              {tagCounts.size > 0 ? (
                <TagCloud tags={tagCounts} activeTag={activeTag} onTagClick={setActiveTag} />
              ) : (
                <p className="text-[12px] text-[#52525B]">Adicione tags aos problemas para ver a nuvem</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Freq distribution */}
              {freqData.length > 0 && (
                <div className="rounded-xl border border-[#27272A] bg-[#111113] p-4">
                  <p className="text-[13px] font-semibold text-[#A1A1AA] mb-4">Distribuição por Frequência</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={freqData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#52525B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top by intensity */}
              {topByIntensity.length > 0 && (
                <div className="rounded-xl border border-[#27272A] bg-[#111113] p-4">
                  <p className="text-[13px] font-semibold text-[#A1A1AA] mb-3">Top 5 por Intensidade</p>
                  <div className="space-y-2">
                    {topByIntensity.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => openProblemForm(p.id)}
                        className="flex items-center gap-3 w-full text-left group"
                      >
                        <span className="text-[11px] text-[#52525B] w-4 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-[#A1A1AA] group-hover:text-[#FAFAFA] transition-colors truncate">{p.title}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${(p.emotional_intensity ?? 0) * 8}px`,
                              backgroundColor: (p.emotional_intensity ?? 0) >= 8 ? '#EF4444' : (p.emotional_intensity ?? 0) >= 5 ? '#F59E0B' : '#3B82F6',
                            }}
                          />
                          <span className="text-[11px] text-[#52525B]">{p.emotional_intensity}/10</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ProblemForm ideas={ideas} onSuccess={refreshProblems} />
    </div>
  )
}
