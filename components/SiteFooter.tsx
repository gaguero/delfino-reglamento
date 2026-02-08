import Link from 'next/link'
import { GeistSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link href="https://delfino.cr" target="_blank" rel="noopener noreferrer">Delfino.cr</Link>
          <Link href="https://www.asamblea.go.cr/" target="_blank" rel="noopener noreferrer">Asamblea Legislativa</Link>
          <Link href="https://www.pgrweb.go.cr/scij/" target="_blank" rel="noopener noreferrer">SCIJ</Link>
        </div>
        <p>Reglamento de la Asamblea Legislativa de Costa Rica — Anotado por Delfino.cr</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
          El contenido legal es propiedad del Estado de Costa Rica. Las anotaciones son propiedad de Delfino.cr.
        </p>
      </div>
    </footer>
  )
}
