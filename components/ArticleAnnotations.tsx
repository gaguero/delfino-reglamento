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

  // Get all unique references from annotations
  const allReferencias = anotaciones.flatMap((anotacion) => 
    anotacion.referencias.map((ref) => ref.referencia)
  )
  
  // Remove duplicates by id
  const uniqueReferencias = allReferencias.filter((ref, index, self) => 
    index === self.findIndex((r) => r.id === ref.id)
  )

  const getTipoBadgeClass = (tipoNombre: string): string => {
    const tipoSlug = tipoNombre.toLowerCase()
    if (tipoSlug.includes('jurisprudencia')) return 'annotation-badge--jurisprudencia'
    if (tipoSlug.includes('contexto')) return 'annotation-badge--contexto'
    if (tipoSlug.includes('nota')) return 'annotation-badge--nota'
    return 'annotation-badge--nota'
  }

  return (
    <aside className="annotations-panel" aria-label="Anotaciones y referencias">
      <h2 className="sidebar-title">Contenido Adicional</h2>
      
      <div className="annotations-tabs">
        <button
          className={`annotations-tab ${activeTab === 'anotaciones' ? 'annotations-tab--active' : ''}`}
          onClick={() => setActiveTab('anotaciones')}
        >
          Anotaciones ({anotaciones.length})
        </button>
        <button
          className={`annotations-tab ${activeTab === 'referencias' ? 'annotations-tab--active' : ''}`}
          onClick={() => setActiveTab('referencias')}
        >
          Referencias ({uniqueReferencias.length})
        </button>
      </div>

      {activeTab === 'anotaciones' ? (
        <div className="annotations-list">
          {anotaciones.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📝</div>
              No hay anotaciones para este artículo
            </div>
          ) : (
            anotaciones.map((anotacion) => (
              <article key={anotacion.id} className="annotation-card">
                <span className={`annotation-badge ${getTipoBadgeClass(anotacion.tipoAnotacion.nombre)}`}>
                  {anotacion.tipoAnotacion.nombre}
                </span>
                
                <div 
                  className="annotation-content"
                  dangerouslySetInnerHTML={{ __html: anotacion.contenido }}
                />
                
                {anotacion.referencias.length > 0 && (
                  <div className="annotation-refs">
                    <h4 className="annotation-refs__title">Referencias vinculadas</h4>
                    {anotacion.referencias.map(({ referencia }) => (
                      <div key={referencia.id} className="ref-item">
                        <span className="ref-item__numero">
                          {referencia.tipoReferencia.nombre} {referencia.numero}
                        </span>
                        {referencia.titulo && (
                          <span className="ref-item__titulo">{referencia.titulo}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <footer className="annotation-meta">
                  Por {anotacion.createdBy.fullName} • {' '}
                  {new Date(anotacion.createdAt).toLocaleDateString('es-CR')}
                </footer>
              </article>
            ))
          )}
        </div>
      ) : (
        <div className="references-list">
          {uniqueReferencias.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📚</div>
              No hay referencias para este artículo
            </div>
          ) : (
            uniqueReferencias.map((referencia) => (
              <article key={referencia.id} className="annotation-card">
                <span className="annotation-badge annotation-badge--jurisprudencia">
                  {referencia.tipoReferencia.nombre}
                </span>
                
                <div className="ref-item" style={{ background: 'none', padding: 0, margin: 0 }}>
                  <span className="ref-item__numero" style={{ fontSize: '1rem' }}>
                    {referencia.numero}
                  </span>
                  {referencia.titulo && (
                    <span className="ref-item__titulo">{referencia.titulo}</span>
                  )}
                </div>
                
                <div className="ref-item__links" style={{ marginTop: '0.75rem' }}>
                  {referencia.urlNexus && (
                    <a 
                      href={referencia.urlNexus} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ref-item__link"
                    >
                      Nexus PJ →
                    </a>
                  )}
                  {referencia.urlCatalogo && (
                    <a 
                      href={referencia.urlCatalogo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ref-item__link"
                    >
                      Catálogo →
                    </a>
                  )}
                  {referencia.urlRepositorio && (
                    <a 
                      href={referencia.urlRepositorio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ref-item__link"
                    >
                      Repositorio AL →
                    </a>
                  )}
                  {referencia.urlPrincipal && 
                    !referencia.urlNexus && 
                    !referencia.urlCatalogo && 
                    !referencia.urlRepositorio && (
                    <a 
                      href={referencia.urlPrincipal} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ref-item__link"
                    >
                      Ver documento →
                    </a>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </aside>
  )
}
