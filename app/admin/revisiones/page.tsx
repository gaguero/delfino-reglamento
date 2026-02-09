import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminPageHeader from '../_components/AdminPageHeader'
import ReviewQueue from './ReviewQueue'

export const dynamic = 'force-dynamic'

export default async function RevisionesPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  // Pending AI annotations (not yet approved)
  const pendientes = await prisma.anotacion.findMany({
    where: { fuenteIA: true, esAprobada: false, esVisible: true },
    include: {
      articulo: { select: { numero: true, nombre: true } },
      tipoAnotacion: true,
      createdBy: { select: { fullName: true } },
      referencias: {
        include: { referencia: { include: { tipoReferencia: true } } }
      }
    },
    orderBy: [{ articulo: { orden: 'asc' } }, { orden: 'asc' }]
  })

  // Recently approved AI annotations (last 50)
  const aprobadas = await prisma.anotacion.findMany({
    where: { fuenteIA: true, esAprobada: true },
    include: {
      articulo: { select: { numero: true, nombre: true } },
      tipoAnotacion: true,
      aprobadoPor: { select: { fullName: true } },
    },
    orderBy: { fechaAprobacion: 'desc' },
    take: 50
  })

  // Stats
  const totalIA = await prisma.anotacion.count({ where: { fuenteIA: true } })
  const pendienteCount = await prisma.anotacion.count({ where: { fuenteIA: true, esAprobada: false, esVisible: true } })
  const aprobadaCount = await prisma.anotacion.count({ where: { fuenteIA: true, esAprobada: true } })

  return (
    <>
      <AdminPageHeader
        title="Revisión de Anotaciones IA"
        subtitle={`${pendienteCount} pendientes de revisión | ${aprobadaCount} aprobadas | ${totalIA} total IA`}
      />
      <div className="admin-page-content">
        <ReviewQueue
          pendientes={JSON.parse(JSON.stringify(pendientes))}
          aprobadas={JSON.parse(JSON.stringify(aprobadas))}
        />
      </div>
    </>
  )
}
