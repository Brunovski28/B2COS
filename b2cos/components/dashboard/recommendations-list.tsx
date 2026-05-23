import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Recommendation } from '@/lib/recommendations'

interface RecommendationsListProps {
  recommendations: Recommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111113] p-5 flex flex-col gap-4">
      <p className="text-[13px] font-semibold text-[#FAFAFA]">Próximas Ações</p>
      {recommendations.length === 0 && (
        <p className="text-[12px] text-[#52525B]">Nenhuma ação pendente. Ótimo trabalho!</p>
      )}
      <div className="space-y-1.5">
        {recommendations.map((rec, i) => (
          <Link
            key={rec.id}
            href={`/ideas/${rec.ideaId}`}
            className="flex items-start gap-2.5 rounded-lg hover:bg-[#18181B] px-2 py-2 -mx-2 transition-colors group"
          >
            <span className="text-[11px] font-bold text-[#3F3F46] mt-0.5 w-4 shrink-0">{i + 1}.</span>
            <span className="text-[12px] text-[#A1A1AA] flex-1 leading-snug group-hover:text-[#FAFAFA] transition-colors">
              {rec.message}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#3F3F46] group-hover:text-[#71717A] shrink-0 mt-0.5 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
