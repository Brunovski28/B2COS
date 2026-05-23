import { Header } from '@/components/layout/header'
import { MetricsClient } from '@/components/metrics/metrics-client'
import { createClient } from '@/lib/supabase/server'
import type { MetricEntry, Idea } from '@/types'

export default async function MetricsPage() {
  const supabase = await createClient()

  const [{ data: metrics }, { data: ideas }] = await Promise.all([
    supabase.from('metrics').select('*').order('date', { ascending: false }),
    supabase.from('ideas').select('id, name').eq('status', 'active').order('name'),
  ])

  return (
    <div className="flex flex-col h-full">
      <Header title="Métricas" breadcrumb="B2C OS" />
      <MetricsClient
        initialMetrics={(metrics ?? []) as MetricEntry[]}
        ideas={(ideas ?? []) as Idea[]}
      />
    </div>
  )
}
