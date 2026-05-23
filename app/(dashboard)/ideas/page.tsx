import { createClient } from '@/lib/supabase/server'
import { IdeasClient } from './ideas-client'

export default async function IdeasPage() {
  const supabase = await createClient()

  const { data: ideas, error } = await supabase
    .from('ideas')
    .select('*')
    .order('score', { ascending: false })

  if (error) {
    return (
      <div className="p-6 text-[#EF4444] text-[13px]">
        Erro ao carregar ideias: {error.message}
      </div>
    )
  }

  return <IdeasClient initialIdeas={ideas ?? []} />
}
