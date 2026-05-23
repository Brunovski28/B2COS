import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { MetricCard } from '@/components/dashboard/metric-card'
import { PipelineDistribution } from '@/components/dashboard/pipeline-distribution'
import { TopIdeas } from '@/components/dashboard/top-ideas'
import { ContainerStatus } from '@/components/dashboard/container-status'
import { AlertsList } from '@/components/dashboard/alerts-list'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { RecommendationsList } from '@/components/dashboard/recommendations-list'
import { DashboardRefresh } from '@/components/dashboard/dashboard-refresh'
import { generateAlerts } from '@/lib/alerts'
import { generateRecommendations } from '@/lib/recommendations'
import { checkGate } from '@/lib/pipeline-rules'
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react'
import type { Idea, ContainerAnalysis, PipelineEvent, PipelineStage } from '@/types'

export const dynamic = 'force-dynamic'

const STAGES: PipelineStage[] = [
  'epiphany', 'triage', 'validation', 'mvp',
  'launch', 'retention', 'monetization', 'scale',
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: ideas },
    { data: containers },
    { data: events },
  ] = await Promise.all([
    supabase.from('ideas').select('*').eq('status', 'active').order('score', { ascending: false }),
    supabase.from('container_analyses').select('*'),
    supabase.from('pipeline_events').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  const activeIdeas = (ideas ?? []) as Idea[]
  const allContainers = (containers ?? []) as ContainerAnalysis[]
  const recentEvents = (events ?? []) as PipelineEvent[]

  // Metrics
  const avgScore = activeIdeas.length > 0
    ? Math.round(activeIdeas.reduce((s, i) => s + i.score, 0) / activeIdeas.length)
    : 0

  const containersByIdea = new Map<string, ContainerAnalysis[]>()
  for (const c of allContainers) {
    const list = containersByIdea.get(c.idea_id) ?? []
    list.push(c)
    containersByIdea.set(c.idea_id, list)
  }

  let blockedCount = 0
  for (const idea of activeIdeas) {
    const stageIdx = STAGES.indexOf(idea.pipeline_stage)
    if (stageIdx < STAGES.length - 1) {
      const nextStage = STAGES[stageIdx + 1]
      const ideaContainers = Object.fromEntries(
        (containersByIdea.get(idea.id) ?? []).map(c => [c.container_type, c])
      )
      const { canAdvance } = checkGate(idea, ideaContainers, nextStage)
      if (!canAdvance) blockedCount++
    }
  }

  const countByStage: Record<string, number> = {}
  for (const idea of activeIdeas) {
    countByStage[idea.pipeline_stage] = (countByStage[idea.pipeline_stage] ?? 0) + 1
  }

  const alerts = generateAlerts({ ideas: activeIdeas, events: recentEvents, containers: allContainers })
  const recommendations = generateRecommendations({ ideas: activeIdeas, containers: allContainers, events: recentEvents })

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        breadcrumb="B2C OS"
        actions={<DashboardRefresh />}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Widget 1: Top metrics row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Ideias Ativas"
            value={activeIdeas.length}
            icon={Lightbulb}
            color="#6366F1"
          />
          <MetricCard
            label="Score Médio"
            value={avgScore}
            icon={TrendingUp}
            color="#22C55E"
          />
          <MetricCard
            label="Gate Bloqueado"
            value={blockedCount}
            icon={AlertTriangle}
            color="#EF4444"
            alert={blockedCount > 0}
          />
        </div>

        {/* Widget 4: Container status — full width */}
        <ContainerStatus containers={allContainers} totalIdeas={activeIdeas.length} />

        {/* Widgets 2 + 3: Distribution + Top ideas side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PipelineDistribution countByStage={countByStage} />
          <TopIdeas ideas={activeIdeas} />
        </div>

        {/* Widgets 5 + 7: Alerts + Recommendations side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertsList alerts={alerts} />
          <RecommendationsList recommendations={recommendations} />
        </div>

        {/* Widget 6: Recent activity — full width */}
        <ActivityFeed events={recentEvents} ideas={activeIdeas} />

      </div>
    </div>
  )
}
