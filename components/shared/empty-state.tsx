import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon = '💡', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center justify-center mb-4 text-2xl">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-[#FAFAFA] mb-2">{title}</h3>
      <p className="text-[13px] text-[#52525B] max-w-[320px] leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px]"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
