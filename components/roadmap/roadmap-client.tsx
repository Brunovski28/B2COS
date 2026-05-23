'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Flag, CheckCircle2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUIStore } from '@/store/ui.store'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RoadmapColumn } from './roadmap-column'
import { RoadmapForm } from './roadmap-form'
import type { RoadmapItem, Idea, PlanType, RoadmapTimeframe } from '@/types'
import {
  ROADMAP_STATUS_LABELS,
  ROADMAP_STATUS_COLORS,
  ROADMAP_PRIORITY_COLORS,
} from '@/types'

const TIMEFRAMES: RoadmapTimeframe[] = ['short', 'medium', 'long']

interface RoadmapClientProps {
  initialItems: RoadmapItem[]
  ideas: Idea[]
}

function ProgressBar({ items }: { items: RoadmapItem[] }) {
  if (items.length === 0) return null
  const done = items.filter(i => i.status === 'done').length
  const pct = Math.round((done / items.length) * 100)
  const nextMilestone = [...items]
    .filter(i => i.is_milestone && i.status !== 'done' && i.due_date)
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))[0]

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between text-[11px] text-[#52525B] mb-1">
          <span>{done} de {items.length} concluídos</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {nextMilestone && nextMilestone.due_date && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#6366F1] shrink-0">
          <Flag className="w-3 h-3 fill-current" />
          <span>Próximo marco: {format(parseISO(nextMilestone.due_date), 'dd/MM/yy', { locale: ptBR })}</span>
        </div>
      )}
    </div>
  )
}

