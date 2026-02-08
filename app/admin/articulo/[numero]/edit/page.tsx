import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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
                include: {
                  tipoReferencia: true,
                },
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
  const tiposReferencia = await prisma.tipoReferencia.findMany()

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Volver al Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">{session.user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Editar Artículo {articulo.numero}
            </h1>
            <h2 className="mt-1 text-xl text-gray-600">{articulo.nombre}</h2>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {/* Article Text */}
              <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Texto Legal</h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                  {articulo.textoLegal}
                </div>
              </div>

              {/* Existing Annotations */}
              <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Anotaciones ({articulo.anotaciones.length})
                  </h3>
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // TODO: Open modal to add annotation
                      alert('Funcionalidad de agregar anotación - Por implementar')
                    }}
                  >
                    + Nueva Anotación
                  </button>
                </div>

                {articulo.anotaciones.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay anotaciones para este artículo. Agregue la primera anotación.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {articulo.anotaciones.map((anotacion, index) => (
                      <div
                        key={anotacion.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: (anotacion.tipoAnotacion.colorHex || '#3B82F6') + '20',
                                  color: anotacion.tipoAnotacion.colorHex || '#3B82F6',
                                }}
                              >
                                {anotacion.tipoAnotacion.nombre}
                              </span>
                              <span className="text-xs text-gray-500">
                                Orden: {anotacion.orden}
                              </span>
                            </div>
                            <div
                              className="mt-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: anotacion.contenido }}
                            />
                            {anotacion.referencias.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  Referencias:
                                </p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {anotacion.referencias.map(({ referencia }) => (
                                    <li key={referencia.id}>
                                      {referencia.tipoReferencia.nombre} {referencia.numero}
                                      {referencia.titulo && ` - ${referencia.titulo}`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                              Creado por {anotacion.createdBy.fullName} el{' '}
                              {new Date(anotacion.createdAt).toLocaleDateString('es-CR')}
                              {anotacion.updatedBy && (
                                <>
                                  {' '}
                                  | Editado por {anotacion.updatedBy.fullName} el{' '}
                                  {new Date(anotacion.updatedAt).toLocaleDateString('es-CR')}
                                </>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() =>
                                alert('Funcionalidad de editar - Por implementar')
                              }
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                alert('Funcionalidad de eliminar - Por implementar')
                              }
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="flex gap-4">
                <Link
                  href={`/articulo/${articulo.numero}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  target="_blank"
                >
                  Ver en Sitio Público
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
