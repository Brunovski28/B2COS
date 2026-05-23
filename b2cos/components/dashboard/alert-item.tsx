import Link from 'next/link'
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Alert } from '@/lib/alerts'

const typeConfig = {
  danger: { icon: AlertCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  info: { icon: Info, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
  success: { icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
}

interface AlertItemProps {
  alert: Alert
}

export function AlertItem({ alert }: AlertItemProps) {
  const config = typeConfig[alert.type]
  const Icon = config.icon

  const content = (
    <div
      className="flex items-start gap-2.5 rounded-lg p-2.5"
      style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
    >
      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: config.color }} />
      <span className="text-[12px] text-[#A1A1AA] leading-snug">{alert.message}</span>
    </div>
  )

  if (alert.ideaId) {
    return <Link href={`/ideas/${alert.ideaId}`}>{content}</Link>
  }
  return content
}
