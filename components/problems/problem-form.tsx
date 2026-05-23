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
import { Slider } from '@/components/ui/slider'
import { TagInput } from '@/components/shared/tag-input'

const problemSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  real_quote: z.string().optional(),
  behavior_pattern: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'rarely']).optional(),
  emotional_intensity: z.number().min(1).max(10),
  source: z.enum(['observation', 'interview', 'personal', 'research', 'social']).optional(),
  related_idea_ids: z.array(z.string()),
  tags: z.array(z.string()),
})

type ProblemFormData = z.infer<typeof problemSchema>

const defaults: ProblemFormData = {
  title: '',
  description: '',
  real_quote: '',
  behavior_pattern: '',
  frequency: undefined,
  emotional_intensity: 5,
  source: undefined,
  related_idea_ids: [],
  tags: [],
}

interface ProblemFormProps {
  ideas: Idea[]
  onSuccess?: () => void
}

export function ProblemForm({ ideas, onSuccess }: ProblemFormProps) {
  const { isProblemFormOpen, editingProblemId, closeProblemForm } = useUIStore()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    if (isProblemFormOpen && editingProblemId) {
      const supabase = createClient()
      supabase.from('problems').select('*').eq('id', editingProblemId).single().then(({ data }) => {
        if (data) form.reset({
          title: data.title,
          description: data.description ?? '',
          real_quote: data.real_quote ?? '',
          behavior_pattern: data.behavior_pattern ?? '',
          frequency: data.frequency ?? undefined,
          emotional_intensity: data.emotional_intensity ?? 5,
          source: data.source ?? undefined,
          related_idea_ids: data.related_idea_ids ?? [],
          tags: data.tags ?? [],
        })
      })
    } else if (isProblemFormOpen && !editingProblemId) {
      form.reset(defaults)
    }
  }, [isProblemFormOpen, editingProblemId, form])

  async function onSubmit(data: ProblemFormData) {
    setLoading(true)
    const supabase = createClient()
    const payload = {
      title: data.title,
      description: data.description || null,
      real_quote: data.real_quote || null,
      behavior_pattern: data.behavior_pattern || null,
      frequency: data.frequency ?? null,
      emotional_intensity: data.emotional_intensity,
      source: data.source ?? null,
      related_idea_ids: data.related_idea_ids,
      tags: data.tags,
    }

    if (editingProblemId) {
      const { error } = await supabase.from('problems').update(payload).eq('id', editingProblemId)
      if (error) { toast.error('Erro ao atualizar problema'); setLoading(false); return }
      toast.success('Problema atualizado')
    } else {
      const { error } = await supabase.from('problems').insert(payload)
      if (error) { toast.error('Erro ao registrar problema'); setLoading(false); return }
      toast.success('Problema registrado')
    }

    setLoading(false)
    closeProblemForm()
    onSuccess?.()
  }

  const fieldClass = "bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]"
  const labelClass = "text-[12px] text-[#A1A1AA]"

  const intensity = form.watch('emotional_intensity')

  return (
    <Sheet open={isProblemFormOpen} onOpenChange={(open) => !open && closeProblemForm()}>
      <SheetContent
        side="right"
        className="w-[480px] max-w-full bg-[#111113] border-l border-[#27272A] flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#27272A] shrink-0">
          <SheetTitle className="text-[15px] font-semibold text-[#FAFAFA]">
            {editingProblemId ? 'Editar Problema' : 'Registrar Problema'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

            <div className="space-y-1.5">
              <Label className={labelClass}>Título *</Label>
              <Input {...form.register('title')} placeholder="Qual é o problema?" className={fieldClass} />
              {form.formState.errors.title && (
                <p className="text-[11px] text-[#EF4444]">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Descrição</Label>
              <Textarea
                {...form.register('description')}
                placeholder="Descreva o problema com mais detalhes"
                rows={3}
                className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Frase real (quote de uma pessoa)</Label>
              <Textarea
                {...form.register('real_quote')}
                placeholder='"Eu odeio quando preciso..."'
                rows={2}
                className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none italic"
              />
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Padrão de comportamento atual</Label>
              <Textarea
                {...form.register('behavior_pattern')}
                placeholder="O que a pessoa faz hoje para lidar com isso?"
                rows={2}
                className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Frequência</Label>
                <Controller
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                        <SelectItem value="daily">Diária</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="rarely">Raramente</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Fonte</Label>
                <Controller
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                        <SelectItem value="observation">Observação</SelectItem>
                        <SelectItem value="interview">Entrevista</SelectItem>
                        <SelectItem value="personal">Pessoal</SelectItem>
                        <SelectItem value="research">Pesquisa</SelectItem>
                        <SelectItem value="social">Rede Social</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className={labelClass}>Intensidade emocional</Label>
                <span className="text-[12px] font-mono text-[#6366F1]">{intensity}/10</span>
              </div>
              <Controller
                control={form.control}
                name="emotional_intensity"
                render={({ field }) => (
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(vals) => field.onChange(Array.isArray(vals) ? vals[0] : Number(vals))}
                    className="w-full"
                  />
                )}
              />
              <div className="flex justify-between text-[10px] text-[#52525B]">
                <span>Leve</span>
                <span>Insuportável</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Ideias relacionadas</Label>
              <div className="flex flex-col gap-1.5">
                {ideas.map(idea => {
                  const selected = form.watch('related_idea_ids').includes(idea.id)
                  return (
                    <label key={idea.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          const current = form.getValues('related_idea_ids')
                          if (e.target.checked) {
                            form.setValue('related_idea_ids', [...current, idea.id])
                          } else {
                            form.setValue('related_idea_ids', current.filter(id => id !== idea.id))
                          }
                        }}
                        className="rounded border-[#3F3F46] bg-[#18181B] accent-[#6366F1]"
                      />
                      <span className="text-[13px] text-[#A1A1AA] group-hover:text-[#FAFAFA] transition-colors">{idea.name}</span>
                    </label>
                  )
                })}
                {ideas.length === 0 && (
                  <p className="text-[12px] text-[#52525B]">Sem ideias ativas para vincular</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Tags</Label>
              <Controller
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <TagInput tags={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-[#27272A] shrink-0 flex gap-2">
            <Button type="button" variant="ghost" onClick={closeProblemForm} className="text-[#A1A1AA] hover:text-[#FAFAFA] text-[13px]">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] flex-1">
              {loading ? 'Salvando...' : editingProblemId ? 'Salvar alterações' : 'Registrar problema'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