function PlanView({
  items,
  ideas,
  planType,
  onEdit,
  onDelete,
  onAdd,
}: {
  items: RoadmapItem[]
  ideas: Idea[]
  planType: PlanType
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (timeframe: RoadmapTimeframe) => void
}) {
  const planItems = items.filter(i => i.plan_type === planType)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localItems, setLocalItems] = useState<RoadmapItem[]>(items)

  const filteredPlanItems = localItems.filter(i => i.plan_type === planType)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeItem = localItems.find(i => i.id === String(active.id))
    const overItem = localItems.find(i => i.id === String(over.id))
    if (!activeItem || !overItem) return

    const tf = activeItem.timeframe
    const tfItems = filteredPlanItems.filter(i => i.timeframe === tf)
    const oldIdx = tfItems.findIndex(i => i.id === String(active.id))
    const newIdx = tfItems.findIndex(i => i.id === String(over.id))
    if (oldIdx === -1 || newIdx === -1) return

    const reordered = arrayMove(tfItems, oldIdx, newIdx)
    const updated = reordered.map((item, idx) => ({ ...item, order_index: idx }))

    setLocalItems(prev =>
      prev.map(i => {
        const u = updated.find(u => u.id === i.id)
        return u ?? i
      })
    )

    const supabase = createClient()
    await Promise.all(
      updated.map(u => supabase.from('roadmap_items').update({ order_index: u.order_index }).eq('id', u.id))
    )
  }, [localItems, filteredPlanItems])

  const activeItem = activeId ? localItems.find(i => i.id === activeId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-3">
        <ProgressBar items={filteredPlanItems} />
        <div className="flex gap-4">
          {TIMEFRAMES.map(tf => (
            <RoadmapColumn
              key={`${planType}-${tf}`}
              timeframe={tf}
              items={filteredPlanItems.filter(i => i.timeframe === tf).sort((a, b) => a.order_index - b.order_index)}
              ideas={ideas}
              droppableId={`${planType}-${tf}`}
              onAdd={() => onAdd(tf)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeItem && (
          <div className="rounded-xl border border-[#6366F1] bg-[#111113] p-3 opacity-90 shadow-2xl">
            <p className="text-[13px] font-semibold text-[#FAFAFA]">{activeItem.title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: ROADMAP_PRIORITY_COLORS[activeItem.priority] }}
              />
              <span
                className="text-[11px]"
                style={{ color: ROADMAP_STATUS_COLORS[activeItem.status] }}
              >
                {ROADMAP_STATUS_LABELS[activeItem.status]}
              </span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export function RoadmapClient({ initialItems, ideas }: RoadmapClientProps) {
  const [items, setItems] = useState<RoadmapItem[]>(initialItems)
  const [activePlan, setActivePlan] = useState<PlanType>('A')
  const { openRoadmapForm } = useUIStore()

  const refreshItems = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('roadmap_items').select('*').order('order_index')
    if (data) setItems(data as RoadmapItem[])
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir este item do roadmap?')) return
    const supabase = createClient()
    const { error } = await supabase.from('roadmap_items').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir item')
    } else {
      toast.success('Item excluído')
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  function handleEdit(id: string) {
    openRoadmapForm(id)
  }

  function handleAdd(timeframe?: RoadmapTimeframe) {
    openRoadmapForm()
  }

  const planAItems = items.filter(i => i.plan_type === 'A')
  const planBItems = items.filter(i => i.plan_type === 'B')

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activePlan === 'A' ? 'A' : activePlan === 'B' ? 'B' : 'compare'} onValueChange={(v) => {
        if (v === 'A' || v === 'B') setActivePlan(v as PlanType)
      }}>
        {/* Tabs header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#27272A] shrink-0">
          <TabsList className="bg-[#18181B] border border-[#27272A] p-0.5 h-9 gap-0">
            <TabsTrigger value="A" className="text-[13px] h-8 px-4 data-[state=active]:bg-[#27272A] data-[state=active]:text-[#FAFAFA] text-[#52525B]">
              Plano A
            </TabsTrigger>
            <TabsTrigger value="B" className="text-[13px] h-8 px-4 data-[state=active]:bg-[#27272A] data-[state=active]:text-[#FAFAFA] text-[#52525B]">
              Plano B
            </TabsTrigger>
            <TabsTrigger value="compare" className="text-[13px] h-8 px-4 data-[state=active]:bg-[#27272A] data-[state=active]:text-[#FAFAFA] text-[#52525B]">
              Comparar
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 text-[11px] text-[#52525B]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
              A: {planAItems.filter(i => i.status === 'done').length}/{planAItems.length}
            </span>
            <span className="text-[#3F3F46]">·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#3B82F6]" />
              B: {planBItems.filter(i => i.status === 'done').length}/{planBItems.length}
            </span>
          </div>

          <div className="flex-1" />
          <Button
            onClick={() => openRoadmapForm()}
            size="sm"
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] gap-1.5"
          >
            + Novo Item
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <TabsContent value="A" className="mt-0">
            {planAItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p className="text-3xl">🗺️</p>
                <p className="text-[15px] font-semibold text-[#FAFAFA]">Plano A vazio</p>
                <p className="text-[13px] text-[#52525B]">Foco total B2C acelerado — sem âncoras</p>
                <Button onClick={() => openRoadmapForm()} size="sm" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] mt-2">
                  Adicionar primeiro item
                </Button>
              </div>
            ) : (
              <PlanView items={items} ideas={ideas} planType="A" onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
            )}
          </TabsContent>

          <TabsContent value="B" className="mt-0">
            {planBItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p className="text-3xl">🛡️</p>
                <p className="text-[15px] font-semibold text-[#FAFAFA]">Plano B vazio</p>
                <p className="text-[13px] text-[#52525B]">Empresa atual + B2C conservador — segurança primeiro</p>
                <Button onClick={() => openRoadmapForm()} size="sm" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] mt-2">
                  Adicionar primeiro item
                </Button>
              </div>
            ) : (
              <PlanView items={items} ideas={ideas} planType="B" onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
            )}
          </TabsContent>

          <TabsContent value="compare" className="mt-0">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-1 rounded-full bg-[#6366F1]" />
                  <p className="text-[14px] font-semibold text-[#FAFAFA]">Plano A</p>
                  <span className="text-[11px] text-[#52525B]">B2C acelerado</span>
                </div>
                <div className="space-y-3">
                  {TIMEFRAMES.map(tf => {
                    const tfItems = planAItems.filter(i => i.timeframe === tf).sort((a, b) => a.order_index - b.order_index)
                    if (tfItems.length === 0) return null
                    return (
                      <div key={tf} className="rounded-xl border border-[#27272A] bg-[#0D0D0E] p-3">
                        <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider mb-2">
                          {tf === 'short' ? 'Curto' : tf === 'medium' ? 'Médio' : 'Longo'} prazo
                        </p>
                        <div className="space-y-1.5">
                          {tfItems.map(item => (
                            <div key={item.id} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ROADMAP_PRIORITY_COLORS[item.priority] }} />
                              <p className="text-[12px] text-[#A1A1AA] truncate flex-1">{item.title}</p>
                              <span className="text-[10px] shrink-0" style={{ color: ROADMAP_STATUS_COLORS[item.status] }}>
                                {ROADMAP_STATUS_LABELS[item.status]}
                              </span>
                              {item.is_milestone && <Flag className="w-2.5 h-2.5 text-[#6366F1] fill-current shrink-0" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {planAItems.length === 0 && <p className="text-[12px] text-[#52525B]">Sem itens no Plano A</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-1 rounded-full bg-[#3B82F6]" />
                  <p className="text-[14px] font-semibold text-[#FAFAFA]">Plano B</p>
                  <span className="text-[11px] text-[#52525B]">B2C conservador</span>
                </div>
                <div className="space-y-3">
                  {TIMEFRAMES.map(tf => {
                    const tfItems = planBItems.filter(i => i.timeframe === tf).sort((a, b) => a.order_index - b.order_index)
                    if (tfItems.length === 0) return null
                    return (
                      <div key={tf} className="rounded-xl border border-[#27272A] bg-[#0D0D0E] p-3">
                        <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-wider mb-2">
                          {tf === 'short' ? 'Curto' : tf === 'medium' ? 'Médio' : 'Longo'} prazo
                        </p>
                        <div className="space-y-1.5">
                          {tfItems.map(item => (
                            <div key={item.id} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ROADMAP_PRIORITY_COLORS[item.priority] }} />
                              <p className="text-[12px] text-[#A1A1AA] truncate flex-1">{item.title}</p>
                              <span className="text-[10px] shrink-0" style={{ color: ROADMAP_STATUS_COLORS[item.status] }}>
                                {ROADMAP_STATUS_LABELS[item.status]}
                              </span>
                              {item.is_milestone && <Flag className="w-2.5 h-2.5 text-[#6366F1] fill-current shrink-0" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {planBItems.length === 0 && <p className="text-[12px] text-[#52525B]">Sem itens no Plano B</p>}
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <RoadmapForm ideas={ideas} defaultPlanType={activePlan} onSuccess={refreshItems} />
    </div>
  )
}
