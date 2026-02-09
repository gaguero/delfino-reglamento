import Link from 'next/link'
import { cn } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  colorClass: string
  href?: string
}

function StatCard({ label, value, icon, colorClass, href }: StatCardProps) {
  const card = (
    <div className={cn('stat-card', `bg-${colorClass}-50`)}>
      <div className={cn(`stat-icon ${colorClass}`)}>
        {icon}
      </div>
      <div className="stat-content">
        <dt className="stat-label">{label}</dt>
        <dd className="stat-value">{value}</dd>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }
  return card
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  // Fetch stats
  const [
    totalArticulos,
    totalAnotaciones,
    totalReferencias,
    totalUsuarios,
    totalVotos,
    totalActas,
    pendingReviews,
    articulosSinAnotaciones,
    recentAnnotations
  ] = await Promise.all([
    prisma.articulo.count({ where: { esVigente: true } }),
    prisma.anotacion.count({ where: { esVisible: true, esAprobada: true } }),
    prisma.referencia.count(),
    prisma.user.count(),
    prisma.referencia.count({
      where: { tipoReferencia: { nombre: 'Voto' } }
    }),
    prisma.referencia.count({
      where: { tipoReferencia: { nombre: 'Acta' } }
    }),
    prisma.anotacion.count({
      where: { fuenteIA: true, esAprobada: false, esVisible: true }
    }),
    prisma.articulo.count({
      where: {
        esVigente: true,
        anotaciones: {
          none: {
            esVisible: true,
            esAprobada: true
          }
        }
      }
    }),
    prisma.anotacion.findMany({
      where: { esVisible: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        articulo: { select: { numero: true, nombre: true } },
        tipoAnotacion: { select: { nombre: true } },
        createdBy: { select: { fullName: true } }
      }
    })
  ])

  const STATS_DATA = [
    {
      label: 'Artículos',
      value: totalArticulos,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      colorClass: 'primary',
      href: '/admin/articles'
    },
    {
      label: 'Anotaciones',
      value: totalAnotaciones,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      colorClass: 'accent',
    },
    {
      label: 'Referencias',
      value: totalReferencias,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      colorClass: 'success',
    },
    {
      label: 'Usuarios',
      value: totalUsuarios,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      colorClass: 'warning',
      href: session.user.role === 'ADMIN' ? '/admin/users' : undefined
    },
    {
      label: 'Votos Registrados',
      value: totalVotos,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      colorClass: 'primary',
      href: '/admin/votos'
    },
    {
      label: 'Actas Registradas',
      value: totalActas,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      colorClass: 'accent',
      href: '/admin/actas'
    },
    {
      label: 'Revisiones Pendientes',
      value: pendingReviews,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      colorClass: pendingReviews > 0 ? 'warning' : 'success',
      href: '/admin/revisiones'
    },
    {
      label: 'Artículos sin Anotaciones',
      value: articulosSinAnotaciones,
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
      colorClass: 'neutral',
    },
  ]

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Resumen general de la actividad del sistema</p>
      </div>

      <div className="stats-grid">
        {STATS_DATA.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.colorClass}
            href={stat.href}
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
