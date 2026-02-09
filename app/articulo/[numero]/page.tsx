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
      {/* Header */}
      <header className="d-header">
        <Link href="/" className="d-header__logo">
          DELFINO.CR
        </Link>
      </header>

      <div className="d-layout">
        {/* Left Navigation */}
        <ArticleNavigation articulos={allArticulos} currentNumero={numero} />

        {/* Main Content */}
        <main className="d-main">
          <article className="d-content">
            {/* Breadcrumb */}
            <nav className="d-article__breadcrumb">
              <Link href="/">Inicio</Link>
              <span>/</span>
              <span>Artículo {articulo.numero}</span>
            </nav>

            {/* Article Header */}
            <span className="d-article__number">Artículo {articulo.numero}</span>
            <h1 className="d-article__title">{articulo.nombre}</h1>

            {/* Legal Text */}
            <div 
              className="d-article__text"
              dangerouslySetInnerHTML={{ __html: cleanedTexto }}
            />

            {/* Navigation Footer */}
            <nav className="d-nav-footer">
              {prevArticulo ? (
                <Link href={`/articulo/${prevArticulo.numero}`} className="d-nav-footer__link">
                  <span className="d-nav-footer__label">← Anterior</span>
                  <span className="d-nav-footer__title">Art. {prevArticulo.numero}</span>
                </Link>
              ) : <div />}
              
              {nextArticulo && (
                <Link href={`/articulo/${nextArticulo.numero}`} className="d-nav-footer__link" style={{ textAlign: 'right' }}>
                  <span className="d-nav-footer__label">Siguiente →</span>
                  <span className="d-nav-footer__title">Art. {nextArticulo.numero}</span>
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
