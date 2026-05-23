'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import type { ContainerType } from '@/types'

interface FieldProps {
  answers: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

function SelectField({
  label,
  fieldKey,
  options,
  answers,
  onChange,
}: FieldProps & { label: string; fieldKey: string; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] text-[#A1A1AA]">{label}</Label>
      <Select
        value={String(answers[fieldKey] ?? '')}
        onValueChange={(v) => onChange(fieldKey, v)}
      >
        <SelectTrigger className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]">
          <SelectValue placeholder="Selecionar..." />
        </SelectTrigger>
        <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function SliderField({
  label,
  fieldKey,
  answers,
  onChange,
  min = 1,
  max = 10,
}: FieldProps & { label: string; fieldKey: string; min?: number; max?: number }) {
  const value = Number(answers[fieldKey] ?? Math.round((max + min) / 2))
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-[12px] text-[#A1A1AA]">{label}</Label>
        <span className="text-[12px] font-mono text-[#6366F1]">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={(vals) => onChange(fieldKey, Array.isArray(vals) ? vals[0] : Number(vals))}
      />
    </div>
  )
}

// ── Discovery Fields ──────────────────────────────────────────────────────────
function DiscoveryFields({ answers, onChange }: FieldProps) {
  return (
    <div className="space-y-5">
      <SliderField label="Intensidade da dor (1–10)" fieldKey="pain_intensity" answers={answers} onChange={onChange} />
      <SelectField
        label="Busca solução ativamente?"
        fieldKey="seeks_solution"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'yes', label: 'Sim — busca ativamente' },
          { value: 'sometimes', label: 'Às vezes' },
          { value: 'no', label: 'Não' },
        ]}
      />
      <SelectField
        label="Frequência da dor"
        fieldKey="pain_frequency"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'daily', label: 'Diária' },
          { value: 'weekly', label: 'Semanal' },
          { value: 'monthly', label: 'Mensal' },
          { value: 'rarely', label: 'Raramente' },
        ]}
      />
      <SelectField
        label="Custo atual da dor"
        fieldKey="pain_cost"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'high', label: 'Alto (tempo + dinheiro)' },
          { value: 'medium', label: 'Médio' },
          { value: 'low', label: 'Baixo' },
        ]}
      />
      <SelectField
        label="Segmento-alvo definido?"
        fieldKey="segment_clarity"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'clear', label: 'Muito claro' },
          { value: 'vague', label: 'Vago' },
          { value: 'undefined', label: 'Indefinido' },
        ]}
      />
    </div>
  )
}

// ── Validation Fields ─────────────────────────────────────────────────────────
function ValidationFields({ answers, onChange }: FieldProps) {
  return (
    <div className="space-y-5">
      <SliderField label="Entrevistas realizadas" fieldKey="interviews_count" answers={answers} onChange={onChange} min={0} max={20} />
      <SelectField
        label="Fake door / landing page?"
        fieldKey="fake_door"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'with_data', label: 'Sim, com dados reais' },
          { value: 'without_data', label: 'Criada, sem dados ainda' },
          { value: 'no', label: 'Não' },
        ]}
      />
      <SelectField
        label="Taxa de sinalização de interesse"
        fieldKey="interest_rate"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'high', label: '> 15% (forte)' },
          { value: 'medium', label: '5–15%' },
          { value: 'low', label: '< 5%' },
          { value: 'none', label: 'Sem dados' },
        ]}
      />
      <SelectField
        label="Risco de viés de confirmação"
        fieldKey="confirmation_bias"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'low', label: 'Baixo — entrevistas neutras' },
          { value: 'medium', label: 'Médio' },
          { value: 'high', label: 'Alto — só amigos/família' },
        ]}
      />
    </div>
  )
}

