'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader'
import { cn } from '@/lib/utils'

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'EDITOR',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    const isDelfinoEmail = formData.email.endsWith('@delfino.cr')
    const isMasterEmail = formData.email === 'gagueromesen@gmail.com'

    if (!isDelfinoEmail && !isMasterEmail) {
      setError('El email debe ser del dominio @delfino.cr')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
          role: formData.role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear usuario')
      }

      router.push('/admin/users')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AdminPageHeader title="Crear Usuario" subtitle="Añada un nuevo usuario al sistema" />

      <div className="admin-page-content">
        <Link href="/admin/users" className="btn btn-ghost btn-sm mb-4">
          ← Volver a Usuarios
        </Link>

        <div className="admin-card">
          <div className="admin-card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="alert alert-error">
                  <p>{error}</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  id="fullName"
                  required
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="usuario@delfino.cr"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="form-hint">Debe ser del dominio @delfino.cr</p>
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Rol</label>
                <select
                  id="role"
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <p className="form-hint">Los editores pueden crear y editar anotaciones. Los administradores tienen acceso completo.</p>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  required
                  minLength={8}
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="form-hint">Mínimo 8 caracteres</p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  minLength={8}
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
                <Link href="/admin/users" className="btn btn-secondary">
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
