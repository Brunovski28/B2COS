import { Sidebar } from '@/components/layout/sidebar'
import { CommandPalette } from '@/components/layout/command-palette'
import { KeyboardShortcutsProvider } from '@/components/layout/keyboard-shortcuts-provider'
import { PageTransition } from '@/components/layout/page-transition'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0B]">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[220px] overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
      <CommandPalette />
      <KeyboardShortcutsProvider />
    </div>
  )
}
