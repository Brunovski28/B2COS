import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { IdeaDetailClient } from './idea-detail-client'

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [ideaRes, containersRes, eventsRes] = await Promise.all([
    supabase.from('ideas').select('*').eq('id', id).single(),
    supabase.from('container_analyses').select('*').eq('idea_id', id),
    supabase.from('pipeline_events').select('*').eq('idea_id', id).order('created_at', { ascending: false }),
  ])

  if (ideaRes.error || !ideaRes.data) {
    notFound()
  }

  return (
    <IdeaDetailClient
      idea={ideaRes.data}
      containers={containersRes.data ?? []}
      events={eventsRes.data ?? []}
    />
  )
}
