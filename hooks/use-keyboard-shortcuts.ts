'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/ui.store'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const { openIdeaForm, openCommandPalette } = useUIStore()
  const gKeyPending = useRef(false)
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function isInInput(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      return (
        t.tagName === 'INPUT' ||
        t.tagName === 'TEXTAREA' ||
        t.contentEditable === 'true' ||
        t.closest('[role="dialog"]') !== null
      )
    }

    function handleKeyDown(e: KeyboardEvent) {
      // ⌘K / Ctrl+K — handled by CommandPalette itself
      // ⌘N / Ctrl+N — new idea (everywhere)
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        openIdeaForm()
        return
      }

      // Navigation shortcuts blocked inside inputs/dialogs
      if (isInInput(e)) return

      // G + letter sequence navigation
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        gKeyPending.current = true
        if (gTimer.current) clearTimeout(gTimer.current)
        gTimer.current = setTimeout(() => { gKeyPending.current = false }, 600)
        return
      }

      if (gKeyPending.current) {
        gKeyPending.current = false
        if (gTimer.current) clearTimeout(gTimer.current)

        const destinations: Record<string, string> = {
          i: '/ideas',
          p: '/pipeline',
          m: '/metrics',
          r: '/roadmap',
          l: '/learning',
        }
        const dest = destinations[e.key.toLowerCase()]
        if (dest) {
          e.preventDefault()
          router.push(dest)
        }
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (gTimer.current) clearTimeout(gTimer.current)
    }
  }, [router, openIdeaForm, openCommandPalette])
}
