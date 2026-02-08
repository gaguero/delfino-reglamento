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
                <span className={`d-annotation__badge ${getTipoBadgeClass(anotacion.tipoAnotacion.nombre)}`}>
                  {anotacion.tipoAnotacion.nombre}
                </span>
                
                <div 
                  className="d-annotation__content"
                  dangerouslySetInnerHTML={{ __html: anotacion.contenido }}
                />
                
                {anotacion.referencias.length > 0 && (
                  <div className="d-ref-links">
                    <div className="d-ref-links__title">Referencias vinculadas</div>
                    {anotacion.referencias.map(({ referencia }) => (
                      <div key={referencia.id} style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {referencia.tipoReferencia.nombre} {referencia.numero}
                        </div>
                        {referencia.titulo && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--d-gray-500)' }}>
                            {referencia.titulo}
                          </div>
                        )}
                      </div>
                    ))}
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
                <span className="d-annotation__badge d-annotation__badge--jurisprudencia">
                  {referencia.tipoReferencia.nombre}
                </span>
                
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>
                  {referencia.numero}
                </div>
                
                {referencia.titulo && (
                  <div style={{ fontSize: '0.9375rem', color: 'var(--d-gray-600)', marginBottom: '12px' }}>
                    {referencia.titulo}
                  </div>
                )}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {referencia.urlNexus && (
                    <a href={referencia.urlNexus} target="_blank" rel="noopener noreferrer" className="d-ref-link">
                      Nexus PJ →
                    </a>
                  )}
                  {referencia.urlCatalogo && (
                    <a href={referencia.urlCatalogo} target="_blank" rel="noopener noreferrer" className="d-ref-link">
                      Catálogo →
                    </a>
                  )}
                  {referencia.urlRepositorio && (
                    <a href={referencia.urlRepositorio} target="_blank" rel="noopener noreferrer" className="d-ref-link">
                      Repositorio AL →
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
