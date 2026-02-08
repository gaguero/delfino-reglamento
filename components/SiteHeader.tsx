import Link from 'next/link'
import { auth } from '@/lib/auth'

export default async function SiteHeader() {
  const session = await auth()

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Delfino.cr - Periodismo de Datos</span>
          <CurrentDate />
        </div>
      </div>
      <div className="header-container">
        <Logo />
      </div>
      <MainNav />
    </header>
  )
}

function Logo() {
  return (
    <Link href="/" className="logo">
      Delfino.cr
      <span className="logo-subtitle">Reglamento de la Asamblea Legislativa Anotado</span>
    </Link>
  )
}

function MainNav() {
  return (
    <nav className="header-container">
      <div className="quick-access">
        <Link href="/" className="active">Todos los Artículos</Link>
        <Link href="https://www.asamblea.go.cr/" target="_blank" rel="noopener noreferrer">Asamblea Legislativa</Link>
        <Link href="https://www.pgrweb.go.cr/scij/" target="_blank" rel="noopener noreferrer">SCIJ</Link>
        <Link href="https://nexuspj.poder-judicial.go.cr/" target="_blank" rel="noopener noreferrer">Nexus PJ</Link>
      </div>
    </nav>
  )
}

function CurrentDate() {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const formattedDate = new Date().toLocaleDateString('es-CR', options)
  return <span>{formattedDate}</span>
}
