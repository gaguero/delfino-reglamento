import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function Home() {
  const articulos = await prisma.articulo.findMany({
    orderBy: { orden: 'asc' },
    take: 50,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reglamento de la Asamblea Legislativa
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            República de Costa Rica - Anotado por Delfino.cr
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {articulos.map((articulo) => (
                <li key={articulo.id}>
                  <Link
                    href={`/articulo/${articulo.numero}`}
                    className="block hover:bg-gray-50 transition"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          Artículo {articulo.numero}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-900 font-semibold">
                          {articulo.nombre}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
