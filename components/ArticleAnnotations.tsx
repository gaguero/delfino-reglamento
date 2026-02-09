'use client'

import { useState } from 'react'

interface TipoAnotacion {
  nombre: string
}

interface User {
  fullName: string
}

interface Referencia {
  id: string
  numero: string
  titulo: string | null
  urlPrincipal: string | null
  urlNexus: string | null
  urlCatalogo: string | null
  urlRepositorio: string | null
  tipoReferencia: {
    nombre: string
  }
}

interface AnotacionReferencia {
  referencia: Referencia
}

interface Anotacion {
  id: string
  contenido: string
  createdAt: Date
  tipoAnotacion: TipoAnotacion
  createdBy: User
  referencias: AnotacionReferencia[]
  fuenteIA?: boolean
  esAprobada?: boolean
}

interface ArticleAnnotationsProps {
  anotaciones: Anotacion[]
}

export default function ArticleAnnotations({ anotaciones }: ArticleAnnotationsProps) {
  const [activeTab, setActiveTab] = useState<'anotaciones' | 'referencias'>('anotaciones')

  const allReferencias = anotaciones.flatMap((anotacion) => 
    anotacion.referencias.map((ref) => ref.referencia)
  )
  
  const uniqueReferencias = allReferencias.filter((ref, index, self) => 
    index === self.findIndex((r) => r.id === ref.id)
  )

  const getTipoBadgeClass = (tipoNombre: string): string => {
    const tipoSlug = tipoNombre.toLowerCase()
    if (tipoSlug.includes('jurisprudencia')) return 'd-annotation__badge--jurisprudencia'
    if (tipoSlug.includes('contexto')) return 'd-annotation__badge--contexto'
    return 'd-annotation__badge--nota'
  }

  return (
    <>
      <div className="d-annotations__header">
        <button
          className={`d-annotations__tab ${activeTab === 'anotaciones' ? 'd-annotations__tab--active' : ''}`}
          onClick={() => setActiveTab('anotaciones')}
        >
          Anotaciones ({anotaciones.length})
        </button>
        <button
          className={`d-annotations__tab ${activeTab === 'referencias' ? 'd-annotations__tab--active' : ''}`}
          onClick={() => setActiveTab('referencias')}
        >
          Referencias ({uniqueReferencias.length})
        </button>
      </div>

      <div className="d-annotations__list">
        {activeTab === 'anotaciones' ? (
          anotaciones.length === 0 ? (
            <div className="d-empty">
              <div className="d-empty__icon">📝</div>
              <div className="d-empty__title">Sin anotaciones</div>
              <div className="d-empty__text">Este artículo no tiene anotaciones</div>
            </div>
          ) : (
            anotaciones.map((anotacion) => (
              <article key={anotacion.id} className="d-annotation">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span className={`d-annotation__badge ${getTipoBadgeClass(anotacion.tipoAnotacion.nombre)}`}>
                    {anotacion.tipoAnotacion.nombre}
                  </span>
                  {anotacion.fuenteIA && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      backgroundColor: '#f3f0ff',
                      color: '#7c3aed',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      borderRadius: '4px',
                      border: '1px solid #ddd6fe'
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                      IA
                    </span>
                  )}
                </div>

                <div
                  className="d-annotation__content"
                  dangerouslySetInnerHTML={{ __html: anotacion.contenido }}
                />

                {anotacion.referencias.length > 0 && (
                  <div className="d-ref-links">
                    <div className="d-ref-links__title">Referencias vinculadas</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {anotacion.referencias.map(({ referencia }) => (
                        <div key={referencia.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}>
                          <div style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'var(--d-gray-700)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                          }}>
                            {referencia.tipoReferencia.nombre} {referencia.numero}
                          </div>
                          {referencia.titulo && (
                            <div style={{
                              fontSize: '0.75rem',
                              color: 'var(--d-gray-500)',
                              lineHeight: 1.4
                            }}>
                              {referencia.titulo.substring(0, 80)}
                              {referencia.titulo.length > 80 ? '...' : ''}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {referencia.urlPrincipal && (
                              <a
                                href={referencia.urlPrincipal}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '4px 8px',
                                  backgroundColor: '#fce4e8',
                                  color: 'var(--d-red)',
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  borderRadius: '4px',
                                  border: '1px solid var(--d-red)',
                                  transition: 'all 0.15s',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--d-red)'
                                  e.currentTarget.style.color = 'white'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fce4e8'
                                  e.currentTarget.style.color = 'var(--d-red)'
                                }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                  <polyline points="15 3 21 3 21 9"/>
                                  <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                SCIJ
                              </a>
                            )}
                            {referencia.urlNexus && (
                              <a
                                href={referencia.urlNexus}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '4px 8px',
                                  backgroundColor: '#f3f0ff',
                                  color: '#7c3aed',
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd6fe',
                                  transition: 'all 0.15s',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#7c3aed'
                                  e.currentTarget.style.color = 'white'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f3f0ff'
                                  e.currentTarget.style.color = '#7c3aed'
                                }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                  <polyline points="15 3 21 3 21 9"/>
                                  <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                NEXUS PJ
                              </a>
                            )}
                            {referencia.urlCatalogo && (
                              <a
                                href={referencia.urlCatalogo}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '4px 8px',
                                  backgroundColor: '#f0f9ff',
                                  color: '#0369a1',
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  borderRadius: '4px',
                                  border: '1px solid #e0f2fe',
                                  transition: 'all 0.15s',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#0369a1'
                                  e.currentTarget.style.color = 'white'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f0f9ff'
                                  e.currentTarget.style.color = '#0369a1'
                                }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                  <polyline points="15 3 21 3 21 9"/>
                                  <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                CATÁLOGO
                              </a>
                            )}
                            {referencia.urlRepositorio && (
                              <a
                                href={referencia.urlRepositorio}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '4px 8px',
                                  backgroundColor: '#f0fdf4',
                                  color: '#16a34a',
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  borderRadius: '4px',
                                  border: '1px solid #dcfce7',
                                  transition: 'all 0.15s',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#16a34a'
                                  e.currentTarget.style.color = 'white'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f0fdf4'
                                  e.currentTarget.style.color = '#16a34a'
                                }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                  <polyline points="15 3 21 3 21 9"/>
                                  <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                REPO AL
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <footer className="d-annotation__meta">
                  Por {anotacion.createdBy.fullName}
                </footer>
              </article>
            ))
          )
        ) : (
          uniqueReferencias.length === 0 ? (
            <div className="d-empty">
              <div className="d-empty__icon">📚</div>
              <div className="d-empty__title">Sin referencias</div>
              <div className="d-empty__text">No hay referencias para este artículo</div>
            </div>
          ) : (
            uniqueReferencias.map((referencia) => (
              <article key={referencia.id} className="d-annotation">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="d-annotation__badge d-annotation__badge--jurisprudencia">
                    {referencia.tipoReferencia.nombre}
                  </span>
                </div>

                <div style={{
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  marginBottom: '8px',
                  color: 'var(--d-gray-900)',
                  lineHeight: 1.3
                }}>
                  {referencia.numero}
                </div>

                {referencia.titulo && (
                  <div style={{
                    fontSize: '0.9375rem',
                    color: 'var(--d-gray-600)',
                    marginBottom: '16px',
                    lineHeight: 1.5
                  }}>
                    {referencia.titulo}
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {referencia.urlPrincipal && (
                    <a
                      href={referencia.urlPrincipal}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#fce4e8',
                        color: 'var(--d-red)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        borderRadius: '6px',
                        border: '1px solid var(--d-red)',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--d-red)'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fce4e8'
                        e.currentTarget.style.color = 'var(--d-red)'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      VER EN SCIJ
                    </a>
                  )}
                  {referencia.urlNexus && (
                    <a
                      href={referencia.urlNexus}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#f3f0ff',
                        color: '#7c3aed',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        borderRadius: '6px',
                        border: '1px solid #ddd6fe',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#7c3aed'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f0ff'
                        e.currentTarget.style.color = '#7c3aed'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      NEXUS PJ
                    </a>
                  )}
                  {referencia.urlCatalogo && (
                    <a
                      href={referencia.urlCatalogo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#f0f9ff',
                        color: '#0369a1',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        borderRadius: '6px',
                        border: '1px solid #e0f2fe',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0369a1'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f9ff'
                        e.currentTarget.style.color = '#0369a1'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      CATÁLOGO
                    </a>
                  )}
                  {referencia.urlRepositorio && (
                    <a
                      href={referencia.urlRepositorio}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        borderRadius: '6px',
                        border: '1px solid #dcfce7',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#16a34a'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0fdf4'
                        e.currentTarget.style.color = '#16a34a'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      REPOSITORIO AL
                    </a>
                  )}
                </div>
              </article>
            ))
          )
        )}
      </div>
    </>
  )
}
