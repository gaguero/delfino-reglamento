import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  tipoReferenciaId: z.number().int(),
  numero: z.string().min(1),
  titulo: z.string().optional(),
  urlPrincipal: z.string().url().optional().or(z.literal('')),
  urlNexus: z.string().url().optional().or(z.literal('')),
  urlCatalogo: z.string().url().optional().or(z.literal('')),
  urlRepositorio: z.string().url().optional().or(z.literal('')),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const referencias = await prisma.referencia.findMany({
    include: { tipoReferencia: true },
    orderBy: [{ tipoReferenciaId: 'asc' }, { numero: 'asc' }],
  })

  return NextResponse.json(referencias)
}

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

  const data = {
    ...parsed.data,
    urlPrincipal: parsed.data.urlPrincipal || null,
    urlNexus: parsed.data.urlNexus || null,
    urlCatalogo: parsed.data.urlCatalogo || null,
    urlRepositorio: parsed.data.urlRepositorio || null,
  }

  const referencia = await prisma.referencia.create({
    data,
    include: { tipoReferencia: true },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      actionType: 'CREATE',
      entityType: 'referencias',
      entityId: referencia.id,
      newValues: data,
    },
  })

  return NextResponse.json(referencia, { status: 201 })
}
