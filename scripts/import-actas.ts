import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
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

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
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

        const referencia = await prisma.referencia.create({
          data: {
            numero: actaData.numero,
            titulo: actaData.resumen || `Acta ${actaData.tipo}`,
            tipoReferenciaId: tipoReferenciaId,
            urlPrincipal: actaData.url || undefined,
          }
        })

        created++
        console.log(`✓ ${actaData.numero} (${actaData.tipo})`)
      } catch (e: any) {
        errors++
        console.log(`⚠️  Error: ${actaData.numero} (${e.code || 'unknown'})`)
      }
    }

    console.log(`\n✅ Importación completada`)
    console.log(`📊 Creadas: ${created}`)
    console.log(`❌ Errores: ${errors}`)

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importActas()
