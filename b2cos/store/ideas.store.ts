import { create } from 'zustand'
import type { IdeaStatus, PipelineStage } from '@/types'

interface IdeasFilters {
  status: IdeaStatus | 'all'
  pipelineStage: PipelineStage | 'all'
  sortBy: 'score' | 'created_at' | 'name'
  search: string
}

interface IdeasStore {
  filters: IdeasFilters
  setFilter: <K extends keyof IdeasFilters>(key: K, value: IdeasFilters[K]) => void
  resetFilters: () => void
}

const defaultFilters: IdeasFilters = {
  status: 'active',
  pipelineStage: 'all',
  sortBy: 'score',
  search: '',
}

export const useIdeasStore = create<IdeasStore>((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
}))
