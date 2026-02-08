import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
  const { numero } = await params
  const articulo = await prisma.articulo.findUnique({
    where: { numero },
    include: {
      anotaciones: {
        where: { esVisible: true },
        orderBy: { orden: 'asc' },
        include: {
          tipoAnotacion: true,
          createdBy: true,
          referencias: {
            include: {
              referencia: {
                include: {
                  tipoReferencia: true,
                },
              },
            },
            orderBy: { orden: 'asc' },
          },
        },
      },
    },
  })

  if (!articulo) {
    notFound()
  }

  // Get prev/next articles for navigation
  const [prevArticulo, nextArticulo] = await Promise.all([
    prisma.articulo.findFirst({
      where: { orden: { lt: articulo.orden } },
      orderBy: { orden: 'desc' },
      select: { numero: true, nombre: true },
    }),
    prisma.articulo.findFirst({
      where: { orden: { gt: articulo.orden } },
      orderBy: { orden: 'asc' },
      select: { numero: true, nombre: true },
    }),
  ])

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--delfino-font-primary)' }}>
      {/* Header */}
      <header className="site-header">
        <div className="header-top">
          <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Delfino.cr - Periodismo de Datos</span>
          </div>
        </div>
        <div className="header-container">
          <Link href="/" className="logo">
            Delfino.cr
            <span className="logo-subtitle">Reglamento de la Asamblea Legislativa Anotado</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="article-viewer fade-in">
          <Link href="/" className="back-link">
            ← Volver al índice
          </Link>

          <div className="article-viewer-header">
            <span className="article-category">Artículo {articulo.numero}</span>
            <h1>{articulo.nombre}</h1>
          </div>

          {/* Legal Text */}
          <div className="texto-legal">{articulo.textoLegal}</div>

          {/* Annotations */}
          {articulo.anotaciones.length > 0 && (
            <div className="anotaciones-section">
              <h3>Anotaciones ({articulo.anotaciones.length})</h3>
              {articulo.anotaciones.map((anotacion) => {
                const tipoSlug = anotacion.tipoAnotacion.nombre.toLowerCase()
                const cardClass = `anotacion-card ${
                  tipoSlug.includes('jurisprudencia') ? 'tipo-jurisprudencia' :
                  tipoSlug.includes('contexto') ? 'tipo-contexto' :
                  tipoSlug.includes('nota') ? 'tipo-nota' : ''
                }`
                const badgeClass = `anotacion-tipo ${
                  tipoSlug.includes('jurisprudencia') ? 'jurisprudencia' :
                  tipoSlug.includes('contexto') ? 'contexto' :
                  tipoSlug.includes('nota') ? 'nota' : ''
                }`

                return (
                  <div key={anotacion.id} className={cardClass}>
                    <span className={badgeClass}>
                      {anotacion.tipoAnotacion.nombre}
                    </span>
                    <div
                      className="anotacion-contenido"
                      dangerouslySetInnerHTML={{ __html: anotacion.contenido }}
                    />

                    {anotacion.referencias.length > 0 && (
                      <div className="referencias-list">
                        <h5>Referencias</h5>
                        {anotacion.referencias.map(({ referencia }) => (
                          <div key={referencia.id} className="referencia-item">
                            <span className="referencia-numero">
                              {referencia.tipoReferencia.nombre} {referencia.numero}
                            </span>
                            {referencia.titulo && (
                              <span style={{ color: 'var(--delfino-text-secondary)', fontSize: '0.9rem' }}>
                                {' '}- {referencia.titulo}
                              </span>
                            )}
                            <div className="referencia-links">
                              {referencia.urlNexus && (
                                <a href={referencia.urlNexus} target="_blank" rel="noopener noreferrer">
                                  Nexus PJ
                                </a>
                              )}
                              {referencia.urlCatalogo && (
                                <a href={referencia.urlCatalogo} target="_blank" rel="noopener noreferrer">
                                  Catálogo
                                </a>
                              )}
                              {referencia.urlRepositorio && (
                                <a href={referencia.urlRepositorio} target="_blank" rel="noopener noreferrer">
                                  Repositorio AL
                                </a>
                              )}
                              {referencia.urlPrincipal &&
                                !referencia.urlNexus &&
                                !referencia.urlCatalogo &&
                                !referencia.urlRepositorio && (
                                  <a href={referencia.urlPrincipal} target="_blank" rel="noopener noreferrer">
                                    Ver documento
                                  </a>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="anotacion-meta">
                      Añadido por {anotacion.createdBy.fullName} el{' '}
                      {new Date(anotacion.createdAt).toLocaleDateString('es-CR')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Article Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--delfino-border)' }}>
            {prevArticulo ? (
              <Link href={`/articulo/${prevArticulo.numero}`} className="back-link">
                ← Art. {prevArticulo.numero}
              </Link>
            ) : <span />}
            {nextArticulo && (
              <Link href={`/articulo/${nextArticulo.numero}`} className="back-link">
                Art. {nextArticulo.numero} →
              </Link>
            )}
          </div>
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
        </div>
      </footer>
    </div>
  )
}
