import Link from 'next/link'
import { GeistSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/auth'

export default async function AdminPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const session = await auth()

  return (
    <header className="admin-page-header">
      <h1 className={cn('admin-page-title', GeistSans.className)}>{title}</h1>
      <p className="admin-page-subtitle">{subtitle}</p>
    </header>
  )
}
