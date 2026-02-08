import Link from 'next/link'
import { GeistSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'

const STATS_DATA = [
  {
    label: 'Artículos',
    value: 'stats[0]',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    colorClass: 'primary',
  },
  {
    label: 'Anotaciones',
    value: 'stats[1]',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    colorClass: 'accent',
  },
  {
    label: 'Referencias',
    value: 'stats[2]',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    colorClass: 'success',
  },
  {
    label: 'Usuarios',
    value: 'stats[3]',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    colorClass: 'warning',
  },
]

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  colorClass: string
}

function StatCard({ label, value, icon, colorClass }: StatCardProps) {
  return (
    <div className={cn('stat-card', `bg-${colorClass}-50`)}>
      <div className={cn(`stat-icon ${colorClass}`) }>
        {icon}
      </div>
      <div className="stat-content">
        <dt className="stat-label">{label}</dt>
        <dd className="stat-value">{value}</dd>
      </div>
    </div>
  )
}

export default function AdminDashboard({ stats, recentAnnotations, session }: { stats: number[], recentAnnotations: any[], session: any }) {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Resumen general de la actividad del sistema</p>
      </div>

      <div className="stats-grid">
        {STATS_DATA.map((stat, index) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stats[index]}
            icon={stat.icon}
            colorClass={stat.colorClass}
          />
        ))}
      </div>

      {/* Recent Annotations */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Anotaciones Recientes</h3>
        </div>
        <div className="admin-card-body">
          {recentAnnotations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay anotaciones recientes.</p>
          ) : (
            <ul className="admin-list">
              {recentAnnotations.map((anotacion) => (
                <li key={anotacion.id} className="admin-list-item">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-600">
                        <Link href={`/admin/articulo/${anotacion.articulo.numero}/edit`} className="admin-nav-link hover:underline">
                          Art. {anotacion.articulo.numero}: {anotacion.articulo.nombre}
                        </Link>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {anotacion.tipoAnotacion.nombre} - Por {anotacion.createdBy.fullName}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(anotacion.updatedAt).toLocaleString('es-CR')}
                      </p>
                    </div>
                    <Link
                      href={`/admin/articulo/${anotacion.articulo.numero}/edit`}
                      className="btn btn-sm btn-ghost"
                    >
                      Ver/Editar
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Link href="/" className="btn btn-secondary">
          Ver Sitio Público
        </Link>
      </div>
    </div>
  )
}
