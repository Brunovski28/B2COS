'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
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

const resourceSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  type: z.enum(['book', 'article', 'framework', 'note', 'study', 'insight']),
  author: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  progress: z.number().min(0).max(100),
  key_insights: z.array(z.object({ value: z.string() })),
  actionable_notes: z.string().optional(),
  applied_to_idea_ids: z.array(z.string()),
  tags: z.array(z.string()),
})

type ResourceFormData = z.infer<typeof resourceSchema>

const defaults: ResourceFormData = {
  title: '',
  type: 'book',
  author: '',
  url: '',
  description: '',
  progress: 0,
  key_insights: [],
  actionable_notes: '',
  applied_to_idea_ids: [],
  tags: [],
}

interface ResourceFormProps {
  ideas: Idea[]
  onSuccess?: () => void
}

export function ResourceForm({ ideas, onSuccess }: ResourceFormProps) {
  const { isLearningFormOpen, editingLearningId, closeLearningForm } = useUIStore()
  const [loading, setLoading] = useState(false)

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: defaults,
  })

  const { fields: insightFields, append: appendInsight, remove: removeInsight } = useFieldArray({
    control: form.control,
    name: 'key_insights',
  })

  const watchedType = form.watch('type')
  const watchedProgress = form.watch('progress')

  useEffect(() => {
    if (isLearningFormOpen && editingLearningId) {
      const supabase = createClient()
      supabase.from('learning_resources').select('*').eq('id', editingLearningId).single().then(({ data }) => {
        if (data) form.reset({
          title: data.title,
          type: data.type,
          author: data.author ?? '',
          url: data.url ?? '',
          description: data.description ?? '',
          progress: data.progress ?? 0,
          key_insights: (data.key_insights ?? []).map((v: string) => ({ value: v })),
          actionable_notes: data.actionable_notes ?? '',
          applied_to_idea_ids: data.applied_to_idea_ids ?? [],
          tags: data.tags ?? [],
        })
      })
    } else if (isLearningFormOpen && !editingLearningId) {
      form.reset(defaults)
    }
  }, [isLearningFormOpen, editingLearningId, form])

  async function onSubmit(data: ResourceFormData) {
    setLoading(true)
    const supabase = createClient()
    const payload = {
      title: data.title,
      type: data.type,
      author: data.author || null,
      url: data.url || null,
      description: data.description || null,
      progress: data.type === 'book' ? data.progress : 0,
      key_insights: data.key_insights.map((i) => i.value).filter(Boolean),
      actionable_notes: data.actionable_notes || null,
      applied_to_idea_ids: data.applied_to_idea_ids,
      tags: data.tags,
    }

    if (editingLearningId) {
      const { error } = await supabase.from('learning_resources').update(payload).eq('id', editingLearningId)
      if (error) { toast.error('Erro ao atualizar recurso'); setLoading(false); return }
      toast.success('Recurso atualizado')
    } else {
      const { error } = await supabase.from('learning_resources').insert(payload)
      if (error) { toast.error('Erro ao adicionar recurso'); setLoading(false); return }
      toast.success('Recurso adicionado')
    }

    setLoading(false)
    closeLearningForm()
    onSuccess?.()
  }

  const fieldClass = "bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]"
  const labelClass = "text-[12px] text-[#A1A1AA]"

  return (
    <Sheet open={isLearningFormOpen} onOpenChange={(open) => !open && closeLearningForm()}>
      <SheetContent
        side="right"
        className="w-[520px] max-w-full bg-[#111113] border-l border-[#27272A] flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#27272A] shrink-0">
          <SheetTitle className="text-[15px] font-semibold text-[#FAFAFA]">
            {editingLearningId ? 'Editar Recurso' : 'Adicionar Recurso'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

            {/* Seção 1 — Identidade */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-widest">Identidade</p>

              <div className="space-y-1.5">
                <Label className={labelClass}>Tipo *</Label>
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                        <SelectItem value="book">📚 Livro</SelectItem>
                        <SelectItem value="article">📄 Artigo</SelectItem>
                        <SelectItem value="framework">🏗️ Framework</SelectItem>
                        <SelectItem value="note">📝 Nota</SelectItem>
                        <SelectItem value="study">🧪 Estudo</SelectItem>
                        <SelectItem value="insight">💡 Insight</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={labelClass}>Título *</Label>
                <Input {...form.register('title')} placeholder="Nome do recurso" className={fieldClass} />
                {form.formState.errors.title && (
                  <p className="text-[11px] text-[#EF4444]">{form.formState.errors.title.message}</p>
                )}
              </div>

              {(watchedType === 'book' || watchedType === 'article') && (
                <div className="space-y-1.5">
                  <Label className={labelClass}>Autor</Label>
                  <Input {...form.register('author')} placeholder="Nome do autor" className={fieldClass} />
                </div>
              )}

              {(watchedType === 'article' || watchedType === 'framework') && (
                <div className="space-y-1.5">
                  <Label className={labelClass}>URL</Label>
                  <Input {...form.register('url')} placeholder="https://..." className={fieldClass} />
                </div>
              )}

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

            {/* Seção 2 — Conteúdo */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-widest">Conteúdo</p>

              <div className="space-y-1.5">
                <Label className={labelClass}>Descrição / Resumo</Label>
                <Textarea
                  {...form.register('description')}
                  placeholder="Sobre o que é este recurso?"
                  rows={3}
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
                />
              </div>

              {watchedType === 'book' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className={labelClass}>Progresso de leitura</Label>
                    <span className="text-[12px] font-mono text-[#8B5CF6]">{watchedProgress}%</span>
                  </div>
                  <Controller
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(Array.isArray(vals) ? vals[0] : Number(vals))}
                        className="w-full"
                      />
                    )}
                  />
                  <div className="flex justify-between text-[10px] text-[#52525B]">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className={labelClass}>Insights principais</Label>
                  <button
                    type="button"
                    onClick={() => appendInsight({ value: '' })}
                    className="flex items-center gap-1 text-[11px] text-[#6366F1] hover:text-[#818CF8] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {insightFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        {...form.register(`key_insights.${index}.value`)}
                        placeholder={`Insight ${index + 1}`}
                        className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-8 text-[13px] flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeInsight(index)}
                        className="p-1.5 rounded text-[#52525B] hover:text-[#EF4444] hover:bg-[#18181B] transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {insightFields.length === 0 && (
                    <p className="text-[12px] text-[#52525B]">Nenhum insight ainda. Clique em "Adicionar".</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={labelClass}>Notas acionáveis</Label>
                <Textarea
                  {...form.register('actionable_notes')}
                  placeholder="O que vou aplicar concretamente?"
                  rows={3}
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
                />
              </div>
            </div>

            {/* Seção 3 — Aplicação */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-widest">Aplicação</p>

              <div className="space-y-1.5">
                <Label className={labelClass}>Ideias relacionadas</Label>
                <div className="flex flex-col gap-1.5">
                  {ideas.map((idea) => {
                    const selected = form.watch('applied_to_idea_ids').includes(idea.id)
                    return (
                      <label key={idea.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const current = form.getValues('applied_to_idea_ids')
                            if (e.target.checked) {
                              form.setValue('applied_to_idea_ids', [...current, idea.id])
                            } else {
                              form.setValue('applied_to_idea_ids', current.filter((id) => id !== idea.id))
                            }
                          }}
                          className="rounded border-[#3F3F46] bg-[#18181B] accent-[#6366F1]"
                        />
                        <span className="text-[13px] text-[#A1A1AA] group-hover:text-[#FAFAFA] transition-colors">
                          {idea.name}
                        </span>
                      </label>
                    )
                  })}
                  {ideas.length === 0 && (
                    <p className="text-[12px] text-[#52525B]">Sem ideias ativas para vincular</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-[#27272A] shrink-0 flex gap-2">
            <Button type="button" variant="ghost" onClick={closeLearningForm} className="text-[#A1A1AA] hover:text-[#FAFAFA] text-[13px]">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] flex-1">
              {loading ? 'Salvando...' : editingLearningId ? 'Salvar alterações' : 'Adicionar recurso'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
