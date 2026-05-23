'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { calculateIdeaScore } from '@/lib/scoring'
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
import { Separator } from '@/components/ui/separator'
import { TagInput } from '@/components/shared/tag-input'

const ideaSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  target_segment: z.string().optional(),
  tags: z.array(z.string()),
  main_pain: z.string().optional(),
  pain_intensity: z.number().min(1).max(10),
  pain_frequency: z.enum(['daily', 'weekly', 'monthly', 'rarely']).optional(),
  recurrence: z.enum(['high', 'medium', 'low']).optional(),
  retention_potential: z.number().min(1).max(10),
  distribution_difficulty: z.number().min(1).max(10),
  complexity: z.number().min(1).max(10),
  risk: z.number().min(1).max(10),
  competition_level: z.enum(['none', 'low', 'medium', 'high', 'saturated']).optional(),
  market_size: z.string().optional(),
  monetization_notes: z.string().optional(),
  observations: z.string().optional(),
  insights: z.string().optional(),
})

type IdeaFormData = z.infer<typeof ideaSchema>

interface IdeaFormProps {
  onSuccess?: () => void
}

const defaults: IdeaFormData = {
  name: '',
  description: '',
  target_segment: '',
  tags: [],
  main_pain: '',
  pain_intensity: 5,
  pain_frequency: undefined,
  recurrence: undefined,
  retention_potential: 5,
  distribution_difficulty: 5,
  complexity: 5,
  risk: 5,
  competition_level: undefined,
  market_size: '',
  monetization_notes: '',
  observations: '',
  insights: '',
}

