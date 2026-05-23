import { AlertItem } from './alert-item'
import type { Alert } from '@/lib/alerts'

interface AlertsListProps {
  alerts: Alert[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111113] p-5 flex flex-col gap-4">
      <p className="text-[13px] font-semibold text-[#FAFAFA]">Alertas Estratégicos</p>
      {alerts.length === 0 && (
        <p className="text-[12px] text-[#52525B]">Nenhum alerta ativo.</p>
      )}
      <div className="space-y-2">
        {alerts.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  )
}
