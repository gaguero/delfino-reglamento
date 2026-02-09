'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Acta {
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
  id: string
  numero: string
  nombre: string
}

interface ActasManagerProps {
  actas: Acta[]
  articulos: Articulo[]
  tipoActaId: number
}

export default function ActasManager({ actas: initialActas, articulos, tipoActaId }: ActasManagerProps) {
  const [actas, setActas] = useState(initialActas)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // Form state
  const [numero, setNumero] = useState('')
  const [tipo, setTipo] = useState('Plenario')
  const [fecha, setFecha] = useState('')
  const [resumen, setResumen] = useState('')
  const [urlAsamblea, setUrlAsamblea] = useState('')
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
      alert('El número de acta es requerido')
      return
    }

    setLoading(true)
    try {
      // Create the referencia
      const res = await fetch('/api/referencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoReferenciaId: tipoActaId,
          numero: `${tipo} - ${numero}`,
          titulo: resumen || null,
          urlPrincipal: urlAsamblea || null,
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al crear el acta')
      }

      const newActa = await res.json()

      // Link to articles
      if (articulosSeleccionados.length > 0) {
        await fetch(`/api/referencias/${newActa.id}/link-articles-contexto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articuloNumeros: articulosSeleccionados })
        })
      }

      // Reset form
      setNumero('')
      setTipo('Plenario')
      setFecha('')
      setResumen('')
      setUrlAsamblea('')
      setArticulosSeleccionados([])

      alert('Acta creada exitosamente')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al crear el acta')
    } finally {
      setLoading(false)
    }
  }

  const filteredActas = actas.filter(a =>
    a.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar actas por número o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '500px' }}
        />
      </div>

      {/* Add New Acta Form */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">Agregar Nueva Acta</h3>
        </div>
        <div className="admin-card-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label className="form-label">Tipo *</label>
                <select
                  className="form-select"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  required
                >
                  <option value="Plenario">Plenario</option>
                  <option value="Comisión Permanente">Comisión Permanente</option>
                  <option value="Comisión Especial">Comisión Especial</option>
                </select>
              </div>

              <div>
                <label className="form-label">Número de Sesión *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ej. No. 45"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                />
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
                placeholder="Breve descripción del contenido del acta..."
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label className="form-label">URL Asamblea Legislativa</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://www.asamblea.go.cr/..."
                value={urlAsamblea}
                onChange={(e) => setUrlAsamblea(e.target.value)}
              />
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
                {loading ? 'Guardando...' : 'Guardar Acta'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Actas List */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Actas Registradas ({filteredActas.length})</h3>
        </div>
        <div className="admin-card-body">
          {filteredActas.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--delfino-text-muted)', padding: '2rem' }}>
              {searchTerm ? 'No se encontraron actas con ese criterio.' : 'No hay actas registradas.'}
            </p>
          ) : (
            <div className="admin-list">
              {filteredActas.map((acta) => {
                const articulosUnicos = Array.from(new Set(acta.anotaciones.map(a => a.anotacion.articulo.numero)))

                return (
                  <div key={acta.id} className="admin-list-item">
                    <div className="admin-list-header">
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--delfino-primary)' }}>
                          {acta.numero}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--delfino-text-secondary)' }}>
                        {articulosUnicos.length} artículos
                      </div>
                    </div>

                    {acta.titulo && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--delfino-text-secondary)', margin: '0.5rem 0' }}>
                        {acta.titulo.substring(0, 200)}{acta.titulo.length > 200 ? '...' : ''}
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

                    {acta.urlPrincipal && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <a href={acta.urlPrincipal} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                          Ver Acta →
                        </a>
                      </div>
                    )}
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
