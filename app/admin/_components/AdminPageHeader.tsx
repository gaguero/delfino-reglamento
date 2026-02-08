'use client'

import { geistSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'

export default function AdminPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="admin-page-header">
      <h1 className={cn('admin-page-title', geistSans.variable)}>{title}</h1>
      {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
    </header>
  )
}
