import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; user?: string; entity?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 50
  const skip = (page - 1) * pageSize

  // Build filters
  const where: any = {}
  if (params.user) {
    where.userId = params.user
  }
  if (params.entity) {
    where.entityType = params.entity
  }

  const [auditLogs, totalCount, users] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
      },
      orderBy: { fullName: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin/users"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Usuarios
                  </Link>
                )}
                <Link
                  href="/admin/audit"
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Auditoría
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{session.user.email}</span>
              <form
                action={async () => {
                  'use server'
                  const { signOut } = await import('@/lib/auth')
                  await signOut()
                }}
              >
                <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Registro de Auditoría
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Historial completo de cambios realizados en el sistema
            </p>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {/* Filters */}
              <div className="bg-white shadow sm:rounded-lg p-4 mb-6">
                <form method="get" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                      Usuario
                    </label>
                    <select
                      id="user"
                      name="user"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      defaultValue={params.user || ''}
                    >
                      <option value="">Todos los usuarios</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="entity" className="block text-sm font-medium text-gray-700">
                      Tipo de Entidad
                    </label>
                    <select
                      id="entity"
                      name="entity"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      defaultValue={params.entity || ''}
                    >
                      <option value="">Todas las entidades</option>
                      <option value="anotaciones">Anotaciones</option>
                      <option value="referencias">Referencias</option>
                      <option value="articulos">Artículos</option>
                      <option value="users">Usuarios</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Filtrar
                    </button>
                  </div>
                </form>
              </div>

              {/* Audit Log Table */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-700">
                    Mostrando {skip + 1} - {Math.min(skip + pageSize, totalCount)} de{' '}
                    {totalCount} registros
                  </p>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-gray-500">No se encontraron registros de auditoría</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {auditLogs.map((log) => (
                      <li key={log.id} className="px-4 py-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  log.actionType === 'UPDATE'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : log.actionType === 'DELETE'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {log.actionType}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {log.entityType}
                              </span>
                              <span className="text-sm text-gray-500">ID: {log.entityId}</span>
                            </div>

                            <p className="mt-1 text-sm text-gray-600">
                              Por <span className="font-medium">{log.user.fullName}</span> (
                              {log.user.email})
                            </p>

                            {log.changedFields && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500">Campos modificados:</p>
                                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.changedFields, null, 2)}
                                </pre>
                              </div>
                            )}

                            <p className="mt-2 text-xs text-gray-400">
                              {new Date(log.createdAt).toLocaleString('es-CR', {
                                dateStyle: 'full',
                                timeStyle: 'medium',
                              })}
                              {log.ipAddress && ` | IP: ${log.ipAddress}`}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              alert(
                                'Ver detalles completos:\n\n' +
                                  JSON.stringify(
                                    {
                                      previous: log.previousValues,
                                      new: log.newValues,
                                      changed: log.changedFields,
                                    },
                                    null,
                                    2
                                  )
                              )
                            }}
                            className="ml-4 text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Ver detalles
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      {page > 1 && (
                        <Link
                          href={`/admin/audit?page=${page - 1}${
                            params.user ? `&user=${params.user}` : ''
                          }${params.entity ? `&entity=${params.entity}` : ''}`}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Anterior
                        </Link>
                      )}
                      {page < totalPages && (
                        <Link
                          href={`/admin/audit?page=${page + 1}${
                            params.user ? `&user=${params.user}` : ''
                          }${params.entity ? `&entity=${params.entity}` : ''}`}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Siguiente
                        </Link>
                      )}
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Página <span className="font-medium">{page}</span> de{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          {page > 1 && (
                            <Link
                              href={`/admin/audit?page=${page - 1}${
                                params.user ? `&user=${params.user}` : ''
                              }${params.entity ? `&entity=${params.entity}` : ''}`}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                              Anterior
                            </Link>
                          )}
                          {page < totalPages && (
                            <Link
                              href={`/admin/audit?page=${page + 1}${
                                params.user ? `&user=${params.user}` : ''
                              }${params.entity ? `&entity=${params.entity}` : ''}`}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                              Siguiente
                            </Link>
                          )}
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
