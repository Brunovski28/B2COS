'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function DashboardRefresh() {
  const router = useRouter()
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(s => {
        if (s >= 299) {
          router.refresh()
          return 0
        }
        return s + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <span className="text-[11px] text-[#3F3F46]">
      {secondsAgo === 0 ? 'atualizado agora' : `atualizado há ${secondsAgo}s`}
    </span>
  )
}
