'use client'

import { useIdeasStore } from '@/store/ideas.store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { PIPELINE_STAGE_LABELS } from '@/types'
import type { PipelineStage } from '@/types'

export function IdeaFilters() {
  const { filters, setFilter } = useIdeasStore()

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525B]" />
        <Input
          placeholder="Buscar ideias..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="pl-8 h-8 w-52 bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[12px] placeholder:text-[#52525B]"
        />
      </div>

      {/* Status */}
      <Select value={filters.status} onValueChange={(v) => setFilter('status', v as typeof filters.status)}>
        <SelectTrigger className="h-8 w-32 bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="archived">Arquivados</SelectItem>
          <SelectItem value="discarded">Descartados</SelectItem>
        </SelectContent>
      </Select>

      {/* Pipeline Stage */}
      <Select
        value={filters.pipelineStage}
        onValueChange={(v) => setFilter('pipelineStage', v as PipelineStage | 'all')}
      >
        <SelectTrigger className="h-8 w-36 bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[12px]">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
          <SelectItem value="all">Todos stages</SelectItem>
          {Object.entries(PIPELINE_STAGE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Ordenação */}
      <Select value={filters.sortBy} onValueChange={(v) => setFilter('sortBy', v as typeof filters.sortBy)}>
        <SelectTrigger className="h-8 w-36 bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
          <SelectItem value="score">Por score</SelectItem>
          <SelectItem value="created_at">Por data</SelectItem>
          <SelectItem value="name">Por nome</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
