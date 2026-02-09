'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Voto {
  id: string
  numero: string
  titulo: string | null
  urlPrincipal: string | null
  urlNexus: string | null
  urlCatalogo: string | null
  urlRepositorio: string | null
  tipoReferencia: { nombre: string }
  anotaciones: Array<{
    anotacion: {
      articulo: { numero: string; nombre: string }
    }
  }>
}

interface Articulo {
  id: number
  numero: string
  nombre: string
}

interface VotosManagerProps {
  votos: Voto[]
  articulos: Articulo[]
  tipoVotoId: number
}

export default function VotosManager({ votos: initialVotos, articulos, tipoVotoId }: VotosManagerProps) {
  const [votos, setVotos] = useState(initialVotos)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // Form state
  const [numero, setNumero] = useState('')
  const [fecha, setFecha] = useState('')
  const [resumen, setResumen] = useState('')
  const [urlSCIJ, setUrlSCIJ] = useState('')
  const [urlNexus, setUrlNexus] = useState('')
  const [urlCatalogo, setUrlCatalogo] = useState('')
  const [urlRepositorio, setUrlRepositorio] = useState('')
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<string[]>([])
  const [articuloInput, setArticuloInput] = useState('')

  const agregarArticulo = (numeroArticulo: string) => {
    const trimmed = numeroArticulo.trim()
    if (trimmed && !articulosSeleccionados.includes(trimmed)) {
      setArticulosSeleccionados([...articulosSeleccionados, trimmed])
      setArticuloInput('')
    }
  }

  const removerArticulo = (numeroArticulo: string) => {
    setArticulosSeleccionados(articulosSeleccionados.filter(a => a !== numeroArticulo))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numero) {
      alert('El número de voto es requerido')
      return
    }

    setLoading(true)
    try {
      // Create the referencia
      const res = await fetch('/api/referencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoReferenciaId: tipoVotoId,
          numero,
          titulo: resumen || null,
          urlPrincipal: urlSCIJ || null,
          urlNexus: urlNexus || null,
          urlCatalogo: urlCatalogo || null,
          urlRepositorio: urlRepositorio || null,
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al crear el voto')
      }

      const newVoto = await res.json()

      // Link to articles
      if (articulosSeleccionados.length > 0) {
        await fetch(`/api/referencias/${newVoto.id}/link-articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articuloNumeros: articulosSeleccionados })
        })
      }

      // Reset form
      setNumero('')
      setFecha('')
      setResumen('')
      setUrlSCIJ('')
      setUrlNexus('')
      setUrlCatalogo('')
      setUrlRepositorio('')
      setArticulosSeleccionados([])

      alert('Voto creado exitosamente')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al crear el voto')
    } finally {
      setLoading(false)
    }
  }

  const filteredVotos = votos.filter(v =>
    v.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar votos por número o resumen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '500px' }}
        />
      </div>

      {/* Add New Voto Form */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">Agregar Nuevo Voto</h3>
        </div>
        <div className="admin-card-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label className="form-label">Número de Voto *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ej. 2003-02771"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                />
                <small style={{ fontSize: '0.75rem', color: 'var(--delfino-text-muted)' }}>
                  Formato: AAAA-NNNNN
                </small>
              </div>

              <div>
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-input"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label className="form-label">Resumen</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Breve descripción del contenido del voto..."
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label className="form-label">URL SCIJ</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://www.pgrweb.go.cr/scij/..."
                  value={urlSCIJ}
                  onChange={(e) => setUrlSCIJ(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">URL Nexus PJ</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://nexuspj.poder-judicial.go.cr/..."
                  value={urlNexus}
                  onChange={(e) => setUrlNexus(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">URL Catálogo</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={urlCatalogo}
                  onChange={(e) => setUrlCatalogo(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">URL Repositorio</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={urlRepositorio}
                  onChange={(e) => setUrlRepositorio(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label className="form-label">Artículos Relacionados</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Número de artículo (ej. 7 bis, 41)"
                  value={articuloInput}
                  onChange={(e) => setArticuloInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      agregarArticulo(articuloInput)
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => agregarArticulo(articuloInput)}
                >
                  Agregar
                </button>
              </div>
              {articulosSeleccionados.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {articulosSeleccionados.map((art) => (
                    <span key={art} className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      Art. {art}
                      <button
                        type="button"
                        onClick={() => removerArticulo(art)}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0', marginLeft: '0.25rem' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Voto'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Votos List */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Votos Registrados ({filteredVotos.length})</h3>
        </div>
        <div className="admin-card-body">
          {filteredVotos.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--delfino-text-muted)', padding: '2rem' }}>
              {searchTerm ? 'No se encontraron votos con ese criterio.' : 'No hay votos registrados.'}
            </p>
          ) : (
            <div className="admin-list">
              {filteredVotos.map((voto) => {
                const urlCount = [voto.urlPrincipal, voto.urlNexus, voto.urlCatalogo, voto.urlRepositorio].filter(Boolean).length
                const articulosUnicos = Array.from(new Set(voto.anotaciones.map(a => a.anotacion.articulo.numero)))

                return (
                  <div key={voto.id} className="admin-list-item">
                    <div className="admin-list-header">
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--delfino-primary)' }}>
                          Voto {voto.numero}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--delfino-text-secondary)' }}>
                        {urlCount}/4 URLs • {articulosUnicos.length} artículos
                      </div>
                    </div>

                    {voto.titulo && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--delfino-text-secondary)', margin: '0.5rem 0' }}>
                        {voto.titulo.substring(0, 200)}{voto.titulo.length > 200 ? '...' : ''}
                      </p>
                    )}

                    {articulosUnicos.length > 0 && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {articulosUnicos.map((numero) => (
                          <span key={numero} className="badge badge-neutral">
                            Art. {numero}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {voto.urlPrincipal && (
                        <a href={voto.urlPrincipal} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                          SCIJ →
                        </a>
                      )}
                      {voto.urlNexus && (
                        <a href={voto.urlNexus} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                          Nexus PJ →
                        </a>
                      )}
                      {voto.urlCatalogo && (
                        <a href={voto.urlCatalogo} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                          Catálogo →
                        </a>
                      )}
                      {voto.urlRepositorio && (
                        <a href={voto.urlRepositorio} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                          Repositorio →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
