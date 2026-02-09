import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
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

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
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
        const referencia = await prisma.referencia.create({
          data: {
            numero: votoData.numero,
            titulo: votoData.resumen || votoData.tipo || undefined,
            tipoReferenciaId: 1,
            urlPrincipal: votoData.urlSCIJ || undefined,
            urlNexus: votoData.urlNexus || undefined,
          }
        })

        created++
        console.log(`✓ ${votoData.numero}`)
      } catch (e: any) {
        errors++
        console.log(`⚠️  Error: ${votoData.numero} (${e.code || 'unknown'})`)
      }
    }

    console.log(`\n✅ Importación completada`)
    console.log(`📊 Creados: ${created}`)
    console.log(`❌ Errores: ${errors}`)

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importVotos()
