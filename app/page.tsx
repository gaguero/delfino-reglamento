import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const articulos = await prisma.articulo.findMany({
    where: { esVigente: true },
    orderBy: { orden: 'asc' },
    include: {
      anotaciones: {
        where: { esVisible: true, esAprobada: true },
      },
    },
  })

  const totalArticulos = articulos.length
  const articulosConAnotaciones = articulos.filter(a => a.anotaciones.length > 0).length
  const totalAnotaciones = articulos.reduce((sum, a) => sum + a.anotaciones.length, 0)

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--delfino-font-primary)', backgroundColor: 'var(--delfino-background)' }}>
      {/* Delfino.cr Header */}
      <header style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div className="header-container" style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
            textDecoration: 'none',
            letterSpacing: '0.3em'
          }}>
            DELFINO.CR
          </Link>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link
              href="/admin"
              style={{
                backgroundColor: 'var(--delfino-primary)',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Administrar
            </Link>
          </div>
        </div>
      </header>

      {/* Red Accent Bar */}
      <div style={{
        height: '4px',
        backgroundColor: 'var(--delfino-primary)',
        boxShadow: '0 2px 4px rgba(220, 20, 60, 0.3)'
      }} />

      {/* Main Content */}
      <main className="main-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--delfino-text-primary)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            Reglamento de la Asamblea Legislativa
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--delfino-text-secondary)',
            marginBottom: '2rem'
          }}>
            República de Costa Rica — Anotado por Delfino.cr
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginTop: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--delfino-primary)' }}>
                {totalArticulos}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--delfino-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Artículos
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--delfino-primary)' }}>
                {articulosConAnotaciones}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--delfino-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Con anotaciones
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--delfino-primary)' }}>
                {totalAnotaciones}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--delfino-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Anotaciones
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {articulos.map((articulo) => (
            <Link
              key={articulo.id}
              href={`/articulo/${articulo.numero}`}
              style={{
                textDecoration: 'none',
                backgroundColor: 'white',
                border: '1px solid var(--delfino-border)',
                borderRadius: '8px',
                padding: '1.5rem',
                transition: 'all 0.2s ease',
                display: 'block'
              }}
              className="article-card-home"
            >
              <div style={{
                display: 'inline-block',
                backgroundColor: 'var(--delfino-primary)',
                color: 'white',
                padding: '0.375rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Artículo {articulo.numero}
              </div>

              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--delfino-text-primary)',
                marginBottom: '0.75rem',
                lineHeight: 1.4
              }}>
                {articulo.nombre}
              </h3>

              {articulo.anotaciones.length > 0 && (
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--delfino-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {articulo.anotaciones.length} anotación{articulo.anotaciones.length !== 1 ? 'es' : ''}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          backgroundColor: 'var(--delfino-background-alt)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--delfino-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Enlaces Relacionados
          </h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <a
              href="https://www.asamblea.go.cr/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--delfino-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem'
              }}
            >
              Asamblea Legislativa →
            </a>
            <a
              href="https://www.pgrweb.go.cr/scij/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--delfino-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem'
              }}
            >
              SCIJ →
            </a>
            <a
              href="https://nexuspj.poder-judicial.go.cr/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--delfino-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem'
              }}
            >
              Nexus PJ →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '3rem 2rem 2rem',
        marginTop: '4rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            marginBottom: '1rem'
          }}>
            DELFINO.CR
          </div>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1rem' }}>
            Reglamento de la Asamblea Legislativa de Costa Rica — Anotado por Delfino.cr
          </p>
          <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>
            El contenido legal es propiedad del Estado de Costa Rica. Las anotaciones son propiedad de Delfino.cr.
          </p>
        </div>
      </footer>
    </div>
  )
}
