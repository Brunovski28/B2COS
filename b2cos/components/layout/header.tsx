interface HeaderProps {
  title: string
  breadcrumb?: string
  actions?: React.ReactNode
}

export function Header({ title, breadcrumb, actions }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#27272A] bg-[#0A0A0B] shrink-0">
      <div>
        {breadcrumb && (
          <p className="text-[11px] text-[#52525B] mb-0.5">{breadcrumb}</p>
        )}
        <h1 className="text-[15px] font-semibold text-[#FAFAFA]">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
