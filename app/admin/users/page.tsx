'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import AdminPageHeader from '../_components/AdminPageHeader'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  isActive: boolean
  createdAt: string
  _count: { createdAnnotations: number }
}

interface UserListProps {
  initialUsers: User[]
  session: any
}

export default function UserList({ initialUsers, session }: UserListProps) {
  const [users, setUsers] = useState(initialUsers)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function handleToggle(user: User) {
    setLoading(user.id)
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'PATCH' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Error al cambiar estado')
        return
      }
      const data = await res.json()
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: data.isActive } : u))
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  async function handleSaveEdit() {
    if (!editingUser) return
    setLoading(editingUser.id)
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: editName, role: editRole }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Error al guardar cambios')
        return
      }
      const data = await res.json()
      setUsers(prev => prev.map(u => u.id === data.id ? { ...u, fullName: data.fullName, role: data.role } : u))
      setEditingUser(null)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <AdminPageHeader title="Gestión de Usuarios" subtitle="Administra las cuentas de los usuarios del sistema" />

      <div className="admin-page-content">
        <div className="flex justify-end mb-4">
          <Link href="/admin/users/new" className="btn btn-primary btn-sm">
            + Nuevo Usuario
          </Link>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <ul className="admin-list">
              {users.map((user) => (
                <li key={user.id} className="admin-list-item">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-primary-600 truncate">{user.fullName}</p>
                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-purple' : 'badge-success'}`}>
                          {user.role}
                        </span>
                        {!user.isActive && (
                          <span className="badge badge-error">Inactivo</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{user.email}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Creado: {new Date(user.createdAt).toLocaleDateString('es-CR')} | Anotaciones: {user._count.createdAnnotations}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {session.user.email !== 'gagueromesen@gmail.com' && user.email !== 'gagueromesen@gmail.com' ? (
                        <>
                          <button
                            onClick={() => { setEditingUser(user); setEditName(user.fullName); setEditRole(user.role) }}
                            className="btn btn-ghost btn-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggle(user)}
                            disabled={loading === user.id}
                            className={cn('btn btn-sm', user.isActive ? 'btn-danger' : 'btn-success')}
                          >
                            {loading === user.id ? '...' : user.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 italic">(Usuario maestro)</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Editar Usuario</h3>
              <button onClick={() => setEditingUser(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <div className="space-y-4">
                <div>
                  <label className="form-label">Nombre completo</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Rol</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="form-select"
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditingUser(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={!!loading} className="btn btn-primary">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Helper to pass session to the component
export async function getServerSideProps() {
  const session = await auth()
  return { props: { session } }
}
