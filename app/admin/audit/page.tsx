import AdminPageHeader from '@/app/admin/_components/AdminPageHeader'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AuditLogList from './AuditLogList'

export const dynamic = 'force-dynamic'

/**
 * NOTE: All params in searchParams are strings.
 * Need to be parsed and converted to appropriate types.
 */
interface SearchParams {
  page?: string
  user?: string
  entity?: string
}

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const page = parseInt(searchParams.page || '1')
  const pageSize = 50
  const skip = (page - 1) * pageSize

  const where: any = {}
  if (searchParams.user) where.userId = searchParams.user
  if (searchParams.entity) where.entityType = searchParams.entity

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
    <>
      <AdminPageHeader title="Registro de Auditoría" subtitle="Historial completo de cambios realizados en el sistema" />

      <div className="admin-page-content">
        {/* Filters */}
        <div className="admin-card mb-6">
          <div className="admin-card-body">
            <form method="get" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="user" className="form-label">Usuario</label>
                <select id="user" name="user" className="form-select" defaultValue={searchParams.user || ''}>
                  <option value="">Todos los usuarios</option>
                  {users.map((user) => (<option key={user.id} value={user.id}>{user.fullName}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="entity" className="form-label">Tipo de Entidad</label>
                <select id="entity" name="entity" className="form-select" defaultValue={searchParams.entity || ''}>
                  <option value="">Todas las entidades</option>
                  <option value="anotaciones">Anotaciones</option>
                  <option value="referencias">Referencias</option>
                  <option value="articulos">Artículos</option>
                  <option value="users">Usuarios</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn btn-primary w-full">Filtrar</button>
              </div>
            </form>
          </div>
        </div>

        <AuditLogList
          logs={auditLogs}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          skip={skip}
          pageSize={pageSize}
          filterUser={searchParams.user}
          filterEntity={searchParams.entity}
        />
      </div>
    </>
  )
}
