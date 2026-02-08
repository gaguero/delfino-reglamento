'use client'

import { useState } from 'react'
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
  anotaciones: Anotacion[]
}

interface Props {
  articulo: Articulo
  tiposAnotacion: TipoAnotacion[]
  referencias: Referencia[]
  tiposReferencia: TipoReferencia[]
}

export default function ArticuloEditor({ articulo, tiposAnotacion, referencias: allReferencias, tiposReferencia }: Props) {
  const [anotaciones, setAnotaciones] = useState<Anotacion[]>(articulo.anotaciones)
  const [referencias, setReferencias] = useState<Referencia[]>(allReferencias)
  const [showModal, setShowModal] = useState<'create' | 'edit' | 'delete' | 'ref-create' | null>(null)
  const [editingAnotacion, setEditingAnotacion] = useState<Anotacion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formTipo, setFormTipo] = useState(tiposAnotacion[0]?.id || 1)
  const [formContenido, setFormContenido] = useState('')
  const [formOrden, setFormOrden] = useState(1)
  const [formVisible, setFormVisible] = useState(true)
  const [formRefIds, setFormRefIds] = useState<string[]>([])

  // New reference form state
  const [refTipoId, setRefTipoId] = useState(tiposReferencia[0]?.id || 1)
  const [refNumero, setRefNumero] = useState('')
  const [refTitulo, setRefTitulo] = useState('')
  const [refUrlPrincipal, setRefUrlPrincipal] = useState('')
  const [refUrlNexus, setRefUrlNexus] = useState('')
  const [refUrlCatalogo, setRefUrlCatalogo] = useState('')
  const [refUrlRepositorio, setRefUrlRepositorio] = useState('')

  function openCreate() {
    setEditingAnotacion(null)
    setFormTipo(tiposAnotacion[0]?.id || 1)
    setFormContenido('')
    setFormOrden(anotaciones.length + 1)
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
          throw new Error(data.error ? JSON.stringify(data.error) : 'Error al crear')
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
          throw new Error(data.error ? JSON.stringify(data.error) : 'Error al actualizar')
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
    try {
      const res = await fetch(`/api/anotaciones/${editingAnotacion.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      setAnotaciones(prev => prev.filter(a => a.id !== editingAnotacion.id))
      setShowModal(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

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
      setShowModal(editingAnotacion ? 'edit' : 'create')
      setRefNumero('')
      setRefTitulo('')
      setRefUrlPrincipal('')
      setRefUrlNexus('')
      setRefUrlCatalogo('')
      setRefUrlRepositorio('')
    } catch (e: any) {
      setError(e.message)
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
      {/* Annotations List */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Anotaciones ({anotaciones.length})
          </h3>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Nueva Anotación
          </button>
        </div>

        {anotaciones.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay anotaciones. Agregue la primera anotación.
          </p>
        ) : (
          <div className="space-y-4">
            {anotaciones.map((anotacion) => (
              <div key={anotacion.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: (anotacion.tipoAnotacion.colorHex || '#3B82F6') + '20',
                          color: anotacion.tipoAnotacion.colorHex || '#3B82F6',
                        }}
                      >
                        {anotacion.tipoAnotacion.nombre}
                      </span>
                      <span className="text-xs text-gray-500">Orden: {anotacion.orden}</span>
                      {!anotacion.esVisible && (
                        <span className="text-xs text-red-500 font-medium">Oculta</span>
                      )}
                    </div>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: anotacion.contenido }}
                    />
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
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => openDelete(anotacion)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Backdrop */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !loading && setShowModal(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
              {/* Delete Confirmation */}
              {showModal === 'delete' && editingAnotacion && (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Eliminar Anotación</h3>
                  <p className="text-gray-600 mb-2">
                    ¿Está seguro de que desea eliminar esta anotación de tipo{' '}
                    <strong>{editingAnotacion.tipoAnotacion.nombre}</strong>?
                  </p>
                  <div className="prose prose-sm max-w-none bg-gray-50 p-3 rounded mb-4" dangerouslySetInnerHTML={{ __html: editingAnotacion.contenido }} />
                  {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(null)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                      disabled={loading}
                    >
                      {loading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </>
              )}

              {/* Create/Edit Form */}
              {(showModal === 'create' || showModal === 'edit') && (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {showModal === 'create' ? 'Nueva Anotación' : 'Editar Anotación'}
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                          value={formTipo}
                          onChange={(e) => setFormTipo(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          {tiposAnotacion.map((t) => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                        <input
                          type="number"
                          value={formOrden}
                          onChange={(e) => setFormOrden(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          min={1}
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formVisible}
                            onChange={(e) => setFormVisible(e.target.checked)}
                            className="rounded"
                          />
                          Visible al público
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                      <RichTextEditor content={formContenido} onChange={setFormContenido} />
                    </div>

                    {/* References */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Referencias ({formRefIds.length} seleccionadas)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowModal('ref-create')}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          + Crear nueva referencia
                        </button>
                      </div>
                      <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                        {referencias.map((ref) => (
                          <label key={ref.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formRefIds.includes(ref.id)}
                              onChange={() => toggleRef(ref.id)}
                              className="rounded"
                            />
                            <span className="font-medium">{ref.tipoReferencia.nombre} {ref.numero}</span>
                            {ref.titulo && <span className="text-gray-500 truncate">- {ref.titulo}</span>}
                          </label>
                        ))}
                        {referencias.length === 0 && (
                          <p className="text-gray-400 text-sm text-center py-2">No hay referencias disponibles</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowModal(null)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      disabled={loading || !formContenido}
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </>
              )}

              {/* Create Reference Modal */}
              {showModal === 'ref-create' && (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Referencia</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                          value={refTipoId}
                          onChange={(e) => setRefTipoId(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          {tiposReferencia.map((t) => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                        <input
                          value={refNumero}
                          onChange={(e) => setRefNumero(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Ej: 2019-007382"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título (opcional)</label>
                      <input
                        value={refTitulo}
                        onChange={(e) => setRefTitulo(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Principal</label>
                        <input
                          value={refUrlPrincipal}
                          onChange={(e) => setRefUrlPrincipal(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Nexus PJ</label>
                        <input
                          value={refUrlNexus}
                          onChange={(e) => setRefUrlNexus(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="https://nexuspj.poder-judicial.go.cr/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Catálogo</label>
                        <input
                          value={refUrlCatalogo}
                          onChange={(e) => setRefUrlCatalogo(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Repositorio AL</label>
                        <input
                          value={refUrlRepositorio}
                          onChange={(e) => setRefUrlRepositorio(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowModal(editingAnotacion ? 'edit' : 'create')}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={loading}
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleCreateRef}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      disabled={loading || !refNumero}
                    >
                      {loading ? 'Creando...' : 'Crear Referencia'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
