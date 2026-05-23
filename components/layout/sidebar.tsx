'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Lightbulb,
  GitBranch,
  AlertCircle,
  Map,
  BarChart2,
  BookOpen,
  LogOut,
  Zap,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, countKey: null },
  { href: '/ideas', label: 'Ideias', icon: Lightbulb, countKey: 'ideas' },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch, countKey: 'pipeline' },
  { href: '/problems', label: 'Problemas', icon: AlertCircle, countKey: null },
  { href: '/roadmap', label: 'Roadmap', icon: Map, countKey: null },
  { href: '/metrics', label: 'Métricas', icon: BarChart2, countKey: null },
  { href: '/learning', label: 'Aprendizado', icon: BookOpen, countKey: null },
] as const

type CountKey = 'ideas' | 'pipeline'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const openCommandPalette = useUIStore((s) => s.openCommandPalette)
  const [counts, setCounts] = useState<Record<CountKey, number>>({ ideas: 0, pipeline: 0 })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('ideas').select('id, pipeline_stage', { count: 'exact', head: false }).eq('status', 'active'),
    ]).then(([{ data: ideas }]) => {
      const all = ideas ?? []
      const pipelineStages = ['validation', 'mvp', 'launch', 'retention', 'monetization', 'scale']
      setCounts({
        ideas: all.length,
        pipeline: all.filter((i) => pipelineStages.includes(i.pipeline_stage)).length,
      })
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col bg-[#111113] border-r border-[#27272A] z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#27272A]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6366F1] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-[#FAFAFA]">B2C OS</p>
            <p className="text-[10px] text-[#52525B] leading-none">Operating System</p>
          </div>
        </div>
      </div>

      {/* Search shortcut */}
      <div className="px-3 pt-3">
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-[#18181B] border border-[#27272A] text-[#52525B] hover:border-[#3F3F46] hover:text-[#A1A1AA] transition-colors text-[12px]"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Buscar...</span>
          <span className="text-[10px] px-1 py-0.5 rounded bg-[#27272A]">⌘K</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, countKey }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const count = countKey ? counts[countKey] : null

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors relative group',
                isActive
                  ? 'bg-[#18181B] text-[#FAFAFA]'
                  : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-[#FAFAFA]'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6366F1] rounded-r"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  isActive ? 'text-[#6366F1]' : 'text-[#52525B] group-hover:text-[#A1A1AA]'
                )}
              />
              <span className="flex-1">{label}</span>
              {count !== null && count > 0 && (
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                  isActive
                    ? 'bg-[#6366F1]/20 text-[#818CF8]'
                    : 'bg-[#27272A] text-[#52525B]'
                )}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#27272A]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-[13px] font-medium text-[#52525B] hover:text-[#EF4444] hover:bg-[#18181B] transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
