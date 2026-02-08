import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  tipoAnotacionId: z.number().int().optional(),
  contenido: z.string().min(1).optional(),
  orden: z.number().int().optional(),
  esVisible: z.boolean().optional(),
  referenciaIds: z.array(z.string().uuid()).optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const existing = await prisma.anotacion.findUnique({
    where: { id },
    include: { referencias: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Anotación no encontrada' }, { status: 404 })
  }

  const { referenciaIds, ...updateData } = parsed.data

  const anotacion = await prisma.$transaction(async (tx) => {
    if (referenciaIds !== undefined) {
      await tx.anotacionReferencia.deleteMany({ where: { anotacionId: id } })
      if (referenciaIds.length > 0) {
        await tx.anotacionReferencia.createMany({
          data: referenciaIds.map((refId, idx) => ({
            anotacionId: id,
            referenciaId: refId,
            orden: idx + 1,
          })),
        })
      }
    }

    return tx.anotacion.update({
      where: { id },
      data: {
        ...updateData,
        updatedById: session.user.id,
      },
      include: {
        tipoAnotacion: true,
        createdBy: true,
        updatedBy: true,
        referencias: { include: { referencia: { include: { tipoReferencia: true } } } },
      },
    })
  })

  const changedFields = Object.keys(updateData).filter(
    (key) => (updateData as any)[key] !== undefined
  )
  if (referenciaIds !== undefined) changedFields.push('referencias')

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      actionType: 'UPDATE',
      entityType: 'anotaciones',
      entityId: id,
      previousValues: {
        tipoAnotacionId: existing.tipoAnotacionId,
        contenido: existing.contenido,
        orden: existing.orden,
        esVisible: existing.esVisible,
      },
      newValues: parsed.data,
      changedFields,
    },
  })

  return NextResponse.json(anotacion)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.anotacion.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Anotación no encontrada' }, { status: 404 })
  }

  await prisma.anotacion.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      actionType: 'DELETE',
      entityType: 'anotaciones',
      entityId: id,
      previousValues: {
        articuloId: existing.articuloId,
        tipoAnotacionId: existing.tipoAnotacionId,
        contenido: existing.contenido,
        orden: existing.orden,
      },
    },
  })

  return NextResponse.json({ success: true })
}