// ── Retention Fields ──────────────────────────────────────────────────────────
function RetentionFields({ answers, onChange }: FieldProps) {
  return (
    <div className="space-y-5">
      <SelectField
        label="Loop de habituação natural?"
        fieldKey="habit_loop"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'strong', label: 'Forte — uso intrínseco ao problema' },
          { value: 'weak', label: 'Fraco — precisa de push' },
          { value: 'none', label: 'Nenhum identificado' },
        ]}
      />
      <SelectField
        label="D1 projetado"
        fieldKey="d1_projected"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'high', label: '> 40% (excelente)' },
          { value: 'medium', label: '25–40% (bom)' },
          { value: 'low', label: '< 25% (abaixo da média)' },
        ]}
      />
      <SelectField
        label="D7 projetado"
        fieldKey="d7_projected"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'high', label: '> 20% (excelente)' },
          { value: 'medium', label: '10–20% (bom)' },
          { value: 'low', label: '< 10% (abaixo da média)' },
        ]}
      />
      <SelectField
        label="D30 projetado"
        fieldKey="d30_projected"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'high', label: '> 10% (excelente)' },
          { value: 'medium', label: '5–10% (ok)' },
          { value: 'low', label: '< 5% (fraco)' },
        ]}
      />
      <SelectField
        label="Custo de troca cresce com uso?"
        fieldKey="switching_cost"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'yes', label: 'Sim — dados/hábitos acumulados' },
          { value: 'no', label: 'Não' },
        ]}
      />
    </div>
  )
}

// ── Distribution Fields ───────────────────────────────────────────────────────
function DistributionFields({ answers, onChange }: FieldProps) {
  return (
    <div className="space-y-5">
      <SelectField
        label="Canal primário de aquisição"
        fieldKey="primary_channel"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'clear', label: 'Claro e testável' },
          { value: 'hypothesis', label: 'Hipótese ainda a validar' },
          { value: 'undefined', label: 'Indefinido' },
        ]}
      />
      <SelectField
        label="Potencial SEO"
        fieldKey="seo_potential"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'high', label: 'Alto — muita busca intencional' },
          { value: 'medium', label: 'Médio' },
          { value: 'low', label: 'Baixo' },
          { value: 'none', label: 'Inexistente' },
        ]}
      />
      <SelectField
        label="Potencial viral / compartilhamento"
        fieldKey="viral_potential"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'high', label: 'Alto — produto usado em público' },
          { value: 'medium', label: 'Médio' },
          { value: 'low', label: 'Baixo' },
        ]}
      />
      <SelectField
        label="CAC estimado < 20% do LTV?"
        fieldKey="cac_ltv_viable"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'yes', label: 'Sim — viável' },
          { value: 'uncertain', label: 'Incerto' },
          { value: 'no', label: 'Não — inviável' },
        ]}
      />
    </div>
  )
}

// ── MVP Fields ────────────────────────────────────────────────────────────────
function MvpFields({ answers, onChange }: FieldProps) {
  return (
    <div className="space-y-5">
      <SelectField
        label="MVP definido em quantas features?"
        fieldKey="feature_count"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'few', label: '≤ 3 features (ideal)' },
          { value: 'medium', label: '4–5 features' },
          { value: 'many', label: 'Mais de 5' },
        ]}
      />
      <SelectField
        label="Tempo estimado de build"
        fieldKey="build_time"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'under_2w', label: '< 2 semanas' },
          { value: 'under_4w', label: '2–4 semanas' },
          { value: 'under_2m', label: '1–2 meses' },
          { value: 'over_2m', label: '> 2 meses' },
        ]}
      />
      <SelectField
        label="Feature de diferenciação clara?"
        fieldKey="differentiator"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'yes', label: 'Sim — clara e defensável' },
          { value: 'partial', label: 'Parcial' },
          { value: 'no', label: 'Não' },
        ]}
      />
      <SelectField
        label="Hipótese principal testável pelo MVP?"
        fieldKey="testable_hypothesis"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'yes', label: 'Sim — critério de go/no-go claro' },
          { value: 'partial', label: 'Parcialmente' },
          { value: 'no', label: 'Não definido' },
        ]}
      />
    </div>
  )
}

