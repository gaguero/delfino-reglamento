import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  tipoReferenciaId: z.number().int().optional(),
  numero: z.string().min(1).optional(),
  titulo: z.string().optional().nullable(),
  urlPrincipal: z.string().url().optional().nullable().or(z.literal('')),
  urlNexus: z.string().url().optional().nullable().or(z.literal('')),
  urlCatalogo: z.string().url().optional().nullable().or(z.literal('')),
  urlRepositorio: z.string().url().optional().nullable().or(z.literal('')),
  esVerificada: z.boolean().optional(),
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

  const existing = await prisma.referencia.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Referencia no encontrada' }, { status: 404 })
  }

  const updateData: any = { ...parsed.data }
  // Convert empty strings to null for URL fields
  for (const key of ['urlPrincipal', 'urlNexus', 'urlCatalogo', 'urlRepositorio']) {
    if (updateData[key] === '') updateData[key] = null
  }

  if (parsed.data.esVerificada) {
    updateData.fechaVerificacion = new Date()
    updateData.verificadoPorId = session.user.id
  }

  const referencia = await prisma.referencia.update({
    where: { id },
    data: updateData,
    include: { tipoReferencia: true },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      actionType: 'UPDATE',
      entityType: 'referencias',
      entityId: id,
      previousValues: {
        numero: existing.numero,
        titulo: existing.titulo,
        urlPrincipal: existing.urlPrincipal,
        urlNexus: existing.urlNexus,
        urlCatalogo: existing.urlCatalogo,
        urlRepositorio: existing.urlRepositorio,
        esVerificada: existing.esVerificada,
      },
      newValues: parsed.data,
      changedFields: Object.keys(parsed.data),
    },
  })

  return NextResponse.json(referencia)
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
  const existing = await prisma.referencia.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Referencia no encontrada' }, { status: 404 })
  }

  await prisma.referencia.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      actionType: 'DELETE',
      entityType: 'referencias',
      entityId: id,
      previousValues: existing,
    },
  })

  return NextResponse.json({ success: true })
}
