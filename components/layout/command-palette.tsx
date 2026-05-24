'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Lightbulb, GitBranch, AlertCircle,
  Map, BarChart2, BookOpen, Plus, Target, TrendingUp, Sparkles,
} from 'lucide-react'
import { useUIStore } from '@/store/ui.store'
import { createClient } from '@/lib/supabase/client'
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command'
import { PIPELINE_STAGE_LABELS } from '@/types'
import type { PipelineStage } from '@/types'

interface IdeaResult {
  id: string
  name: string
  score: number
  pipeline_stage: PipelineStage
}

interface ProblemResult {
  id: string
  title: string
  emotional_intensity: number | null
}

export function CommandPalette() {
  const router = useRouter()
  const { isCommandPaletteOpen, closeCommandPalette, openIdeaForm, openCommandPalette, openIdeaGenerator } = useUIStore()
  const [query, setQuery] = useState('')
  const [ideas, setIdeas] = useState<IdeaResult[]>([])
  const [problems, setProblems] = useState<ProblemResult[]>([])

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isCommandPaletteOpen) {
          closeCommandPalette()
        } else {
          openCommandPalette()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isCommandPaletteOpen, closeCommandPalette, openCommandPalette])

  // Real-time search
  useEffect(() => {
    if (!isCommandPaletteOpen) { setQuery(''); setIdeas([]); setProblems([]); return }

    const timer = setTimeout(async () => {
      const supabase = createClient()
      const q = query.trim()

      if (q.length < 1) {
        setIdeas([])
        setProblems([])
        return
      }

      const [{ data: ideaData }, { data: problemData }] = await Promise.all([
        supabase.from('ideas').select('id, name, score, pipeline_stage')
          .eq('status', 'active').ilike('name', `%${q}%`).limit(5),
        supabase.from('problems').select('id, title, emotional_intensity')
          .ilike('title', `%${q}%`).limit(3),
      ])

      setIdeas((ideaData ?? []) as IdeaResult[])
      setProblems((problemData ?? []) as ProblemResult[])
    }, 150)

    return () => clearTimeout(timer)
  }, [query, isCommandPaletteOpen])

  const navigate = useCallback((href: string) => {
    closeCommandPalette()
    router.push(href)
  }, [closeCommandPalette, router])

  const runAction = useCallback((fn: () => void) => {
    closeCommandPalette()
    fn()
  }, [closeCommandPalette])

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={(open) => !open && closeCommandPalette()}
      className="max-w-[640px] bg-[#111113] border border-[#27272A] shadow-2xl"
    >
      <Command className="bg-[#111113] text-[#FAFAFA] rounded-xl" shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Buscar ou digitar comando..."
          className="text-[#FAFAFA] placeholder:text-[#52525B]"
        />
        <CommandList className="max-h-[400px] py-1">
          <CommandEmpty className="text-[13px] text-[#52525B]">Nenhum resultado encontrado.</CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading="Navegação">
            <CommandItem onSelect={() => navigate('/')} className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]">
              <LayoutDashboard className="w-4 h-4 text-[#52525B]" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => navigate('/ideas')} className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]">
              <Lightbulb className="w-4 h-4 text-[#52525B]" />
              Banco de Ideias
              <CommandShortcut>G I</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigate('/pipeline')} className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]">
              <GitBranch className="w-4 h-4 text-[#52525B]" />
              Pipeline
              <CommandShortcut>G P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigate('/metrics')} className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]">
              <BarChart2 className="w-4 h-4 text-[#52525B]" />
              Métricas
              <CommandShortcut>G M</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigate('/problems')} className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]">
              <AlertCircle className="w-4 h-4 text-[#52525B]" />
              Biblioteca de Problemas
            </CommandItem>
            <CommandItem onSelect={() => navigate('/roadmap')} className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]">
              <Map className="w-4 h-4 text-[#52525B]" />
              Roadmap
              <CommandShortcut>G R</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigate('/learning')} className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]">
              <BookOpen className="w-4 h-4 text-[#52525B]" />
              Aprendizado
              <CommandShortcut>G L</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="bg-[#27272A]" />

          {/* Quick actions */}
          <CommandGroup heading="Ações Rápidas">
            <CommandItem
              onSelect={() => runAction(() => openIdeaForm())}
              className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]"
            >
              <Plus className="w-4 h-4 text-[#6366F1]" />
              Nova Ideia
              <CommandShortcut>Ctrl+N</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runAction(() => openIdeaGenerator())}
              className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              Gerar ideias com IA
            </CommandItem>
            <CommandItem
              onSelect={() => { closeCommandPalette(); router.push('/problems'); }}
              className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]"
            >
              <Target className="w-4 h-4 text-[#EF4444]" />
              Novo Problema
            </CommandItem>
            <CommandItem
              onSelect={() => { closeCommandPalette(); router.push('/metrics'); }}
              className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]"
            >
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
              Registrar Métricas
            </CommandItem>
            <CommandItem
              onSelect={() => { closeCommandPalette(); router.push('/roadmap'); }}
              className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]"
            >
              <Map className="w-4 h-4 text-[#F59E0B]" />
              Novo Item no Roadmap
            </CommandItem>
            <CommandItem
              onSelect={() => { closeCommandPalette(); router.push('/learning'); }}
              className="text-[13px] text-[#A1A1AA] data-selected:bg-[#18181B] data-selected:text-[#FAFAFA]"
            >
              <BookOpen className="w-4 h-4 text-[#8B5CF6]" />
              Adicionar Recurso de Aprendizado
            </CommandItem>
          </CommandGroup>

          {/* Dynamic idea search results */}
          {ideas.length > 0 && (
            <>
              <CommandSeparator className="bg-[#27272A]" />
              <CommandGroup heading="Ideias">
                {ideas.map((idea) => (
                  <CommandItem
                    key={idea.id}
                    onSelect={() => navigate(`/ideas/${idea.id}`)}
                    className="text-[13px] data-selected:bg-[#18181B]"
                  >
                    <Lightbulb className="w-4 h-4 text-[#6366F1]" />
                    <span className="text-[#FAFAFA] flex-1 truncate">{idea.name}</span>
                    <span className="text-[11px] text-[#52525B] ml-2">
                      Score {Math.round(idea.score)} · {PIPELINE_STAGE_LABELS[idea.pipeline_stage]}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Dynamic problem search results */}
          {problems.length > 0 && (
            <>
              <CommandSeparator className="bg-[#27272A]" />
              <CommandGroup heading="Problemas">
                {problems.map((problem) => (
                  <CommandItem
                    key={problem.id}
                    onSelect={() => navigate('/problems')}
                    className="text-[13px] data-selected:bg-[#18181B]"
                  >
                    <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                    <span className="text-[#FAFAFA] flex-1 truncate">{problem.title}</span>
                    {problem.emotional_intensity && (
                      <span className="text-[11px] text-[#52525B] ml-2">
                        Intensidade {problem.emotional_intensity}/10
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
