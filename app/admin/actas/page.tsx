import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminPageHeader from '../_components/AdminPageHeader'
import ActasManager from './ActasManager'

export const dynamic = 'force-dynamic'

export default async function ActasPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const tipoActa = await prisma.tipoReferencia.findUnique({ where: { nombre: 'Acta' } })

  if (!tipoActa) {
    // Create the tipo if it doesn't exist
    await prisma.tipoReferencia.create({
      data: {
        nombre: 'Acta',
        descripcion: 'Acta de sesión de la Asamblea Legislativa'
      }
    })
  }

  const actas = await prisma.referencia.findMany({
    where: { tipoReferenciaId: tipoActa?.id },
    include: {
      tipoReferencia: true,
      anotaciones: {
        include: {
          anotacion: {
            include: { articulo: { select: { numero: true, nombre: true } } }
          }
        }
      }
    },
    orderBy: { numero: 'desc' }
  })

  const articulos = await prisma.articulo.findMany({
    where: { esVigente: true },
    orderBy: { orden: 'asc' },
    select: { id: true, numero: true, nombre: true }
  })

  return (
    <>
      <AdminPageHeader
        title="Gestión de Actas"
        subtitle="Actas de la Asamblea Legislativa relacionadas con el Reglamento"
      />
      <div className="admin-page-content">
        <ActasManager
          actas={JSON.parse(JSON.stringify(actas))}
          articulos={articulos}
          tipoActaId={tipoActa?.id || 0}
        />
      </div>
    </>
  )
}
