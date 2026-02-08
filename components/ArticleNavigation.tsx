'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Articulo {
  numero: string
  nombre: string
  orden?: number
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
    <>
      <div className="d-nav__header">
        <h2 className="d-nav__title">Índice de Artículos</h2>
        <input
          type="search"
          placeholder="Buscar artículo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="d-nav__search"
        />
      </div>
      
      <ul className="d-nav__list">
        {filteredArticulos.map((articulo) => (
          <li key={articulo.numero} className="d-nav__item">
            <Link
              href={`/articulo/${articulo.numero}`}
              className={`d-nav__link ${
                articulo.numero === currentNumero ? 'd-nav__link--active' : ''
              }`}
            >
              <div style={{ fontWeight: 500 }}>Artículo {articulo.numero}</div>
              <div style={{ 
                fontSize: '0.8125rem', 
                opacity: 0.8,
                marginTop: '2px',
                lineHeight: 1.3
              }}>
                {articulo.nombre}
              </div>
            </Link>
          </li>
        ))}
        
        {filteredArticulos.length === 0 && (
          <li className="d-empty">
            <div className="d-empty__icon">🔍</div>
            <div className="d-empty__title">No encontrado</div>
            <div className="d-empty__text">Prueba con otro término</div>
          </li>
        )}
      </ul>
    </>
  )
}
