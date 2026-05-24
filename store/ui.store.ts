import { create } from 'zustand'

interface UIStore {
  // Ideas
  isIdeaFormOpen: boolean
  editingIdeaId: string | null
  openIdeaForm: (ideaId?: string) => void
  closeIdeaForm: () => void

  // Metrics
  isMetricFormOpen: boolean
  editingMetricId: string | null
  openMetricForm: (metricId?: string) => void
  closeMetricForm: () => void

  // Problems
  isProblemFormOpen: boolean
  editingProblemId: string | null
  openProblemForm: (problemId?: string) => void
  closeProblemForm: () => void

  // Roadmap
  isRoadmapFormOpen: boolean
  editingRoadmapId: string | null
  openRoadmapForm: (itemId?: string) => void
  closeRoadmapForm: () => void

  // Learning
  isLearningFormOpen: boolean
  editingLearningId: string | null
  openLearningForm: (resourceId?: string) => void
  closeLearningForm: () => void

  // Command Palette
  isCommandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void

  // Idea Generator
  isIdeaGeneratorOpen: boolean
  openIdeaGenerator: () => void
  closeIdeaGenerator: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isIdeaFormOpen: false,
  editingIdeaId: null,
  openIdeaForm: (ideaId) => set({ isIdeaFormOpen: true, editingIdeaId: ideaId ?? null }),
  closeIdeaForm: () => set({ isIdeaFormOpen: false, editingIdeaId: null }),

  isMetricFormOpen: false,
  editingMetricId: null,
  openMetricForm: (metricId) => set({ isMetricFormOpen: true, editingMetricId: metricId ?? null }),
  closeMetricForm: () => set({ isMetricFormOpen: false, editingMetricId: null }),

  isProblemFormOpen: false,
  editingProblemId: null,
  openProblemForm: (problemId) => set({ isProblemFormOpen: true, editingProblemId: problemId ?? null }),
  closeProblemForm: () => set({ isProblemFormOpen: false, editingProblemId: null }),

  isRoadmapFormOpen: false,
  editingRoadmapId: null,
  openRoadmapForm: (itemId) => set({ isRoadmapFormOpen: true, editingRoadmapId: itemId ?? null }),
  closeRoadmapForm: () => set({ isRoadmapFormOpen: false, editingRoadmapId: null }),

  isLearningFormOpen: false,
  editingLearningId: null,
  openLearningForm: (resourceId) => set({ isLearningFormOpen: true, editingLearningId: resourceId ?? null }),
  closeLearningForm: () => set({ isLearningFormOpen: false, editingLearningId: null }),

  isCommandPaletteOpen: false,
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),

  isIdeaGeneratorOpen: false,
  openIdeaGenerator: () => set({ isIdeaGeneratorOpen: true }),
  closeIdeaGenerator: () => set({ isIdeaGeneratorOpen: false }),
}))
