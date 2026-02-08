import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ArticuloEditor from './ArticuloEditor'

export const dynamic = 'force-dynamic'

export default async function EditArticuloPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
  const session = await auth()
  if (!session) {
    redirect('/admin/login')
  }

  const { numero } = await params
  const articulo = await prisma.articulo.findUnique({
    where: { numero },
    include: {
      anotaciones: {
        orderBy: { orden: 'asc' },
        include: {
          tipoAnotacion: true,
          createdBy: true,
          updatedBy: true,
          referencias: {
            include: {
              referencia: {
                include: { tipoReferencia: true },
              },
            },
            orderBy: { orden: 'asc' },
          },
        },
      },
    },
  })

  if (!articulo) {
    notFound()
  }

  const tiposAnotacion = await prisma.tipoAnotacion.findMany()
  const referencias = await prisma.referencia.findMany({
    include: { tipoReferencia: true },
    orderBy: [{ tipoReferenciaId: 'asc' }, { numero: 'asc' }],
  })
  const tiposReferencia = await prisma.tipoReferencia.findMany()

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
                ← Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-bold">Editar Artículo {articulo.numero}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/articulo/${articulo.numero}`}
                className="text-sm text-gray-600 hover:text-blue-600"
                target="_blank"
              >
                Ver en sitio público ↗
              </Link>
              <span className="text-sm text-gray-700">{session.user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl text-gray-600 mb-6">{articulo.nombre}</h2>

        {/* Legal Text (read-only) */}
        <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Texto Legal</h3>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm">
            {articulo.textoLegal}
          </div>
        </div>

        {/* Client-side editor */}
        <ArticuloEditor
          articulo={JSON.parse(JSON.stringify(articulo))}
          tiposAnotacion={tiposAnotacion}
          referencias={JSON.parse(JSON.stringify(referencias))}
          tiposReferencia={tiposReferencia}
        />
      </div>
    </div>
  )
}
