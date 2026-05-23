import Link from 'next/link'
import { ScoreGauge } from '@/components/shared/score-gauge'
import { StageBadge } from '@/components/shared/stage-badge'
import type { Idea } from '@/types'

interface TopIdeasProps {
  ideas: Idea[]
}

export function TopIdeas({ ideas }: TopIdeasProps) {
  const top = ideas.slice(0, 5)

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111113] p-5 flex flex-col gap-4">
      <p className="text-[13px] font-semibold text-[#FAFAFA]">Top 5 por Score</p>
      {top.length === 0 && (
        <p className="text-[12px] text-[#52525B]">Nenhuma ideia ativa ainda.</p>
      )}
      <div className="space-y-2">
        {top.map((idea, i) => (
          <Link
            key={idea.id}
            href={`/ideas/${idea.id}`}
            className="flex items-center gap-3 rounded-lg hover:bg-[#18181B] px-2 py-1.5 -mx-2 transition-colors group"
          >
            <span className="text-[11px] font-medium text-[#52525B] w-4 shrink-0">#{i + 1}</span>
            <span className="text-[12px] font-medium text-[#A1A1AA] flex-1 truncate group-hover:text-[#FAFAFA] transition-colors">
              {idea.name}
            </span>
            <StageBadge stage={idea.pipeline_stage} size="sm" />
            <ScoreGauge score={idea.score} size={28} strokeWidth={3} showLabel={false} />
          </Link>
        ))}
      </div>
    </div>
  )
}
