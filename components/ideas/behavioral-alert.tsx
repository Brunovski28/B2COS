import { AlertTriangle } from 'lucide-react'
import type { BehavioralAlert } from '@/lib/ai/skill'

interface BehavioralAlertBannerProps {
  alert: BehavioralAlert
}

export function BehavioralAlertBanner({ alert }: BehavioralAlertBannerProps) {
  if (!alert.detected) return null

  return (
    <div className="rounded-lg border border-amber-700/60 bg-amber-950/40 p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-amber-300 mb-1">
            ALERTA: Concorrência Comportamental Detectada
          </p>
          <p className="text-[12px] text-amber-200/70 leading-relaxed mb-3">
            Este produto compete não só com apps ou serviços, mas com comportamentos enraizados (inércia, evitação, impulso, rotina).
            Isso eleva o custo de retenção e torna a aquisição enganosamente fácil: downloads altos, ativação baixa.
          </p>
          {alert.signals.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] text-amber-400/80 font-medium uppercase tracking-wider mb-1.5">
                Sinais detectados:
              </p>
              <div className="flex flex-wrap gap-2">
                {alert.signals.map((signal, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded border border-amber-700/40"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
          {alert.message && (
            <p className="text-[12px] text-amber-200/60 italic">{alert.message}</p>
          )}
          <p className="text-[11px] text-amber-400/60 mt-2">
            Os critérios de Dor Desejada e Retenção foram avaliados com rigor extra.
          </p>
        </div>
      </div>
    </div>
  )
}

export function BehavioralAlertIcon() {
  return (
    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" aria-label="Concorrência Comportamental detectada" />
  )
}
