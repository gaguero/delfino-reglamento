'use client'

import { geistSans } from '@/lib/fonts' // Correctly import lowercase 'geistSans'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader'

export default function AdminPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="admin-page-header">
      <h1 className={cn('admin-page-title', geistSans.variable)}>{title}</h1> {/* Use correct variable name */}
      <p className="admin-page-subtitle">{subtitle}</p>
    </header>
  )
}