function SliderField({
  label,
  value,
  onChange,
  inverted = false,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  inverted?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-[12px] text-[#A1A1AA]">{label}</Label>
        <span className="text-[12px] font-mono text-[#6366F1]">{value}</span>
      </div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(vals) => onChange(Array.isArray(vals) ? vals[0] : Number(vals))}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-[#52525B]">
        <span>{inverted ? 'Alto impacto' : 'Baixo'}</span>
        <span>{inverted ? 'Difícil/alto' : 'Alto'}</span>
      </div>
    </div>
  )
}

export function IdeaForm({ onSuccess }: IdeaFormProps) {
  const { isIdeaFormOpen, editingIdeaId, closeIdeaForm } = useUIStore()
  const [loading, setLoading] = useState(false)
  const [existingIdea, setExistingIdea] = useState<Idea | null>(null)

  const form = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    if (isIdeaFormOpen && editingIdeaId) {
      const supabase = createClient()
      supabase
        .from('ideas')
        .select('*')
        .eq('id', editingIdeaId)
        .single()
        .then(({ data }) => {
          if (data) {
            setExistingIdea(data)
            form.reset({
              name: data.name,
              description: data.description ?? '',
              target_segment: data.target_segment ?? '',
              tags: data.tags ?? [],
              main_pain: data.main_pain ?? '',
              pain_intensity: data.pain_intensity ?? 5,
              pain_frequency: data.pain_frequency ?? undefined,
              recurrence: data.recurrence ?? undefined,
              retention_potential: data.retention_potential ?? 5,
              distribution_difficulty: data.distribution_difficulty ?? 5,
              complexity: data.complexity ?? 5,
              risk: data.risk ?? 5,
              competition_level: data.competition_level ?? undefined,
              market_size: data.market_size ?? '',
              monetization_notes: data.monetization_notes ?? '',
              observations: data.observations ?? '',
              insights: data.insights ?? '',
            })
          }
        })
    } else if (isIdeaFormOpen && !editingIdeaId) {
      setExistingIdea(null)
      form.reset(defaults)
    }
  }, [isIdeaFormOpen, editingIdeaId, form])

  async function onSubmit(data: IdeaFormData) {
    setLoading(true)
    const supabase = createClient()
    const score = calculateIdeaScore(data)

    const payload = { ...data, score }

    if (editingIdeaId) {
      const { error } = await supabase
        .from('ideas')
        .update(payload)
        .eq('id', editingIdeaId)

      if (error) {
        toast.error('Erro ao atualizar ideia')
        setLoading(false)
        return
      }
      toast.success('Ideia atualizada com sucesso')
    } else {
      const { error } = await supabase.from('ideas').insert(payload)
      if (error) {
        toast.error('Erro ao criar ideia')
        setLoading(false)
        return
      }
      toast.success('Ideia criada com sucesso')
    }

    setLoading(false)
    closeIdeaForm()
    onSuccess?.()
  }

  return (
    <Sheet open={isIdeaFormOpen} onOpenChange={(open) => !open && closeIdeaForm()}>
      <SheetContent
        side="right"
        className="w-[520px] max-w-full bg-[#111113] border-l border-[#27272A] flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#27272A] shrink-0">
          <SheetTitle className="text-[15px] font-semibold text-[#FAFAFA]">
            {editingIdeaId ? 'Editar Ideia' : 'Nova Ideia'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

            {/* Seção 1: Identidade */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">Identidade</p>

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Nome *</Label>
                <Input
                  {...form.register('name')}
                  placeholder="Nome da ideia"
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]"
                />
                {form.formState.errors.name && (
                  <p className="text-[11px] text-[#EF4444]">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Descrição</Label>
                <Textarea
                  {...form.register('description')}
                  placeholder="Descreva a ideia em 2–3 frases"
                  rows={3}
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Segmento-alvo</Label>
                <Input
                  {...form.register('target_segment')}
                  placeholder="Ex: Freelancers de design, 25–40 anos"
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Tags</Label>
                <Controller
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <TagInput tags={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            <Separator className="bg-[#27272A]" />

            {/* Seção 2: O Problema */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">O Problema</p>

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Dor principal</Label>
                <Textarea
                  {...form.register('main_pain')}
                  placeholder="Qual é a dor central que este produto resolve?"
                  rows={3}
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
                />
              </div>

              <Controller
                control={form.control}
                name="pain_intensity"
                render={({ field }) => (
                  <SliderField
                    label="Intensidade da dor (1–10)"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Frequência da dor</Label>
                <Controller
                  control={form.control}
                  name="pain_frequency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]">
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
                <Label className="text-[12px] text-[#A1A1AA]">Recorrência de pagamento</Label>
                <Controller
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                        <SelectItem value="high">Alta (mensal/anual)</SelectItem>
                        <SelectItem value="medium">Média (transacional)</SelectItem>
                        <SelectItem value="low">Baixa (one-time)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-[#27272A]" />

            {/* Seção 3: Avaliação */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">Avaliação</p>

              <Controller
                control={form.control}
                name="retention_potential"
                render={({ field }) => (
                  <SliderField
                    label="Retenção potencial (1–10)"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                control={form.control}
                name="distribution_difficulty"
                render={({ field }) => (
                  <SliderField
                    label="Dificuldade de distribuição (1=fácil)"
                    value={field.value}
                    onChange={field.onChange}
                    inverted
                  />
                )}
              />

              <Controller
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <SliderField
                    label="Complexidade técnica (1=simples)"
                    value={field.value}
                    onChange={field.onChange}
                    inverted
                  />
                )}
              />

              <Controller
                control={form.control}
                name="risk"
                render={({ field }) => (
                  <SliderField
                    label="Risco (1=baixo)"
                    value={field.value}
                    onChange={field.onChange}
                    inverted
                  />
                )}
              />

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Nível de concorrência</Label>
                <Controller
                  control={form.control}
                  name="competition_level"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1F] border-[#27272A]">
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="saturated">Saturada</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Tamanho de mercado</Label>
                <Input
                  {...form.register('market_size')}
                  placeholder="Ex: SaaS SMB Brasil, ~R$2B"
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] h-9 text-[13px]"
                />
              </div>
            </div>

            <Separator className="bg-[#27272A]" />

            {/* Seção 4: Notas */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">Notas</p>

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Monetização</Label>
                <Textarea
                  {...form.register('monetization_notes')}
                  placeholder="Como vai gerar receita?"
                  rows={2}
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Observações</Label>
                <Textarea
                  {...form.register('observations')}
                  placeholder="Observações gerais"
                  rows={2}
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] text-[#A1A1AA]">Insights</Label>
                <Textarea
                  {...form.register('insights')}
                  placeholder="Insights sobre o mercado ou problema"
                  rows={2}
                  className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] text-[13px] resize-none"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-[#27272A] shrink-0 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeIdeaForm}
              className="text-[#A1A1AA] hover:text-[#FAFAFA] text-[13px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] flex-1"
            >
              {loading ? 'Salvando...' : editingIdeaId ? 'Salvar alterações' : 'Criar ideia'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
