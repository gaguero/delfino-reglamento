import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

interface Voto {
  numero: string
  fecha?: string
  tipo?: string
  resumen?: string
  articulos?: string[]
  urlSCIJ?: string
  urlNexus?: string
}

const prisma = new PrismaClient()
const DATA_FILE = path.join(process.cwd(), 'data', 'votos-completos.json')

async function importVotos(): Promise<void> {
  try {
    console.log('🚀 Importando votos a la base de datos...')

    if (!fs.existsSync(DATA_FILE)) {
      console.error(`❌ Archivo no encontrado: ${DATA_FILE}`)
      process.exit(1)
    }

    const votos: Voto[] = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    console.log(`📥 Cargados ${votos.length} votos del archivo`)

    let created = 0
    let errors = 0

    for (const votoData of votos) {
      try {
        const referencia = await prisma.referencia.upsert({
          where: {
            numero_tipoReferenciaId: {
              numero: votoData.numero,
              tipoReferenciaId: 1
            }
          },
          update: {
            titulo: votoData.resumen || votoData.tipo || undefined,
            urlPrincipal: votoData.urlSCIJ || undefined,
            urlNexus: votoData.urlNexus || undefined,
          },
          create: {
            numero: votoData.numero,
            titulo: votoData.resumen || votoData.tipo || undefined,
            tipoReferenciaId: 1,
            urlPrincipal: votoData.urlSCIJ || undefined,
            urlNexus: votoData.urlNexus || undefined,
          }
        })

        if (votoData.articulos && votoData.articulos.length > 0) {
          for (const numArticulo of votoData.articulos) {
            const articulo = await prisma.articulo.findUnique({
              where: { numero: numArticulo }
            })

            if (articulo) {
              await prisma.anotacionReferencia.upsert({
                where: {
                  anotacionId_referenciaId: {
                    anotacionId: '',
                    referenciaId: referencia.id
                  }
                },
                update: {},
                create: {
                  orden: 1,
                  referenciaId: referencia.id,
                  anotacion: {
                    create: {
                      contenido: `${votoData.tipo || 'Pronunciamiento'}: ${votoData.resumen || ''}`,
                      tipoAnotacionId: 1,
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
        console.log(`✓ ${votoData.numero}`)
      } catch (e) {
        errors++
        console.log(`⚠️  Error con ${votoData.numero}`)
      }
    }

    console.log(`\n✅ Importación completada`)
    console.log(`📊 Creados/Actualizados: ${created}`)
    console.log(`❌ Errores: ${errors}`)

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importVotos()
