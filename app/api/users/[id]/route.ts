import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'EDITOR']).optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  // Protect master account
  if (existing.email === 'gagueromesen@gmail.com') {
    return NextResponse.json({ error: 'No se puede modificar el usuario maestro' }, { status: 403 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      actionType: 'UPDATE',
      entityType: 'users',
      entityId: id,
      previousValues: {
        fullName: existing.fullName,
        role: existing.role,
        isActive: existing.isActive,
      },
      newValues: parsed.data,
      changedFields: Object.keys(parsed.data),
    },
  })

  return NextResponse.json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role, isActive: user.isActive })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const { id } = await params
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }
  if (existing.email === 'gagueromesen@gmail.com') {
    return NextResponse.json({ error: 'No se puede modificar el usuario maestro' }, { status: 403 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: !existing.isActive },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      actionType: 'UPDATE',
      entityType: 'users',
      entityId: id,
      previousValues: { isActive: existing.isActive },
      newValues: { isActive: user.isActive },
      changedFields: ['isActive'],
    },
  })

  return NextResponse.json({ id: user.id, isActive: user.isActive })
}
