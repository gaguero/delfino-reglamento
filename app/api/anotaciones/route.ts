import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  articuloId: z.number().int(),
  tipoAnotacionId: z.number().int(),
  contenido: z.string().min(1),
  orden: z.number().int(),
  esVisible: z.boolean().optional(),
  referenciaIds: z.array(z.string().uuid()).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { articuloId, tipoAnotacionId, contenido, orden, esVisible, referenciaIds } = parsed.data

  const anotacion = await prisma.anotacion.create({
    data: {
      articuloId,
      tipoAnotacionId,
      contenido,
      orden,
      esVisible: esVisible ?? true,
      createdById: session.user.id,
      referencias: referenciaIds?.length
        ? {
            create: referenciaIds.map((refId, idx) => ({
              referenciaId: refId,
              orden: idx + 1,
            })),
          }
        : undefined,
    },
    include: {
      tipoAnotacion: true,
      createdBy: true,
      referencias: { include: { referencia: { include: { tipoReferencia: true } } } },
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      actionType: 'CREATE',
      entityType: 'anotaciones',
      entityId: anotacion.id,
      newValues: { articuloId, tipoAnotacionId, contenido, orden, referenciaIds },
    },
  })

  return NextResponse.json(anotacion, { status: 201 })
}
