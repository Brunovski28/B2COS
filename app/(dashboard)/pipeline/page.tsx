import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import type { Idea, ContainerAnalysis } from '@/types'

export const dynamic = 'force-dynamic'

export default async function PipelinePage() {
  const supabase = await createClient()

  const [{ data: ideas }, { data: containers }] = await Promise.all([
    supabase
      .from('ideas')
      .select('*')
      .eq('status', 'active')
      .order('score', { ascending: false }),
    supabase
      .from('container_analyses')
      .select('*'),
  ])

  const activeIdeas = (ideas ?? []) as Idea[]
  const allContainers = (containers ?? []) as ContainerAnalysis[]

  const totalByStage: Record<string, number> = {}
  for (const idea of activeIdeas) {
    totalByStage[idea.pipeline_stage] = (totalByStage[idea.pipeline_stage] ?? 0) + 1
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Pipeline de Ideias"
        breadcrumb={`B2C OS — ${activeIdeas.length} ideia${activeIdeas.length !== 1 ? 's' : ''} ativas`}
      />

      <div className="flex-1 overflow-hidden p-6 flex flex-col gap-4">
        {/* Stage summary chips */}
        <div className="flex items-center gap-2 flex-wrap text-[12px]">
          {Object.entries(totalByStage).length === 0 && (
            <span className="text-[#52525B]">Nenhuma ideia ativa. Crie uma em <a href="/ideas" className="text-[#6366F1] hover:underline">Ideias</a>.</span>
          )}
        </div>

        {/* Scrollable Kanban board */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <PipelineBoard
            initialIdeas={activeIdeas}
            containers={allContainers}
          />
        </div>
      </div>
    </div>
  )
}
