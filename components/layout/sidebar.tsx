'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ideas', label: 'Ideias', icon: Lightbulb },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { href: '/problems', label: 'Problemas', icon: AlertCircle },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/metrics', label: 'Métricas', icon: BarChart2 },
  { href: '/learning', label: 'Aprendizado', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

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

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
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
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6366F1] rounded-r" />
              )}
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#6366F1]' : 'text-[#52525B] group-hover:text-[#A1A1AA]')} />
              {label}
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
