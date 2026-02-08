'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Articulo {
  numero: string
  nombre: string
  orden: number
}

interface ArticleNavigationProps {
  articulos: Articulo[]
  currentNumero: string
}

export default function ArticleNavigation({ articulos, currentNumero }: ArticleNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredArticulos = articulos.filter((art) =>
    art.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <nav className="article-nav" aria-label="Navegación de artículos">
      <h2 className="sidebar-title">Artículos del Reglamento</h2>
      
      <input
        type="search"
        placeholder="Buscar artículo..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="article-nav__search"
      />
      
      <ul className="article-nav__list">
        {filteredArticulos.map((articulo) => (
          <li key={articulo.numero} className="article-nav__item">
            <Link
              href={`/articulo/${articulo.numero}`}
              className={`article-nav__link ${
                articulo.numero === currentNumero ? 'article-nav__link--active' : ''
              }`}
            >
              <span style={{ fontWeight: 600 }}>Art. {articulo.numero}</span>
              <span style={{ 
                display: 'block', 
                fontSize: '0.8125rem', 
                color: 'inherit', 
                opacity: 0.8,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: 1.4,
                marginTop: '2px'
              }}>
                {articulo.nombre}
              </span>
            </Link>
          </li>
        ))}
        
        {filteredArticulos.length === 0 && (
          <li className="empty-state">
            <div className="empty-state__icon">🔍</div>
            No se encontraron artículos
          </li>
        )}
      </ul>
    </nav>
  )
}
