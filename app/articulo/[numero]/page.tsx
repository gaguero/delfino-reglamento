import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ArticleNavigation from '@/components/ArticleNavigation'
import ArticleAnnotations from '@/components/ArticleAnnotations'

export const dynamic = 'force-dynamic'

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
  const { numero } = await params
  
  // Fetch current article with annotations
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

  // Fetch all articles for navigation
  const allArticulos = await prisma.articulo.findMany({
    where: { esVigente: true },
    orderBy: { orden: 'asc' },
    select: { numero: true, nombre: true, orden: true },
  })

  // Clean textoLegal to remove title redundancy
  // Remove article name from start of textoLegal if it appears there
  let cleanedTextoLegal = articulo.textoLegal
  const nombreLower = articulo.nombre.toLowerCase().trim()
  const textoLower = articulo.textoLegal.toLowerCase().trim()
  
  // Check if textoLegal starts with the article name (with or without HTML tags)
  if (textoLower.startsWith(nombreLower) || 
      textoLower.startsWith('<p>' + nombreLower) ||
      textoLower.startsWith('<div>' + nombreLower)) {
    // Remove the article name and any following punctuation/whitespace
    const regex = new RegExp('^(<[^>]+>)?\\s*' + articulo.nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[.:-]?\\s*', 'i')
    cleanedTextoLegal = articulo.textoLegal.replace(regex, '')
  }

  // Get prev/next articles
  const [prevArticulo, nextArticulo] = await Promise.all([
    prisma.articulo.findFirst({
      where: { orden: { lt: articulo.orden }, esVigente: true },
      orderBy: { orden: 'desc' },
      select: { numero: true, nombre: true },
    }),
    prisma.articulo.findFirst({
      where: { orden: { gt: articulo.orden }, esVigente: true },
      orderBy: { orden: 'asc' },
      select: { numero: true, nombre: true },
    }),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="site-header">
        <div className="site-header__top">
          <div className="container">
            Delfino.cr — Periodismo de Datos
          </div>
        </div>
        <div className="site-header__main">
          <div className="container">
            <Link href="/" className="site-header__logo">
              DELFINO.CR
              <span className="site-header__logo-subtitle">
                Reglamento de la Asamblea Legislativa Anotado
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="article-layout">
        {/* Left Sidebar - Navigation */}
        <aside className="article-layout__sidebar-left">
          <ArticleNavigation 
            articulos={allArticulos} 
            currentNumero={numero} 
          />
        </aside>

        {/* Center - Article Content */}
        <main className="article-layout__content">
          {/* Breadcrumb */}
          <nav className="article-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Inicio</Link>
            <span>/</span>
            <span>Artículo {articulo.numero}</span>
          </nav>

          {/* Article Header */}
          <span className="article-category">Artículo {articulo.numero}</span>
          <h1 className="article-title">{articulo.nombre}</h1>

          {/* Legal Text */}
          <article className="article-text">
            <div dangerouslySetInnerHTML={{ __html: cleanedTextoLegal }} />
          </article>

          {/* Article Navigation Footer */}
          <nav className="article-nav-footer" aria-label="Navegación entre artículos">
            {prevArticulo ? (
              <Link 
                href={`/articulo/${prevArticulo.numero}`}
                className="article-nav-footer__link"
              >
                <span>←</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--delfino-text-tertiary)' }}>Anterior</div>
                  <div>Art. {prevArticulo.numero}</div>
                </div>
              </Link>
            ) : (
              <span />
            )}
            
            {nextArticulo && (
              <Link 
                href={`/articulo/${nextArticulo.numero}`}
                className="article-nav-footer__link"
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--delfino-text-tertiary)' }}>Siguiente</div>
                  <div>Art. {nextArticulo.numero}</div>
                </div>
                <span>→</span>
              </Link>
            )}
          </nav>
        </main>

        {/* Right Sidebar - Annotations */}
        <aside className="article-layout__sidebar-right">
          <ArticleAnnotations anotaciones={articulo.anotaciones} />
        </aside>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="site-footer__content">
          <div className="site-footer__links">
            <a href="https://delfino.cr" target="_blank" rel="noopener noreferrer">
              Delfino.cr
            </a>
            <a href="https://www.asamblea.go.cr/" target="_blank" rel="noopener noreferrer">
              Asamblea Legislativa
            </a>
            <a href="https://www.pgrweb.go.cr/scij/" target="_blank" rel="noopener noreferrer">
              SCIJ
            </a>
          </div>
          <p className="site-footer__text">
            Reglamento de la Asamblea Legislativa de Costa Rica — Anotado por Delfino.cr
          </p>
        </div>
      </footer>
    </div>
  )
}
