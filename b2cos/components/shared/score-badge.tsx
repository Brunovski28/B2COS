import { getScoreClassification } from '@/lib/scoring'

interface ScoreBadgeProps {
  score: number
  showEmoji?: boolean
}

export function ScoreBadge({ score, showEmoji = false }: ScoreBadgeProps) {
  const { color, bgColor, label, emoji } = getScoreClassification(score)

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
      style={{ color, backgroundColor: bgColor }}
    >
      {showEmoji && <span>{emoji}</span>}
      {Math.round(score)}
    </span>
  )
}
