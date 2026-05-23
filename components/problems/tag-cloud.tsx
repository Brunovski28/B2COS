'use client'

interface TagCloudProps {
  tags: Map<string, number>
  activeTag: string | null
  onTagClick: (tag: string | null) => void
}

export function TagCloud({ tags, activeTag, onTagClick }: TagCloudProps) {
  if (tags.size === 0) return null

  const maxCount = Math.max(...tags.values())
  const minCount = Math.min(...tags.values())

  function getFontSize(count: number): number {
    if (maxCount === minCount) return 14
    return 11 + ((count - minCount) / (maxCount - minCount)) * 10
  }

  function getOpacity(count: number): number {
    if (maxCount === minCount) return 1
    return 0.5 + ((count - minCount) / (maxCount - minCount)) * 0.5
  }

  const sorted = Array.from(tags.entries()).sort((a, b) => b[1] - a[1])

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {sorted.map(([tag, count]) => {
        const isActive = activeTag === tag
        return (
          <button
            key={tag}
            onClick={() => onTagClick(isActive ? null : tag)}
            style={{ fontSize: getFontSize(count), opacity: isActive ? 1 : getOpacity(count) }}
            className={`rounded-full px-2.5 py-1 transition-all font-medium ${
              isActive
                ? 'bg-[#6366F1] text-white'
                : 'bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:border-[#6366F1] hover:text-[#6366F1]'
            }`}
          >
            {tag} <span className="text-[10px] opacity-60">({count})</span>
          </button>
        )
      })}
    </div>
  )
}
