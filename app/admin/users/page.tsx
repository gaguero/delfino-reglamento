import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function UsersPage() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/admin/dashboard')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          createdAnnotations: true,
        },
      },
    },
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Usuarios
                </Link>
                <Link
                  href="/admin/audit"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Auditoría
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{session.user.email}</span>
              <form
                action={async () => {
                  'use server'
                  const { signOut } = await import('@/lib/auth')
                  await signOut()
                }}
              >
                <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Gestión de Usuarios
              </h1>
              <Link
                href="/admin/users/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                + Nuevo Usuario
              </Link>
            </div>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <li key={user.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {user.fullName}
                              </p>
                              <span
                                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === 'ADMIN'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {user.role}
                              </span>
                              {!user.isActive && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Inactivo
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              Creado: {new Date(user.createdAt).toLocaleDateString('es-CR')} |
                              Anotaciones creadas: {user._count.createdAnnotations}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {user.email !== 'gagueromesen@gmail.com' && (
                              <>
                                <button
                                  onClick={() =>
                                    alert('Funcionalidad de editar usuario - Por implementar')
                                  }
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() =>
                                    alert(
                                      'Funcionalidad de desactivar usuario - Por implementar'
                                    )
                                  }
                                  className={`text-sm ${
                                    user.isActive
                                      ? 'text-red-600 hover:text-red-900'
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                >
                                  {user.isActive ? 'Desactivar' : 'Activar'}
                                </button>
                              </>
                            )}
                            {user.email === 'gagueromesen@gmail.com' && (
                              <span className="text-xs text-gray-500 italic">
                                (Usuario maestro)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
