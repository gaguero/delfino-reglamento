import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const { articuloNumeros } = await req.json()

  if (!Array.isArray(articuloNumeros) || articuloNumeros.length === 0) {
    return NextResponse.json({ error: 'articuloNumeros array required' }, { status: 400 })
  }

  try {
    // Get the "Contexto" tipo anotacion
    const tipoContexto = await prisma.tipoAnotacion.findUnique({
      where: { nombre: 'Contexto' }
    })

    if (!tipoContexto) {
      return NextResponse.json({ error: 'TipoAnotacion "Contexto" not found' }, { status: 404 })
    }

    let createdCount = 0

    for (const numero of articuloNumeros) {
      const articulo = await prisma.articulo.findUnique({ where: { numero } })
      if (!articulo) {
        console.warn(`Article ${numero} not found, skipping`)
        continue
      }

      // Check if annotation already exists for this referencia+article combo
      const existing = await prisma.anotacion.findFirst({
        where: {
          articuloId: articulo.id,
          referencias: {
            some: { referenciaId: id }
          }
        }
      })

      if (existing) {
        console.log(`Annotation already exists for ref ${id} on art. ${numero}`)
        continue
      }

      // Get current max orden for this article's annotations
      const maxOrden = await prisma.anotacion.aggregate({
        where: { articuloId: articulo.id },
        _max: { orden: true }
      })
      const nextOrden = (maxOrden._max.orden || 0) + 1

      // Get the referencia to extract details
      const referencia = await prisma.referencia.findUnique({
        where: { id },
        include: { tipoReferencia: true }
      })

      if (!referencia) {
        return NextResponse.json({ error: 'Referencia not found' }, { status: 404 })
      }

      // Create annotation with reference
      await prisma.anotacion.create({
        data: {
          articuloId: articulo.id,
          tipoAnotacionId: tipoContexto.id,
          contenido: `<p><strong>${referencia.tipoReferencia.nombre}: ${referencia.numero}</strong></p><p>${referencia.titulo || ''}</p>`,
          orden: nextOrden,
          esVisible: true,
          esAprobada: true,
          createdById: session.user.id,
          referencias: {
            create: {
              referenciaId: id,
              orden: 1,
            }
          }
        }
      })

      createdCount++
    }

    return NextResponse.json({ created: createdCount })
  } catch (error) {
    console.error('Error linking articles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
