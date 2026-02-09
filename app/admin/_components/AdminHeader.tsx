import Link from 'next/link'
import { geistSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminHeader() {
  const session = await auth()

  // Get pending AI review count
  const pendingCount = await prisma.anotacion.count({
    where: { fuenteIA: true, esAprobada: false, esVisible: true }
  })

  return (
    <nav className="admin-nav">
      <div className="admin-nav-container">
        <div className="admin-nav-brand">
          <Link href="/admin/dashboard" className="admin-nav-logo">
            Delfino.cr
          </Link>
          <div className="admin-nav-title">Panel de Administración</div>
        </div>
        <div className="admin-nav-links">
          <NavLink href="/admin/dashboard" label="Dashboard" />
          {session?.user?.role === 'ADMIN' && <NavLink href="/admin/users" label="Usuarios" />}
          <NavLink href="/admin/audit" label="Auditoría" />
          <NavLink href="/admin/articles" label="Artículos" />
          <NavLink href="/admin/votos" label="Votos" />
          <NavLink href="/admin/actas" label="Actas" />
          <NavLink href="/admin/revisiones" label={`Revisiones IA${pendingCount > 0 ? ` (${pendingCount})` : ''}`} />
        </div>
        <div className="admin-nav-user">
          {session?.user?.email && <span className="admin-nav-email">{session.user.email}</span>}
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="admin-nav-link">
      {label}
    </Link>
  )
}

async function LogoutButton() {
  const session = await auth()
  if (!session?.user) return null

  return (
    <form action={async () => { 'use server'; const { signOut } = await import('@/lib/auth'); await signOut() }}>
      <button type="submit" className="admin-nav-logout">
        Salir
      </button>
    </form>
  )
}
