'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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

const roadmapSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  plan_type: z.enum(['A', 'B']),
  timeframe: z.enum(['short', 'medium', 'long']),
  status: z.enum(['todo', 'in_progress', 'done', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  is_milestone: z.boolean(),
  idea_id: z.string().optional(),
  due_date: z.string().optional(),
})

type RoadmapFormData = z.infer<typeof roadmapSchema>

interface RoadmapFormProps {
  ideas: Idea[]
  defaultPlanType?: 'A' | 'B'
  onSuccess?: () => void
}

const defaults: RoadmapFormData = {
  title: '',
  description: '',
  plan_type: 'A',
  timeframe: 'short',
  status: 'todo',
  priority: 'medium',
  is_milestone: false,
  idea_id: undefined,
  due_date: '',
}

export function RoadmapForm({ ideas, defaultPlanType = 'A', onSuccess }: RoadmapFormProps) {
  const { isRoadmapFormOpen, editingRoadmapId, closeRoadmapForm } = useUIStore()
  const [loading, setLoading] = useState(false)

  const form = useForm<RoadmapFormData>({
    resolver: zodResolver(roadmapSchema),
    defaultValues: { ...defaults, plan_type: defaultPlanType },
  })

  useEffect(() => {
    if (isRoadmapFormOpen && editingRoadmapId) {
      const supabase = createClient()
      supabase.from('roadmap_items').select('*').eq('id', editingRoadmapId).single().then(({ data }) => {
        if (data) form.reset({
          title: data.title,
          description: data.description ?? '',
          plan_type: data.plan_type as 'A' | 'B',
          timeframe: data.timeframe as 'short' | 'medium' | 'long',
          status: data.status as 'todo' | 'in_progress' | 'done' | 'blocked',
          priority: data.priority as 'low' | 'medium' | 'high' | 'critical',
          is_milestone: data.is_milestone,
          idea_id: data.idea_id ?? undefined,
          due_date: data.due_date ?? '',
        })
      })
    } else if (isRoadmapFormOpen && !editingRoadmapId) {
      form.reset({ ...defaults, plan_type: defaultPlanType })
    }
  }, [isRoadmapFormOpen, editingRoadmapId, form, defaultPlanType])

  async function onSubmit(data: RoadmapFormData) {
    setLoading(true)
    const supabase = createClient()
    const payload = {
      title: data.title,
      description: data.description || null,
      plan_type: data.plan_type,
      timeframe: data.timeframe,
      status: data.status,
      priority: data.priority,
      is_milestone: data.is_milestone,
      idea_id: data.idea_id || null,
      due_date: data.due_date || null,
    }

    if (editingRoadmapId) {
      const { error } = await supabase.from('roadmap_items').update(payload).eq('id', editingRoadmapId)
      if (error) { toast.error('Erro ao atualizar item'); setLoading(false); return }
      toast.success('Item atualizado')
    } else {
      const { data: existing } = await supabase
        .from('roadmap_items')
        .select('order_index')
        .eq('plan_type', data.plan_type)
        .eq('timeframe', data.timeframe)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

      const order_index = existing ? (existing.order_index as number) + 1 : 0
      const { error } = await supabase.from('roadmap_items').insert({ ...payload, order_index })
      if (error) { toast.error('Erro ao criar item'); setLoading(false); return }
      toast.success('Item adicionado ao roadmap')
    }

    setLoading(false)
    closeRoadmapForm()
    onSuccess?.()
  }

  const fieldClass = "bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]"
  const labelClass = "text-[12px] text-[#A1A1AA]"

  return (
    <Sheet open={isRoadmapFormOpen} onOpenChange={(open) => !open && closeRoadmapForm()}>
      <SheetContent
        side="right"
        className="w-[480px] max-w-full bg-[#111113] border-l border-[#27272A] flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#27272A] shrink-0">
          <SheetTitle className="text-[15px] font-semibold text-[#FAFAFA]">
            {editingRoadmapId ? 'Editar Item' : 'Novo Item do Roadmap'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

            <div className="space-y-1.5">
              <Label className={labelClass}>Título *</Label>
              <Input {...form.register('title')} placeholder="O que precisa acontecer?" className={fieldClass} />
              {form.formState.errors.title && (
                <p className="text-[11px] text-[#EF4444]">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Descrição</Label>
              <Textarea
                {...form.register('description')}
                placeholder="Detalhes opcionais..."
                rows={2}
                className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Plano</Label>
                <Controller
                  control={form.control}
                  name="plan_type"
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {(['A', 'B'] as const).map(plan => (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => field.onChange(plan)}
                          className={`flex-1 h-9 rounded-lg border text-[13px] font-semibold transition-colors ${
                            field.value === plan
                              ? 'bg-[#6366F1] border-[#6366F1] text-white'
                              : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                          }`}
                        >
                          Plano {plan}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Prazo</Label>
                <Controller
                  control={form.control}
                  name="timeframe"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                        <SelectItem value="short">Curto Prazo</SelectItem>
                        <SelectItem value="medium">Médio Prazo</SelectItem>
                        <SelectItem value="long">Longo Prazo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                        <SelectItem value="todo">A fazer</SelectItem>
                        <SelectItem value="in_progress">Em andamento</SelectItem>
                        <SelectItem value="done">Concluído</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Prioridade</Label>
                <Controller
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                        <SelectItem value="critical">Crítica</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Ideia vinculada</Label>
              <Controller
                control={form.control}
                name="idea_id"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || undefined)}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Nenhuma" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                      <SelectItem value="">Nenhuma</SelectItem>
                      {ideas.map(idea => (
                        <SelectItem key={idea.id} value={idea.id}>{idea.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Data prevista</Label>
              <Input type="date" {...form.register('due_date')} className={fieldClass} />
            </div>

            <div className="flex items-center gap-3">
              <Controller
                control={form.control}
                name="is_milestone"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded border-[#3F3F46] bg-[#18181B] accent-[#6366F1]"
                    id="is-milestone"
                  />
                )}
              />
              <Label htmlFor="is-milestone" className="text-[13px] text-[#A1A1AA] cursor-pointer">
                É um milestone (marco importante)
              </Label>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-[#27272A] shrink-0 flex gap-2">
            <Button type="button" variant="ghost" onClick={closeRoadmapForm} className="text-[#A1A1AA] hover:text-[#FAFAFA] text-[13px]">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] flex-1">
              {loading ? 'Salvando...' : editingRoadmapId ? 'Salvar alterações' : 'Adicionar item'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