// ── Monetization Fields ───────────────────────────────────────────────────────
function MonetizationFields({ answers, onChange }: FieldProps) {
  return (
    <div className="space-y-5">
      <SelectField
        label="Modelo de monetização definido?"
        fieldKey="monetization_model"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'clear', label: 'Claro e testado' },
          { value: 'hypothesis', label: 'Hipótese' },
          { value: 'undefined', label: 'Indefinido' },
        ]}
      />
      <SelectField
        label="LTV/CAC estimado"
        fieldKey="ltv_cac_ratio"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'excellent', label: '≥ 5:1 (excelente)' },
          { value: 'good', label: '3–5:1 (bom)' },
          { value: 'poor', label: '1–3:1 (baixo)' },
          { value: 'bad', label: '< 1:1 (inviável)' },
        ]}
      />
      <SelectField
        label="Recorrência do pagamento"
        fieldKey="payment_recurrence"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'subscription', label: 'Mensal/anual (assinatura)' },
          { value: 'transactional', label: 'Transacional' },
          { value: 'one_time', label: 'One-time' },
        ]}
      />
      <SelectField
        label="Payback period"
        fieldKey="payback_period"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'fast', label: '< 6 meses' },
          { value: 'medium', label: '6–12 meses' },
          { value: 'slow', label: '> 12 meses' },
        ]}
      />
    </div>
  )
}

// ── Scale Fields ──────────────────────────────────────────────────────────────
function ScaleFields({ answers, onChange }: FieldProps) {
  return (
    <div className="space-y-5">
      <SelectField
        label="% de operações automatizáveis"
        fieldKey="automation_level"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'high', label: '> 80%' },
          { value: 'medium', label: '50–80%' },
          { value: 'low', label: '< 50%' },
        ]}
      />
      <SelectField
        label="Dependência do fundador em ops críticas"
        fieldKey="founder_dependency"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'low', label: '< 20% (escalável)' },
          { value: 'medium', label: '20–50%' },
          { value: 'high', label: '> 50% (gargalo)' },
        ]}
      />
      <SelectField
        label="Unit economics melhora com escala?"
        fieldKey="unit_economics"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'improves', label: 'Melhora (custos decrescentes)' },
          { value: 'neutral', label: 'Neutro' },
          { value: 'worsens', label: 'Piora (custo linear)' },
        ]}
      />
      <SelectField
        label="Processos documentados e replicáveis?"
        fieldKey="processes_documented"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'yes', label: 'Sim' },
          { value: 'partial', label: 'Parcialmente' },
          { value: 'no', label: 'Não' },
        ]}
      />
    </div>
  )
}

// ── Behavior Fields ───────────────────────────────────────────────────────────
function BehaviorFields({ answers, onChange }: FieldProps) {
  return (
    <div className="space-y-5">
      <SelectField
        label="Gatilho emocional primário identificado?"
        fieldKey="emotional_trigger"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'strong', label: 'Forte e claro' },
          { value: 'weak', label: 'Fraco' },
          { value: 'none', label: 'Ausente' },
        ]}
      />
      <SelectField
        label="Resolve medo (perda) ou desejo (ganho)?"
        fieldKey="primary_motivation"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'fear', label: 'Medo/perda (mais poderoso)' },
          { value: 'desire', label: 'Desejo/ganho' },
          { value: 'neutral', label: 'Neutro' },
        ]}
      />
      <SelectField
        label="Nível de conveniência / redução de friction"
        fieldKey="convenience_level"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'high', label: 'Alta — resolve com muito menos esforço' },
          { value: 'medium', label: 'Média' },
          { value: 'low', label: 'Baixa — pode até aumentar friction' },
        ]}
      />
      <SelectField
        label="Identidade do usuário envolvida?"
        fieldKey="identity_involved"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'yes', label: 'Sim — status, pertencimento' },
          { value: 'no', label: 'Não' },
        ]}
      />
      <SelectField
        label="Momento de uso definido?"
        fieldKey="usage_moment"
        answers={answers}
        onChange={onChange}
        options={[
          { value: 'clear', label: 'Claro — trigger + contexto' },
          { value: 'vague', label: 'Vago' },
        ]}
      />
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function ContainerFormFields({ type, answers, onChange }: { type: ContainerType } & FieldProps) {
  switch (type) {
    case 'discovery': return <DiscoveryFields answers={answers} onChange={onChange} />
    case 'validation': return <ValidationFields answers={answers} onChange={onChange} />
    case 'retention': return <RetentionFields answers={answers} onChange={onChange} />
    case 'distribution': return <DistributionFields answers={answers} onChange={onChange} />
    case 'mvp': return <MvpFields answers={answers} onChange={onChange} />
    case 'monetization': return <MonetizationFields answers={answers} onChange={onChange} />
    case 'scale': return <ScaleFields answers={answers} onChange={onChange} />
    case 'behavior': return <BehaviorFields answers={answers} onChange={onChange} />
  }
}
