import AdminHeader from '@/app/admin/_components/AdminHeader'
import { GeistSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminDashboard from './page'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const stats = await Promise.all([
    prisma.articulo.count(),
    prisma.anotacion.count(),
    prisma.referencia.count(),
    prisma.user.count(),
  ])

  const recentAnnotations = await prisma.anotacion.findMany({
    take: 10,
    orderBy: { updatedAt: 'desc' },
    include: {
      articulo: true,
      createdBy: true,
      tipoAnotacion: true,
    },
  })

  return (
    <div className={cn('admin-layout', GeistSans.variable)}>
      <AdminHeader />
      <AdminDashboard
        stats={stats}
        recentAnnotations={recentAnnotations}
        session={session}
      />
      <main>{children}</main>
    </div>
  )
}
