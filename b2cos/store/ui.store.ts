import { create } from 'zustand'

interface UIStore {
  isIdeaFormOpen: boolean
  editingIdeaId: string | null
  openIdeaForm: (ideaId?: string) => void
  closeIdeaForm: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isIdeaFormOpen: false,
  editingIdeaId: null,
  openIdeaForm: (ideaId) => set({ isIdeaFormOpen: true, editingIdeaId: ideaId ?? null }),
  closeIdeaForm: () => set({ isIdeaFormOpen: false, editingIdeaId: null }),
}))
