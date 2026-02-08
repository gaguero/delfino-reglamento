'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader'
import RichTextEditor from '@/components/RichTextEditor'

interface TipoAnotacion {
  id: number
  nombre: string
  colorHex: string | null
}

interface TipoReferencia {
  id: number
  nombre: string
}

interface Referencia {
  id: string
  numero: string
  titulo: string | null
  tipoReferencia: TipoReferencia
  tipoReferenciaId: number
  urlPrincipal: string | null
  urlNexus: string | null
  urlCatalogo: string | null
  urlRepositorio: string | null
}

interface AnotacionRef {
  referencia: Referencia
}

interface Anotacion {
  id: string
  tipoAnotacionId: number
  tipoAnotacion: TipoAnotacion
  contenido: string
  orden: number
  esVisible: boolean
  createdBy: { fullName: string }
  updatedBy: { fullName: string } | null
  createdAt: string
  updatedAt: string
  referencias: AnotacionRef[]
}

interface Articulo {
  id: number
  numero: string
  nombre: string
  textoLegal: string
  anotaciones: Anotacion[]
}

interface ArticuloEditorProps {
  articulo: Articulo
  tiposAnotacion: TipoAnotacion[]
  referencias: Referencia[]
  tiposReferencia: TipoReferencia[]
}

