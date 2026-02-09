'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Anotacion {
  id: string
  contenido: string
  orden: number
  fuenteIA: boolean
  esAprobada: boolean
  fechaAprobacion: string | null
  articulo: { numero: string; nombre: string }
  tipoAnotacion: { nombre: string; colorHex: string | null }
  createdBy: { fullName: string }
  aprobadoPor?: { fullName: string } | null
  referencias: Array<{
    referencia: {
      id: string
      numero: string
      titulo: string | null
      urlPrincipal: string | null
      urlNexus: string | null
      urlCatalogo: string | null
      urlRepositorio: string | null
      tipoReferencia: { nombre: string }
    }
  }>
}

interface ReviewQueueProps {
  pendientes: Anotacion[]
  aprobadas: Anotacion[]
}

export default function ReviewQueue({ pendientes: initialPendientes, aprobadas: initialAprobadas }: ReviewQueueProps) {
  const [pendientes, setPendientes] = useState(initialPendientes)
  const [aprobadas, setAprobadas] = useState(initialAprobadas)
  const [activeTab, setActiveTab] = useState<'pendientes' | 'aprobadas'>('pendientes')
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const aprobarAnnotacion = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/anotaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ esAprobada: true })
      })
      if (!res.ok) throw new Error('Error al aprobar')

      // Remove from pendientes
      setPendientes(prev => prev.filter(a => a.id !== id))
      router.refresh()
    } catch (error) {
      alert('Error al aprobar la anotación')
    } finally {
      setLoading(null)
    }
  }

  const rechazarAnnotacion = async (id: string) => {
    if (!confirm('¿Está seguro de rechazar esta anotación? Se ocultará del sitio.')) return

    setLoading(id)
    try {
      const res = await fetch(`/api/anotaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ esVisible: false })
      })
      if (!res.ok) throw new Error('Error al rechazar')

      // Remove from pendientes
      setPendientes(prev => prev.filter(a => a.id !== id))
      router.refresh()
    } catch (error) {
      alert('Error al rechazar la anotación')
    } finally {
      setLoading(null)
    }
  }

  const aprobarTodas = async () => {
    if (!confirm(`¿Está seguro de aprobar todas las ${pendientes.length} anotaciones pendientes?`)) return

    setLoading('bulk')
    try {
      const ids = pendientes.map(a => a.id)
      const res = await fetch('/api/anotaciones/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      if (!res.ok) throw new Error('Error al aprobar en lote')

      const data = await res.json()
      alert(`${data.approved} anotaciones aprobadas exitosamente`)
      setPendientes([])
      router.refresh()
    } catch (error) {
      alert('Error al aprobar en lote')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="review-queue">
      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'pendientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('pendientes')}
        >
          Pendientes ({pendientes.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'aprobadas' ? 'active' : ''}`}
          onClick={() => setActiveTab('aprobadas')}
        >
          Aprobadas Recientemente ({aprobadas.length})
        </button>
      </div>

      {/* Pendientes Tab */}
      {activeTab === 'pendientes' && (
        <div>
          {pendientes.length > 0 && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="alert alert-info" style={{ marginBottom: 0 }}>
                <strong>{pendientes.length}</strong> anotaciones generadas por IA pendientes de revisión
              </div>
              <button
                className="btn btn-success"
                onClick={aprobarTodas}
                disabled={loading === 'bulk'}
              >
                {loading === 'bulk' ? 'Aprobando...' : 'Aprobar Todas'}
              </button>
            </div>
          )}

          {pendientes.length === 0 ? (
            <div className="alert alert-success">
              ¡No hay anotaciones pendientes de revisión! 🎉
            </div>
          ) : (
            <div className="admin-list">
              {pendientes.map((anotacion) => (
                <div key={anotacion.id} className="admin-list-item">
                  <div className="admin-list-header">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        IA
                      </span>
                      <span className="badge badge-warning">Pendiente</span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: anotacion.tipoAnotacion.colorHex || '#6b7280',
                          color: 'white'
                        }}
                      >
                        {anotacion.tipoAnotacion.nombre}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--delfino-text-secondary)' }}>
                      Artículo {anotacion.articulo.numero}
                    </div>
                  </div>

                  <h4 style={{ margin: '0.5rem 0', fontSize: '1rem', color: 'var(--delfino-text-primary)' }}>
                    {anotacion.articulo.nombre}
                  </h4>

                  <div
                    className="annotation-content"
                    dangerouslySetInnerHTML={{ __html: anotacion.contenido }}
                    style={{
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: 'var(--delfino-background-alt)',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}
                  />

                  {anotacion.referencias.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                        Referencias:
                      </strong>
                      {anotacion.referencias.map((ref, idx) => (
                        <div key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                          <span className="badge badge-neutral">{ref.referencia.tipoReferencia.nombre}</span>
                          {' '}
                          <strong>{ref.referencia.numero}</strong>
                          {ref.referencia.titulo && <span> - {ref.referencia.titulo.substring(0, 100)}...</span>}
                          <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {ref.referencia.urlPrincipal && (
                              <a href={ref.referencia.urlPrincipal} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                                SCIJ →
                              </a>
                            )}
                            {ref.referencia.urlNexus && (
                              <a href={ref.referencia.urlNexus} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                                Nexus PJ →
                              </a>
                            )}
                            {ref.referencia.urlCatalogo && (
                              <a href={ref.referencia.urlCatalogo} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                                Catálogo →
                              </a>
                            )}
                            {ref.referencia.urlRepositorio && (
                              <a href={ref.referencia.urlRepositorio} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                                Repositorio →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => aprobarAnnotacion(anotacion.id)}
                      disabled={loading === anotacion.id}
                    >
                      {loading === anotacion.id ? 'Aprobando...' : '✓ Aprobar'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => rechazarAnnotacion(anotacion.id)}
                      disabled={loading === anotacion.id}
                    >
                      ✗ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aprobadas Tab */}
      {activeTab === 'aprobadas' && (
        <div>
          {aprobadas.length === 0 ? (
            <div className="alert alert-info">
              No hay anotaciones aprobadas recientemente.
            </div>
          ) : (
            <div className="admin-list">
              {aprobadas.map((anotacion) => (
                <div key={anotacion.id} className="admin-list-item">
                  <div className="admin-list-header">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        IA
                      </span>
                      <span className="badge badge-success">Aprobada</span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: anotacion.tipoAnotacion.colorHex || '#6b7280',
                          color: 'white'
                        }}
                      >
                        {anotacion.tipoAnotacion.nombre}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--delfino-text-secondary)' }}>
                      Artículo {anotacion.articulo.numero}
                    </div>
                  </div>

                  <h4 style={{ margin: '0.5rem 0', fontSize: '1rem', color: 'var(--delfino-text-primary)' }}>
                    {anotacion.articulo.nombre}
                  </h4>

                  <div
                    className="annotation-content"
                    dangerouslySetInnerHTML={{ __html: anotacion.contenido }}
                    style={{
                      marginBottom: '0.5rem',
                      padding: '1rem',
                      backgroundColor: 'var(--delfino-background-alt)',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}
                  />

                  <div style={{ fontSize: '0.75rem', color: 'var(--delfino-text-muted)' }}>
                    Aprobada por {anotacion.aprobadoPor?.fullName || 'Sistema'} el {anotacion.fechaAprobacion ? new Date(anotacion.fechaAprobacion).toLocaleDateString('es-CR') : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .admin-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid var(--delfino-border);
        }
        .admin-tab {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: var(--delfino-text-secondary);
          transition: all 0.2s;
          margin-bottom: -2px;
        }
        .admin-tab:hover {
          color: var(--delfino-primary);
          background-color: var(--delfino-background-alt);
        }
        .admin-tab.active {
          color: var(--delfino-primary);
          border-bottom-color: var(--delfino-primary);
        }
      `}</style>
    </div>
  )
}
