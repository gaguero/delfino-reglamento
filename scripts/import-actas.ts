import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

interface Acta {
  numero: string
  tipo: 'Plenario' | 'Comisión'
  fecha?: string
  resumen?: string
  url?: string
  articulos?: string[]
}

const prisma = new PrismaClient()
const DATA_FILE = path.join(process.cwd(), 'data', 'actas-asamblea.json')

async function importActas(): Promise<void> {
  try {
    console.log('🚀 Importando actas a la base de datos...')

    if (!fs.existsSync(DATA_FILE)) {
      console.error(`❌ Archivo no encontrado: ${DATA_FILE}`)
      process.exit(1)
    }

    const actas: Acta[] = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    console.log(`📥 Cargadas ${actas.length} actas del archivo`)

    let created = 0
    let errors = 0

    for (const actaData of actas) {
      try {
        const tipoReferenciaId = actaData.tipo === 'Plenario' ? 3 : 4

        const referencia = await prisma.referencia.upsert({
          where: {
            numero_tipoReferenciaId: {
              numero: actaData.numero,
              tipoReferenciaId: tipoReferenciaId
            }
          },
          update: {
            titulo: actaData.resumen || actaData.tipo || undefined,
          },
          create: {
            numero: actaData.numero,
            titulo: actaData.resumen || actaData.tipo || undefined,
            tipoReferenciaId: tipoReferenciaId,
            urlPrincipal: actaData.url || undefined,
          }
        })

        if (actaData.articulos && actaData.articulos.length > 0) {
          for (const numArticulo of actaData.articulos) {
            const articulo = await prisma.articulo.findUnique({
              where: { numero: numArticulo }
            })

            if (articulo) {
              await prisma.anotacionReferencia.create({
                data: {
                  orden: 1,
                  referenciaId: referencia.id,
                  anotacion: {
                    create: {
                      contenido: `Acta ${actaData.tipo}: ${actaData.resumen || ''}`,
                      tipoAnotacionId: 2,
                      articulo: { connect: { id: articulo.id } },
                      createdBy: { connect: { id: 'seed-user' } },
                      fuenteIA: true,
                      esAprobada: false,
                      orden: 1,
                      esVisible: false
                    }
                  }
                }
              }).catch(() => null)
            }
          }
        }

        created++
        console.log(`✓ ${actaData.numero}`)
      } catch (e) {
        errors++
        console.log(`⚠️  Error con ${actaData.numero}`)
      }
    }

    console.log(`\n✅ Importación completada`)
    console.log(`📊 Creadas/Actualizadas: ${created}`)
    console.log(`❌ Errores: ${errors}`)

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importActas()
