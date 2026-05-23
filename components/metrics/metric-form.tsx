'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUIStore } from '@/store/ui.store'
import type { Idea } from '@/types'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const nanToNull = (v: number) => (isNaN(v) ? null : v)

const metricSchema = z.object({
  idea_id: z.string().optional(),
  date: z.string().min(1, 'Data obrigatória'),
  d1_retention: z.number().transform(nanToNull).nullable(),
  d7_retention: z.number().transform(nanToNull).nullable(),
  d30_retention: z.number().transform(nanToNull).nullable(),
  churn_rate: z.number().transform(nanToNull).nullable(),
  mrr: z.number().transform(nanToNull).nullable(),
  cac: z.number().transform(nanToNull).nullable(),
  ctr: z.number().transform(nanToNull).nullable(),
  new_users: z.number().transform(nanToNull).nullable(),
  active_users: z.number().transform(nanToNull).nullable(),
  notes: z.string().optional(),
})

type MetricFormData = z.infer<typeof metricSchema>

interface MetricFormProps {
  ideas: Idea[]
  selectedIdeaId?: string | null
  onSuccess?: () => void
}

export function MetricForm({ ideas, selectedIdeaId, onSuccess }: MetricFormProps) {
  const { isMetricFormOpen, editingMetricId, closeMetricForm } = useUIStore()
  const [loading, setLoading] = useState(false)
  const [ideaId, setIdeaId] = useState<string>(selectedIdeaId ?? '')

  const form = useForm<MetricFormData>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      d1_retention: NaN,
      d7_retention: NaN,
      d30_retention: NaN,
      churn_rate: NaN,
      mrr: NaN,
      cac: NaN,
      ctr: NaN,
      new_users: NaN,
      active_users: NaN,
      notes: '',
    },
  })

  useEffect(() => {
    if (isMetricFormOpen && editingMetricId) {
      const supabase = createClient()
      supabase.from('metrics').select('*').eq('id', editingMetricId).single().then(({ data }) => {
        if (data) {
          setIdeaId(data.idea_id ?? '')
          form.reset({
            date: data.date,
            d1_retention: data.d1_retention ?? NaN,
            d7_retention: data.d7_retention ?? NaN,
            d30_retention: data.d30_retention ?? NaN,
            churn_rate: data.churn_rate ?? NaN,
            mrr: data.mrr ?? NaN,
            cac: data.cac ?? NaN,
            ctr: data.ctr ?? NaN,
            new_users: data.new_users ?? NaN,
            active_users: data.active_users ?? NaN,
            notes: data.notes ?? '',
          })
        }
      })
    } else if (isMetricFormOpen && !editingMetricId) {
      setIdeaId(selectedIdeaId ?? '')
      form.reset({
        date: new Date().toISOString().split('T')[0],
        d1_retention: NaN,
        d7_retention: NaN,
        d30_retention: NaN,
        churn_rate: NaN,
        mrr: NaN,
        cac: NaN,
        ctr: NaN,
        new_users: NaN,
        active_users: NaN,
        notes: '',
      })
    }
  }, [isMetricFormOpen, editingMetricId, form, selectedIdeaId])

  async function onSubmit(data: MetricFormData) {
    setLoading(true)
    const supabase = createClient()
    const payload = {
      idea_id: ideaId || null,
      date: data.date,
      d1_retention: data.d1_retention,
      d7_retention: data.d7_retention,
      d30_retention: data.d30_retention,
      churn_rate: data.churn_rate,
      mrr: data.mrr,
      cac: data.cac,
      ctr: data.ctr,
      new_users: data.new_users,
      active_users: data.active_users,
      notes: data.notes || null,
    }

    if (editingMetricId) {
      const { error } = await supabase.from('metrics').update(payload).eq('id', editingMetricId)
      if (error) { toast.error('Erro ao atualizar registro'); setLoading(false); return }
      toast.success('Registro atualizado')
    } else {
      const { error } = await supabase.from('metrics').insert(payload)
      if (error) { toast.error('Erro ao criar registro'); setLoading(false); return }
      toast.success('Dados registrados')
    }

    setLoading(false)
    closeMetricForm()
    onSuccess?.()
  }

  const fieldClass = "bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]"
  const labelClass = "text-[12px] text-[#A1A1AA]"
  const numReg = (name: keyof MetricFormData) => form.register(name, { valueAsNumber: true })

  return (
    <Sheet open={isMetricFormOpen} onOpenChange={(open) => !open && closeMetricForm()}>
      <SheetContent
        side="right"
        className="w-[480px] max-w-full bg-[#111113] border-l border-[#27272A] flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#27272A] shrink-0">
          <SheetTitle className="text-[15px] font-semibold text-[#FAFAFA]">
            {editingMetricId ? 'Editar Registro' : 'Registrar Dados'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label className={labelClass}>Produto / Ideia</Label>
              <Select value={ideaId} onValueChange={(v) => setIdeaId(v ?? '')}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Nenhum (geral)" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                  <SelectItem value="">Nenhum (geral)</SelectItem>
                  {ideas.map(idea => (
                    <SelectItem key={idea.id} value={idea.id}>{idea.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Data *</Label>
              <Input type="date" {...form.register('date')} className={fieldClass} />
              {form.formState.errors.date && (
                <p className="text-[11px] text-[#EF4444]">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="border-t border-[#27272A] pt-4">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider mb-3">Retenção (%)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className={labelClass}>D1</Label>
                  <Input type="number" step="0.1" min="0" max="100" placeholder="—" {...numReg('d1_retention')} className={fieldClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>D7</Label>
                  <Input type="number" step="0.1" min="0" max="100" placeholder="—" {...numReg('d7_retention')} className={fieldClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>D30</Label>
                  <Input type="number" step="0.1" min="0" max="100" placeholder="—" {...numReg('d30_retention')} className={fieldClass} />
                </div>
              </div>
            </div>

            <div className="border-t border-[#27272A] pt-4">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider mb-3">Financeiro</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className={labelClass}>MRR (R$)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="—" {...numReg('mrr')} className={fieldClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>CAC (R$)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="—" {...numReg('cac')} className={fieldClass} />
                </div>
              </div>
            </div>

            <div className="border-t border-[#27272A] pt-4">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider mb-3">Engajamento</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Churn (%)</Label>
                  <Input type="number" step="0.1" min="0" max="100" placeholder="—" {...numReg('churn_rate')} className={fieldClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>CTR (%)</Label>
                  <Input type="number" step="0.1" min="0" max="100" placeholder="—" {...numReg('ctr')} className={fieldClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Usuários novos</Label>
                  <Input type="number" min="0" placeholder="—" {...numReg('new_users')} className={fieldClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Usuários ativos</Label>
                  <Input type="number" min="0" placeholder="—" {...numReg('active_users')} className={fieldClass} />
                </div>
              </div>
            </div>

            <div className="border-t border-[#27272A] pt-4 space-y-1.5">
              <Label className={labelClass}>Notas do período</Label>
              <Textarea
                {...form.register('notes')}
                placeholder="O que aconteceu neste período?"
                rows={3}
                className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
              />
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-[#27272A] shrink-0 flex gap-2">
            <Button type="button" variant="ghost" onClick={closeMetricForm} className="text-[#A1A1AA] hover:text-[#FAFAFA] text-[13px]">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] flex-1">
              {loading ? 'Salvando...' : editingMetricId ? 'Salvar alterações' : 'Registrar dados'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
