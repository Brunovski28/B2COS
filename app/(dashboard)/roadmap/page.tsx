import { Header } from '@/components/layout/header'
import { RoadmapClient } from '@/components/roadmap/roadmap-client'
import { createClient } from '@/lib/supabase/server'
import type { RoadmapItem, Idea } from '@/types'

export default async function RoadmapPage() {
  const supabase = await createClient()

  const [{ data: items }, { data: ideas }] = await Promise.all([
    supabase.from('roadmap_items').select('*').order('order_index'),
    supabase.from('ideas').select('id, name').eq('status', 'active').order('name'),
  ])

  return (
    <div className="flex flex-col h-full">
      <Header title="Roadmap" breadcrumb="B2C OS" />
      <RoadmapClient
        initialItems={(items ?? []) as RoadmapItem[]}
        ideas={(ideas ?? []) as Idea[]}
      />
    </div>
  )
}
