import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { ids } = await req.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array required' }, { status: 400 })
    }

    const result = await prisma.anotacion.updateMany({
      where: {
        id: { in: ids },
        fuenteIA: true,
        esAprobada: false
      },
      data: {
        esAprobada: true,
        aprobadoPorId: session.user.id,
        fechaAprobacion: new Date(),
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        actionType: 'BULK_APPROVE',
        entityType: 'anotaciones',
        entityId: 'bulk',
        newValues: { ids, count: result.count }
      }
    })

    return NextResponse.json({ approved: result.count })
  } catch (error) {
    console.error('Error in bulk approve:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
