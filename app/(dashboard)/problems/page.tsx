import { Header } from '@/components/layout/header'

export default function ProblemsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Problemas" breadcrumb="B2C OS" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl mb-3">🚧</p>
          <h2 className="text-[15px] font-semibold text-[#FAFAFA] mb-1">Biblioteca de Problemas</h2>
          <p className="text-[13px] text-[#52525B]">Disponível na Fase 3</p>
        </div>
      </div>
    </div>
  )
}
