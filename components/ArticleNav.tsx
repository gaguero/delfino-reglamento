import Link from 'next/link'
import { geistSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/auth'

export default async function ArticleNav({ prev, next }: { prev: any; next: any }) {
  const session = await auth()

  return (
    <nav className="article-nav">
      {prev ? (
        <Link href={`/articulo/${prev.numero}`} className={cn('article-nav-link prev', geistSans.className)}>
          <span className="article-nav-label">Anterior</span>
          <span className="article-nav-title">Art. {prev.numero}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/articulo/${next.numero}`} className={cn('article-nav-link next', geistSans.className)}>
          <span className="article-nav-label">Siguiente</span>
          <span className="article-nav-title">Art. {next.numero}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
