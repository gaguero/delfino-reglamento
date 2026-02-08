'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AuditLog {
  id: string
  actionType: string
  entityType: string
  entityId: string
  previousValues: any
  newValues: any
  changedFields: any
  ipAddress: string | null
  createdAt: string
  user: { fullName: string; email: string }
}

interface AuditLogListProps {
  logs: AuditLog[]
  page: number
  totalPages: number
  totalCount: number
  skip: number
  pageSize: number
  filterUser?: string
  filterEntity?: string
}

export default function AuditLogList({ logs, page, totalPages, totalCount, skip, pageSize, filterUser, filterEntity }: AuditLogListProps) {
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null)

  function buildPageUrl(p: number) {
    const params = new URLSearchParams()
    params.set('page', p.toString())
    if (filterUser) params.set('user', filterUser)
    if (filterEntity) params.set('entity', filterEntity)
    return `/admin/audit?${params.toString()}`
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header px-4 py-3 bg-gray-50 border-b border-gray-200"> {/* Add padding to header */}
          <p className="text-sm text-gray-700">
            Mostrando {totalCount === 0 ? 0 : skip + 1} - {Math.min(skip + pageSize, totalCount)} de {totalCount} registros
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron registros de auditoría.</p>
          </div>
        ) : (
          <ul className="admin-list">
            {logs.map((log) => (
              <li key={log.id} className="admin-list-item">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${
                        log.actionType === 'UPDATE' ? 'badge-warning' :
                        log.actionType === 'DELETE' ? 'badge-error' :
                        'badge-success'
                      }`}>
                        {log.actionType}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{log.entityType}</span>
                      <span className="text-sm text-gray-500">ID: {log.entityId.substring(0, 8)}...</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      Por <span className="font-medium">{log.user.fullName}</span> ({log.user.email})
                    </p>
                    {log.changedFields && (
                      <p className="mt-1 text-xs text-gray-500 truncate">
                        Campos: {Array.isArray(log.changedFields) ? log.changedFields.join(', ') : JSON.stringify(log.changedFields)}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString('es-CR')}
                      {log.ipAddress && ` | IP: ${log.ipAddress}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setDetailLog(log)}
                    className="btn btn-ghost btn-sm ml-4"
                  >
                    Detalles
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <p className="pagination-info">Página {page} de {totalPages}</p>
          <div className="pagination-buttons">
            {page > 1 && (
              <Link href={buildPageUrl(page - 1)} className="btn btn-secondary btn-sm">Anterior</Link>
            )}
            {page < totalPages && (
              <Link href={buildPageUrl(page + 1)} className="btn btn-secondary btn-sm">Siguiente</Link>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailLog && (
        <div className="modal-backdrop">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Detalle de Auditoría</h3>
              <button onClick={() => setDetailLog(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="font-medium text-gray-700">Acción:</span> {' '}
                  <span className={`badge ${
                    detailLog.actionType === 'UPDATE' ? 'badge-warning' :
                    detailLog.actionType === 'DELETE' ? 'badge-error' :
                    'badge-success'
                  }`}>{detailLog.actionType}</span>
                </div>
                <div><span className="font-medium text-gray-700">Entidad:</span> {detailLog.entityType}</div>
                <div><span className="font-medium text-gray-700">ID:</span> {detailLog.entityId.substring(0, 12)}...</div>
                <div><span className="font-medium text-gray-700">Usuario:</span> {detailLog.user.fullName}</div>
                <div className="col-span-2"><span className="font-medium text-gray-700">Fecha y Hora:</span> {new Date(detailLog.createdAt).toLocaleString('es-CR')}</div>
              </div>

              {detailLog.previousValues && (
                <div>
                  <h4 className="modal-title text-sm mb-1">Valores Anteriores</h4>
                  <pre className="text-xs bg-red-50 p-3 rounded overflow-x-auto border border-red-200 text-red-800">
                    {JSON.stringify(detailLog.previousValues, null, 2)}
                  </pre>
                </div>
              )}

              {detailLog.newValues && (
                <div>
                  <h4 className="modal-title text-sm mb-1 mt-4">Valores Nuevos</h4>
                  <pre className="text-xs bg-green-50 p-3 rounded overflow-x-auto border border-green-200 text-green-800">
                    {JSON.stringify(detailLog.newValues, null, 2)}
                  </pre>
                </div>
              )}

              {detailLog.changedFields && (
                <div>
                  <h4 className="modal-title text-sm mb-1 mt-4">Campos Modificados</h4>
                  <pre className="text-xs bg-yellow-50 p-3 rounded overflow-x-auto border border-yellow-200 text-yellow-800">
                    {JSON.stringify(detailLog.changedFields, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setDetailLog(null)} className="btn btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
