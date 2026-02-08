'use client'

import { useState } from 'react'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  isActive: boolean
  createdAt: string
  _count: { createdAnnotations: number }
}

export default function UserList({ initialUsers }: { initialUsers: User[] }) {
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
        alert(data.error || 'Error')
        return
      }
      const data = await res.json()
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: data.isActive } : u))
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
        alert(data.error || 'Error')
        return
      }
      const data = await res.json()
      setUsers(prev => prev.map(u => u.id === data.id ? { ...u, fullName: data.fullName, role: data.role } : u))
      setEditingUser(null)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-blue-600 truncate">{user.fullName}</p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                      {!user.isActive && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactivo</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Creado: {new Date(user.createdAt).toLocaleDateString('es-CR')} | Anotaciones: {user._count.createdAnnotations}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {user.email !== 'gagueromesen@gmail.com' ? (
                      <>
                        <button
                          onClick={() => { setEditingUser(user); setEditName(user.fullName); setEditRole(user.role) }}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={loading === user.id}
                          className={`text-sm ${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {loading === user.id ? '...' : user.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 italic">(Usuario maestro)</span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setEditingUser(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Usuario</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="EDITOR">EDITOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSaveEdit} disabled={!!loading} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
