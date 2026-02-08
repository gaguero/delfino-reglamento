import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AuditLogList from './AuditLogList'

export const dynamic = 'force-dynamic'

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

  const where: any = {}
  if (params.user) where.userId = params.user
  if (params.entity) where.entityType = params.entity

  const [auditLogs, totalCount, users] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { user: { select: { fullName: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
    prisma.user.findMany({ select: { id: true, fullName: true, email: true }, orderBy: { fullName: 'asc' } }),
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
                <Link href="/admin/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/users" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Usuarios</Link>
                )}
                <Link href="/admin/audit" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Auditoría</Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{session.user.email}</span>
              <form action={async () => { 'use server'; const { signOut } = await import('@/lib/auth'); await signOut() }}>
                <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">Salir</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Registro de Auditoría</h1>
            <p className="mt-1 text-sm text-gray-600">Historial completo de cambios realizados en el sistema</p>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {/* Filters */}
              <div className="bg-white shadow sm:rounded-lg p-4 mb-6">
                <form method="get" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="user" className="block text-sm font-medium text-gray-700">Usuario</label>
                    <select id="user" name="user" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" defaultValue={params.user || ''}>
                      <option value="">Todos los usuarios</option>
                      {users.map((user) => (<option key={user.id} value={user.id}>{user.fullName}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="entity" className="block text-sm font-medium text-gray-700">Tipo de Entidad</label>
                    <select id="entity" name="entity" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" defaultValue={params.entity || ''}>
                      <option value="">Todas las entidades</option>
                      <option value="anotaciones">Anotaciones</option>
                      <option value="referencias">Referencias</option>
                      <option value="articulos">Artículos</option>
                      <option value="users">Usuarios</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Filtrar</button>
                  </div>
                </form>
              </div>

              <AuditLogList
                logs={JSON.parse(JSON.stringify(auditLogs))}
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                skip={skip}
                pageSize={pageSize}
                filterUser={params.user}
                filterEntity={params.entity}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
