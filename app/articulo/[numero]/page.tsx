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

  const articulo = await prisma.articulo.findUnique({
    where: { numero },
    include: {
      anotaciones: {
        where: { esVisible: true, esAprobada: true },
        orderBy: { orden: 'asc' },
        include: {
          tipoAnotacion: true,
          createdBy: true,
          referencias: {
            include: {
              referencia: {
                include: { tipoReferencia: true },
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

  // Get all articles for nav
  const allArticulos = await prisma.articulo.findMany({
    where: { esVigente: true },
    orderBy: { orden: 'asc' },
    select: { numero: true, nombre: true },
  })

  // Get prev/next
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

  // Clean textoLegal - remove title if duplicated
  let cleanedTexto = articulo.textoLegal
  const nombreLower = articulo.nombre.toLowerCase().trim()
  const textoLower = articulo.textoLegal.toLowerCase().trim()

  if (textoLower.startsWith(nombreLower) || textoLower.startsWith('<p>' + nombreLower)) {
    const regex = new RegExp('^(<[^>]+>)?\\s*' + articulo.nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[.:-]?\\s*', 'i')
    cleanedTexto = articulo.textoLegal.replace(regex, '')
  }

  return (
    <>
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
        <div style={{
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

          <Link href="/" style={{
            color: '#ccc',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.2s'
          }} className="article-back-link">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      {/* Red Accent Bar */}
      <div style={{
        height: '4px',
        backgroundColor: 'var(--delfino-primary)',
        boxShadow: '0 2px 4px rgba(220, 20, 60, 0.3)'
      }} />

      <div className="d-layout" style={{ paddingTop: 0 }}>
        {/* Left Navigation */}
        <ArticleNavigation articulos={allArticulos} currentNumero={numero} />

        {/* Main Content */}
        <main className="d-main">
          <article className="d-content">
            {/* Breadcrumb */}
            <nav className="d-article__breadcrumb" style={{ marginBottom: '2rem' }}>
              <Link href="/">Inicio</Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <span style={{ color: 'var(--delfino-text-muted)' }}>Artículo {articulo.numero}</span>
            </nav>

            {/* Article Header */}
            <div style={{ marginBottom: '2rem' }}>
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
              <h1 className="d-article__title" style={{
                fontSize: '2.25rem',
                lineHeight: 1.2,
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                {articulo.nombre}
              </h1>
            </div>

            {/* Legal Text */}
            <div
              className="d-article__text"
              dangerouslySetInnerHTML={{ __html: cleanedTexto }}
              style={{
                backgroundColor: 'var(--delfino-background-alt)',
                borderLeft: '4px solid var(--delfino-primary)',
                padding: '1.5rem',
                borderRadius: '0 4px 4px 0',
                marginBottom: '2rem',
                fontSize: '1.0625rem',
                lineHeight: 1.8
              }}
            />

            {/* Navigation Footer */}
            <nav style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--delfino-border)'
            }}>
              {prevArticulo ? (
                <Link href={`/articulo/${prevArticulo.numero}`} style={{
                  padding: '1.5rem',
                  border: '1px solid var(--delfino-border)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
                }} className="article-nav-link">
                  <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--delfino-text-muted)',
                    marginBottom: '0.5rem'
                  }}>← Anterior</span>
                  <span style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--delfino-text-primary)'
                  }}>Art. {prevArticulo.numero}</span>
                </Link>
              ) : <div />}

              {nextArticulo && (
                <Link href={`/articulo/${nextArticulo.numero}`} style={{
                  padding: '1.5rem',
                  border: '1px solid var(--delfino-border)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'right'
                }} className="article-nav-link">
                  <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--delfino-text-muted)',
                    marginBottom: '0.5rem'
                  }}>Siguiente →</span>
                  <span style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--delfino-text-primary)'
                  }}>Art. {nextArticulo.numero}</span>
                </Link>
              )}
            </nav>
          </article>
        </main>

        {/* Right Annotations */}
        <ArticleAnnotations anotaciones={articulo.anotaciones} />
      </div>
    </>
  )
}
