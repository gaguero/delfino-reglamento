import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const articulos = await prisma.articulo.findMany({
    orderBy: { orden: 'asc' },
    include: {
      _count: {
        select: { anotaciones: true },
      },
    },
  })

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--delfino-font-primary)' }}>
      {/* Header */}
      <header className="site-header">
        <div className="header-top">
          <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Delfino.cr - Periodismo de Datos</span>
            <span>{new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="header-container">
          <Link href="/" className="logo">
            Delfino.cr
            <span className="logo-subtitle">Reglamento de la Asamblea Legislativa Anotado</span>
          </Link>
        </div>
        <nav className="header-container">
          <div className="quick-access">
            <Link href="/">Todos los Artículos</Link>
            <a href="https://www.asamblea.go.cr/" target="_blank" rel="noopener noreferrer">Asamblea Legislativa</a>
            <a href="https://www.pgrweb.go.cr/scij/" target="_blank" rel="noopener noreferrer">SCIJ</a>
            <a href="https://nexuspj.poder-judicial.go.cr/" target="_blank" rel="noopener noreferrer">Nexus PJ</a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="search-container">
          <h1 style={{ fontFamily: 'var(--delfino-font-heading)', fontSize: '2rem', textAlign: 'center', marginBottom: '1rem', color: 'var(--delfino-text-primary)' }}>
            Reglamento de la Asamblea Legislativa
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--delfino-text-secondary)', marginBottom: '1.5rem' }}>
            República de Costa Rica — Anotado y comentado por Delfino.cr
          </p>
        </div>

        <div className="content-grid">
          {articulos.map((articulo) => (
            <Link
              key={articulo.id}
              href={`/articulo/${articulo.numero}`}
              className="article-card fade-in"
            >
              <div className="article-content">
                <span className="article-category">
                  Artículo {articulo.numero}
                </span>
                <h2 className="article-title">{articulo.nombre}</h2>
                {articulo._count.anotaciones > 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--delfino-text-muted)' }}>
                    {articulo._count.anotaciones} anotacion{articulo._count.anotaciones !== 1 ? 'es' : ''}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="https://delfino.cr" target="_blank" rel="noopener noreferrer">Delfino.cr</a>
            <a href="https://www.asamblea.go.cr/" target="_blank" rel="noopener noreferrer">Asamblea Legislativa</a>
            <a href="https://www.pgrweb.go.cr/scij/" target="_blank" rel="noopener noreferrer">SCIJ</a>
          </div>
          <p>Reglamento de la Asamblea Legislativa de Costa Rica — Anotado por Delfino.cr</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
            El contenido legal es propiedad del Estado de Costa Rica. Las anotaciones son propiedad de Delfino.cr.
          </p>
        </div>
      </footer>
    </div>
  )
}
