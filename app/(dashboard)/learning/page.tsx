import { Header } from '@/components/layout/header'
import { LearningClient } from '@/components/learning/learning-client'
import { createClient } from '@/lib/supabase/server'
import type { LearningResource, Idea } from '@/types'

export default async function LearningPage() {
  const supabase = await createClient()

  const [{ data: resources }, { data: ideas }] = await Promise.all([
    supabase.from('learning_resources').select('*').order('updated_at', { ascending: false }),
    supabase.from('ideas').select('id, name').eq('status', 'active').order('name'),
  ])

  return (
    <div className="flex flex-col h-full">
      <Header title="Sistema de Aprendizado" breadcrumb="B2C OS" />
      <LearningClient
        initialResources={(resources ?? []) as LearningResource[]}
        ideas={(ideas ?? []) as Idea[]}
      />
    </div>
  )
}
