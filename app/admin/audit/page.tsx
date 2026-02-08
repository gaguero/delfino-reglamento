import Link from 'next/link'
import { GeistSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader'
import { auth } from '@/lib/auth' // Import auth

export default async function AuditPage() { // Removed searchParams prop as it's handled differently in App Router
  const session = await auth()

  if (!session) {
    // Redirect to login if not authenticated
    return null // Or redirect explicitly if needed within Server Component context
  }

  // Fetching data directly in the Server Component
  // In a real app, you'd pass filters from the URL search params if available
  // For simplicity, fetching all logs here. Pagination and filtering would need URLSearchParams handling.
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { fullName: true, email: true } } },
    take: 50, // Sample: limiting for now
  })
  const users = await prisma.user.findMany({ select: { id: true, fullName: true, email: true }, orderBy: { fullName: 'asc' } })

  return (
    <>
      <AdminPageHeader title="Registro de Auditoría" subtitle="Historial completo de cambios realizados en el sistema" />

      <div className="admin-page-content">
        {/* Filters (Simplified for now, would need URLSearchParams for dynamic filtering) */}
        <div className="admin-card mb-6">
          <div className="admin-card-body">
            <form method="get" action="/admin/audit" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="user" className="form-label">Usuario</label>
                <select id="user" name="user" className="form-select" defaultValue={''}> {/* Set default based on URL param if implemented */}
                  <option value="">Todos los usuarios</option>
                  {users.map((user) => (<option key={user.id} value={user.id}>{user.fullName}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="entity" className="form-label">Tipo de Entidad</label>
                <select id="entity" name="entity" className="form-select" defaultValue={''}> {/* Set default based on URL param if implemented */}
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
          page={1} // Placeholder, pagination needs URLSearchParams
          totalPages={1} // Placeholder
          totalCount={auditLogs.length}
          skip={0}
          pageSize={50}
          filterUser={''} // Placeholder
          filterEntity={''} // Placeholder
        />
      </div>
    </>
  )
}

// This component expects AuditLogList to handle pagination and filtering logic
// based on URLSearchParams if it were fully implemented.
