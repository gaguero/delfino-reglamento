import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminPageHeader from '../_components/AdminPageHeader'
import VotosManager from './VotosManager'

export const dynamic = 'force-dynamic'

export default async function VotosPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const tipoVoto = await prisma.tipoReferencia.findUnique({ where: { nombre: 'Voto' } })

  if (!tipoVoto) {
    // Create the tipo if it doesn't exist
    await prisma.tipoReferencia.create({
      data: {
        nombre: 'Voto',
        descripcion: 'Resolución de la Sala Constitucional'
      }
    })
  }

  const votos = await prisma.referencia.findMany({
    where: { tipoReferenciaId: tipoVoto?.id },
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
        title="Gestión de Votos"
        subtitle="Votos de la Sala Constitucional relacionados con el Reglamento"
      />
      <div className="admin-page-content">
        <VotosManager
          votos={JSON.parse(JSON.stringify(votos))}
          articulos={articulos}
          tipoVotoId={tipoVoto?.id || 0}
        />
      </div>
    </>
  )
}
