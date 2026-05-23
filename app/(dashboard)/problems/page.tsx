import { Header } from '@/components/layout/header'
import { ProblemsClient } from '@/components/problems/problems-client'
import { createClient } from '@/lib/supabase/server'
import type { Problem, Idea } from '@/types'

export default async function ProblemsPage() {
  const supabase = await createClient()

  const [{ data: problems }, { data: ideas }] = await Promise.all([
    supabase.from('problems').select('*').order('created_at', { ascending: false }),
    supabase.from('ideas').select('id, name').eq('status', 'active').order('name'),
  ])

  return (
    <div className="flex flex-col h-full">
      <Header title="Biblioteca de Problemas" breadcrumb="B2C OS" />
      <ProblemsClient
        initialProblems={(problems ?? []) as Problem[]}
        ideas={(ideas ?? []) as Idea[]}
      />
    </div>
  )
}