export default function ArticuloEditor({ articulo, tiposAnotacion, referencias: allReferencias, tiposReferencia }: ArticuloEditorProps) {
  const [anotaciones, setAnotaciones] = useState<Anotacion[]>(articulo.anotaciones)
  const [referencias, setReferencias] = useState<Referencia[]>(allReferencias)
  const [showModal, setShowModal] = useState<'create' | 'edit' | 'delete' | 'ref-create' | null>(null)
  const [editingAnotacion, setEditingAnotacion] = useState<Anotacion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // State for new/edit anotacion
  const [formTipo, setFormTipo] = useState(tiposAnotacion[0]?.id || 1)
  const [formContenido, setFormContenido] = useState('')
  const [formOrden, setFormOrden] = useState(1)
  const [formVisible, setFormVisible] = useState(true)
  const [formRefIds, setFormRefIds] = useState<string[]>([])

  // State for new reference
  const [refTipoId, setRefTipoId] = useState(tiposReferencia[0]?.id || 1)
  const [refNumero, setRefNumero] = useState('')
  const [refTitulo, setRefTitulo] = useState('')
  const [refUrlPrincipal, setRefUrlPrincipal] = useState('')
  const [refUrlNexus, setRefUrlNexus] = useState('')
  const [refUrlCatalogo, setRefUrlCatalogo] = useState('')
  const [refUrlRepositorio, setRefUrlRepositorio] = useState('')

  const router = useRouter()

  useEffect(() => {
    // Update form orden when adding new anotacion
    if (showModal === 'create') {
      setFormOrden(anotaciones.length + 1)
    }
  }, [anotaciones.length, showModal])

  /** --- Anotacion Modal Handlers --- */
  function openCreate() {
    setEditingAnotacion(null)
    setFormTipo(tiposAnotacion[0]?.id || 1)
    setFormContenido('')
    setFormVisible(true)
    setFormRefIds([])
    setError('')
    setShowModal('create')
  }

  function openEdit(a: Anotacion) {
    setEditingAnotacion(a)
    setFormTipo(a.tipoAnotacionId)
    setFormContenido(a.contenido)
    setFormOrden(a.orden)
    setFormVisible(a.esVisible)
    setFormRefIds(a.referencias.map(r => r.referencia.id))
    setError('')
    setShowModal('edit')
  }

  function openDelete(a: Anotacion) {
    setEditingAnotacion(a)
    setError('')
    setShowModal('delete')
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    try {
      if (showModal === 'create') {
        const res = await fetch('/api/anotaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articuloId: articulo.id,
            tipoAnotacionId: formTipo,
            contenido: formContenido,
            orden: formOrden,
            esVisible: formVisible,
            referenciaIds: formRefIds,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ? JSON.stringify(data.error) : 'Error al crear anotación')
        }
        const newAnot = await res.json()
        setAnotaciones(prev => [...prev, newAnot].sort((a, b) => a.orden - b.orden))
      } else if (showModal === 'edit' && editingAnotacion) {
        const res = await fetch(`/api/anotaciones/${editingAnotacion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipoAnotacionId: formTipo,
            contenido: formContenido,
            orden: formOrden,
            esVisible: formVisible,
            referenciaIds: formRefIds,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ? JSON.stringify(data.error) : 'Error al actualizar anotación')
        }
        const updated = await res.json()
        setAnotaciones(prev =>
          prev.map(a => (a.id === updated.id ? updated : a)).sort((a, b) => a.orden - b.orden)
        )
      }
      setShowModal(null)
    } catch (e: any) {
      setError(e.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!editingAnotacion) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/anotaciones/${editingAnotacion.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar anotación')
      }
      setAnotaciones(prev => prev.filter(a => a.id !== editingAnotacion.id))
      setShowModal(null)
    } catch (e: any) {
      setError(e.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  /** --- Reference Modal Handlers --- */
  async function handleCreateRef() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/referencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoReferenciaId: refTipoId,
          numero: refNumero,
          titulo: refTitulo || undefined,
          urlPrincipal: refUrlPrincipal || undefined,
          urlNexus: refUrlNexus || undefined,
          urlCatalogo: refUrlCatalogo || undefined,
          urlRepositorio: refUrlRepositorio || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ? JSON.stringify(data.error) : 'Error al crear referencia')
      }
      const newRef = await res.json()
      setReferencias(prev => [...prev, newRef])
      setFormRefIds(prev => [...prev, newRef.id])
      setShowModal(showModal === 'create' ? 'create' : 'edit') // Return to current anotacion modal
    } catch (e: any) {
      setError(e.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  function toggleRef(refId: string) {
    setFormRefIds(prev =>
      prev.includes(refId) ? prev.filter(id => id !== refId) : [...prev, refId]
    )
  }

  return (
    <>
      <AdminPageHeader title={`Editar Artículo ${articulo.numero}`} subtitle={articulo.nombre} />

      <div className="admin-page-content">
        <Link href="/admin/dashboard" className="btn btn-ghost btn-sm mb-4">
          ← Volver al Dashboard
        </Link>

        {/* Legal Text (read-only) */}
        <div className="admin-card mb-8">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Texto Legal Original</h3>
          </div>
          <div className="admin-card-body">
            <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap shadow-inner">
              {articulo.textoLegal}
            </div>
          </div>
        </div>

        {/* Annotations List */}
        <div className="admin-card mb-8">
          <div className="flex justify-between items-center p-6 admin-card-header border-b-0">
            <h3 className="admin-card-title">Anotaciones ({anotaciones.length})</h3>
            <button
              onClick={openCreate}
              className="btn btn-primary btn-sm"
            >
              + Nueva Anotación
            </button>
          </div>

          {anotaciones.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay anotaciones. ¡Agregue la primera!</p>
          ) : (
            <div className="admin-card-body">
              <div className="space-y-4">
                {anotaciones.map((anotacion) => (
                  <div key={anotacion.id} className={cn('border rounded-lg p-4 hover:bg-gray-50', `border-l-4 ${anotacion.tipoAnotacion.colorHex ? '' : 'border-primary-600'}`)} style={{ borderLeftColor: anotacion.tipoAnotacion.colorHex || 'var(--delfino-primary)' }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="badge"
                            style={{
                              backgroundColor: (anotacion.tipoAnotacion.colorHex || '#3B82F6') + '20', // Custom color with alpha
                              color: anotacion.tipoAnotacion.colorHex || '#3B82F6',
                            }}
                          >
                            {anotacion.tipoAnotacion.nombre}
                          </span>
                          <span className="text-xs text-gray-500">Orden: {anotacion.orden}</span>
                          {!anotacion.esVisible && (
                            <span className="badge badge-error">Oculta</span>
                          )}
                        </div>
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: anotacion.contenido }} />
                        {anotacion.referencias.length > 0 && (
                          <div className="mt-3 text-xs text-gray-600">
                            <span className="font-medium">Referencias: </span>
                            {anotacion.referencias.map(({ referencia }, i) => (
                              <span key={referencia.id}>
                                {i > 0 && ', '}
                                {referencia.tipoReferencia.nombre} {referencia.numero}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          Por {anotacion.createdBy.fullName} el{' '}
                          {new Date(anotacion.createdAt).toLocaleDateString('es-CR')}
                          {anotacion.updatedBy && (
                            <> | Editado por {anotacion.updatedBy.fullName}</>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEdit(anotacion)}
                          className="btn btn-ghost btn-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDelete(anotacion)}
                          className="btn btn-danger btn-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {(showModal === 'create' || showModal === 'edit' || showModal === 'delete' || showModal === 'ref-create') && (
        <div className="modal-backdrop">
          <div className={cn('modal', showModal === 'ref-create' && 'modal-lg')}>
            {showModal === 'delete' && editingAnotacion && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">Confirmar Eliminación</h3>
                  <button onClick={() => setShowModal(null)} className="modal-close">&times;</button>
                </div>
                <div className="modal-body">
                  <p className="text-gray-600 mb-4">¿Seguro que deseas eliminar esta anotación?</p>
                  <div className="bg-gray-50 p-4 rounded text-sm border" dangerouslySetInnerHTML={{ __html: editingAnotacion.contenido }} />
                  {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowModal(null)} className="btn btn-secondary">Cancelar</button>
                  <button onClick={handleDelete} disabled={loading} className="btn btn-danger">{loading ? 'Eliminando...' : 'Eliminar'}</button>
                </div>
              </>
            )}

            {(showModal === 'create' || showModal === 'edit') && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">{showModal === 'create' ? 'Nueva Anotación' : 'Editar Anotación'}</h3>
                  <button onClick={() => setShowModal(null)} className="modal-close">&times;</button>
                </div>
                <div className="modal-body">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Tipo</label>
                        <select value={formTipo} onChange={(e) => setFormTipo(Number(e.target.value))} className="form-select">
                          {tiposAnotacion.map((t) => (<option key={t.id} value={t.id}>{t.nombre}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Orden</label>
                        <input type="number" value={formOrden} onChange={(e) => setFormOrden(Number(e.target.value))} min={1} className="form-input" />
                      </div>
                      <div className="flex items-center mt-8"> {/* Aligns checkbox with the other inputs */}
                        <label className="form-checkbox">
                          <input type="checkbox" checked={formVisible} onChange={(e) => setFormVisible(e.target.checked)} />
                          Visible al público
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Contenido</label>
                      <RichTextEditor content={formContenido} onChange={setFormContenido} />
                    </div>

                    {/* References Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="form-label">Referencias ({formRefIds.length} seleccionadas)</label>
                        <button type="button" onClick={() => setShowModal('ref-create')} className="btn btn-ghost btn-sm">
                          + Crear Referencia
                        </button>
                      </div>
                      <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                        {referencias.length === 0 ? (
                          <p className="text-center text-gray-400 text-sm py-2">Crea referencias primero para poder asignarlas.</p>
                        ) : (
                          referencias.map((ref) => (
                            <label key={ref.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded cursor-pointer">
                              <input type="checkbox" checked={formRefIds.includes(ref.id)} onChange={() => toggleRef(ref.id)} className="form-checkbox input" />
                              <span className="font-medium">{ref.tipoReferencia.nombre} {ref.numero}</span>
                              {ref.titulo && <span className="text-gray-500 truncate">- {ref.titulo}</span>}
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {error && <p className="alert alert-error">{error}</p>}

                  <div className="modal-footer">
                    <button onClick={() => setShowModal(null)} className="btn btn-secondary">Cancelar</button>
                    <button onClick={handleSave} disabled={loading || !formContenido} className="btn btn-primary">{loading ? 'Guardando...' : 'Guardar'}</button>
                  </div>
                </div>
              </>
            )}

            {showModal === 'ref-create' && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">Nueva Referencia</h3>
                  <button onClick={() => setShowModal(showModal === 'create' ? 'create' : 'edit')} className="modal-close">&times;</button>
                </div>
                <div className="modal-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Tipo</label>
                      <select value={refTipoId} onChange={(e) => setRefTipoId(Number(e.target.value))} className="form-select">
                        {tiposReferencia.map((t) => (<option key={t.id} value={t.id}>{t.nombre}</option>))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Número</label>
                      <input value={refNumero} onChange={(e) => setRefNumero(e.target.value)} className="form-input" placeholder="Ej: 2019-007382" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Título (opcional)</label>
                    <input value={refTitulo} onChange={(e) => setRefTitulo(e.target.value)} className="form-input" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">URL Principal</label>
                      <input value={refUrlPrincipal} onChange={(e) => setRefUrlPrincipal(e.target.value)} className="form-input" placeholder="https://..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">URL Nexus PJ</label>
                      <input value={refUrlNexus} onChange={(e) => setRefUrlNexus(e.target.value)} className="form-input" placeholder="https://nexuspj.poder-judicial.go.cr/..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">URL Catálogo</label>
                      <input value={refUrlCatalogo} onChange={(e) => setRefUrlCatalogo(e.target.value)} className="form-input" placeholder="https://..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">URL Repositorio AL</label>
                      <input value={refUrlRepositorio} onChange={(e) => setRefUrlRepositorio(e.target.value)} className="form-input" placeholder="https://..." />
                    </div>
                  </div>

                  {error && <p className="alert alert-error">{error}</p>}

                  <div className="modal-footer">
                    <button onClick={() => setShowModal(showModal === 'create' ? 'create' : 'edit')} className="btn btn-secondary">Volver</button>
                    <button onClick={handleCreateRef} disabled={loading || !refNumero} className="btn btn-primary">{loading ? 'Creando...' : 'Crear Referencia'}</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
