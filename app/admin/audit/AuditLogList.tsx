'use client'

import { useState } from 'react'
import Link from 'next/link'

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

interface Props {
  logs: AuditLog[]
  page: number
  totalPages: number
  totalCount: number
  skip: number
  pageSize: number
  filterUser?: string
  filterEntity?: string
}

export default function AuditLogList({ logs, page, totalPages, totalCount, skip, pageSize, filterUser, filterEntity }: Props) {
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null)

  function buildPageUrl(p: number) {
    const parts = [`/admin/audit?page=${p}`]
    if (filterUser) parts.push(`user=${filterUser}`)
    if (filterEntity) parts.push(`entity=${filterEntity}`)
    return parts.join('&')
  }

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-700">
            Mostrando {totalCount === 0 ? 0 : skip + 1} - {Math.min(skip + pageSize, totalCount)} de {totalCount} registros
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-500">No se encontraron registros de auditoría</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {logs.map((log) => (
              <li key={log.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.actionType === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                        log.actionType === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {log.actionType}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{log.entityType}</span>
                      <span className="text-sm text-gray-500">ID: {log.entityId.substring(0, 8)}...</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Por <span className="font-medium">{log.user.fullName}</span> ({log.user.email})
                    </p>
                    {log.changedFields && (
                      <p className="mt-1 text-xs text-gray-500">
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
                    className="ml-4 text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Ver detalles
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-700">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={buildPageUrl(page - 1)} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Anterior</Link>
              )}
              {page < totalPages && (
                <Link href={buildPageUrl(page + 1)} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Siguiente</Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setDetailLog(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalle de Auditoría</h3>
                <button onClick={() => setDetailLog(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Acción:</span>{' '}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      detailLog.actionType === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                      detailLog.actionType === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>{detailLog.actionType}</span>
                  </div>
                  <div><span className="font-medium text-gray-700">Entidad:</span> {detailLog.entityType}</div>
                  <div><span className="font-medium text-gray-700">ID:</span> {detailLog.entityId}</div>
                  <div><span className="font-medium text-gray-700">Usuario:</span> {detailLog.user.fullName}</div>
                  <div className="col-span-2"><span className="font-medium text-gray-700">Fecha:</span> {new Date(detailLog.createdAt).toLocaleString('es-CR')}</div>
                </div>

                {detailLog.previousValues && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Valores anteriores:</h4>
                    <pre className="text-xs bg-red-50 p-3 rounded overflow-x-auto border border-red-200">
                      {JSON.stringify(detailLog.previousValues, null, 2)}
                    </pre>
                  </div>
                )}

                {detailLog.newValues && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Valores nuevos:</h4>
                    <pre className="text-xs bg-green-50 p-3 rounded overflow-x-auto border border-green-200">
                      {JSON.stringify(detailLog.newValues, null, 2)}
                    </pre>
                  </div>
                )}

                {detailLog.changedFields && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Campos modificados:</h4>
                    <pre className="text-xs bg-yellow-50 p-3 rounded overflow-x-auto border border-yellow-200">
                      {JSON.stringify(detailLog.changedFields, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button onClick={() => setDetailLog(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
