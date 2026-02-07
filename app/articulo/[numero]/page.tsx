import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
  const { numero } = await params
  const articulo = await prisma.articulo.findUnique({
    where: { numero },
    include: {
      anotaciones: {
        where: { esVisible: true },
        orderBy: { orden: 'asc' },
        include: {
          tipoAnotacion: true,
          createdBy: true,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Volver al índice
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Artículo {articulo.numero}
          </h1>
          <h2 className="mt-1 text-xl text-gray-600">{articulo.nombre}</h2>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Texto Legal</h3>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {articulo.textoLegal}
            </div>
          </div>

          {articulo.anotaciones.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Anotaciones</h3>
              <div className="space-y-6">
                {articulo.anotaciones.map((anotacion) => (
                  <div
                    key={anotacion.id}
                    className="bg-white shadow sm:rounded-lg p-6 border-l-4"
                    style={{
                      borderLeftColor: anotacion.tipoAnotacion.colorHex || '#3B82F6',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {anotacion.tipoAnotacion.nombre}
                        </h4>
                        <div
                          className="mt-2 prose max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: anotacion.contenido }}
                        />

                        {anotacion.referencias.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Referencias:
                            </h5>
                            <ul className="space-y-2">
                              {anotacion.referencias.map(({ referencia }) => (
                                <li key={referencia.id} className="text-sm">
                                  <span className="font-medium text-gray-900">
                                    {referencia.tipoReferencia.nombre} {referencia.numero}
                                  </span>
                                  {referencia.titulo && (
                                    <span className="text-gray-600"> - {referencia.titulo}</span>
                                  )}
                                  <div className="mt-1 space-x-3">
                                    {referencia.urlNexus && (
                                      <a
                                        href={referencia.urlNexus}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        Nexus PJ
                                      </a>
                                    )}
                                    {referencia.urlCatalogo && (
                                      <a
                                        href={referencia.urlCatalogo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        Catálogo
                                      </a>
                                    )}
                                    {referencia.urlRepositorio && (
                                      <a
                                        href={referencia.urlRepositorio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        Repositorio AL
                                      </a>
                                    )}
                                    {referencia.urlPrincipal &&
                                      !referencia.urlNexus &&
                                      !referencia.urlCatalogo &&
                                      !referencia.urlRepositorio && (
                                        <a
                                          href={referencia.urlPrincipal}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          Ver documento
                                        </a>
                                      )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="mt-3 text-xs text-gray-500">
                          Añadido por {anotacion.createdBy.fullName} el{' '}
                          {new Date(anotacion.createdAt).toLocaleDateString('es-CR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
