import { geistSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminHeader from './_components/AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className={cn('admin-layout', geistSans.variable)}>
      <AdminHeader />
      <main className="admin-main">{children}</main>
    </div>
  )
}
