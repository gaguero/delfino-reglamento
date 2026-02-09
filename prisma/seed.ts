import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { readFileSync } from 'fs'
import { join } from 'path'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

interface ArticleData {
  numero: string
  nombre: string
  textoLegal: string
  orden: number
}

async function main() {
  console.log('Starting seed...')

  // Create tipos de referencia
  const tipoVoto = await prisma.tipoReferencia.upsert({
    where: { nombre: 'Voto' },
    update: {},
    create: { nombre: 'Voto', descripcion: 'Voto de la Sala Constitucional' },
  })

  await prisma.tipoReferencia.upsert({
    where: { nombre: 'Acta' },
    update: {},
    create: { nombre: 'Acta', descripcion: 'Acta de sesión plenaria' },
  })

  await prisma.tipoReferencia.upsert({
    where: { nombre: 'Ley' },
    update: {},
    create: { nombre: 'Ley', descripcion: 'Ley de la República' },
  })

  await prisma.tipoReferencia.upsert({
    where: { nombre: 'Resolución' },
    update: {},
    create: { nombre: 'Resolución', descripcion: 'Resolución de la Sala Constitucional' },
  })

  console.log('Tipos de referencia creados')

  // Create tipos de anotación
  await prisma.tipoAnotacion.upsert({
    where: { nombre: 'Contexto' },
    update: {},
    create: { nombre: 'Contexto', colorHex: '#3B82F6', icono: 'info' },
  })

  await prisma.tipoAnotacion.upsert({
    where: { nombre: 'Jurisprudencia' },
    update: {},
    create: { nombre: 'Jurisprudencia', colorHex: '#8B5CF6', icono: 'gavel' },
  })

  await prisma.tipoAnotacion.upsert({
    where: { nombre: 'Nota Editorial' },
    update: {},
    create: { nombre: 'Nota Editorial', colorHex: '#10B981', icono: 'edit' },
  })

  await prisma.tipoAnotacion.upsert({
    where: { nombre: 'Reforma' },
    update: {},
    create: { nombre: 'Reforma', colorHex: '#EF4444', icono: 'alert' },
  })

  console.log('Tipos de anotación creados')

  // Create master user
  const masterPassword = await hash('ChangeMe2024!', 12)
  await prisma.user.upsert({
    where: { email: 'gagueromesen@gmail.com' },
    update: {},
    create: {
      email: 'gagueromesen@gmail.com',
      fullName: 'Gabriel Agüero Mesén',
      passwordHash: masterPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('Master user created')

  // Load articles from JSON
  const articlesPath = join(__dirname, '..', 'data', 'reglamento-articles.json')
  const articlesData: ArticleData[] = JSON.parse(readFileSync(articlesPath, 'utf-8'))

  console.log(`Loading ${articlesData.length} articles from JSON...`)

  let created = 0
  let skipped = 0

  for (const article of articlesData) {
    try {
      await prisma.articulo.upsert({
        where: { numero: article.numero },
        update: {
          nombre: article.nombre,
          textoLegal: article.textoLegal,
          orden: article.orden,
        },
        create: {
          numero: article.numero,
          nombre: article.nombre,
          textoLegal: article.textoLegal,
          esVigente: true,
          orden: article.orden,
        },
      })
      created++
    } catch (e: any) {
      console.error(`Error with article ${article.numero}: ${e.message}`)
      skipped++
    }
  }

  console.log(`Articles: ${created} created/updated, ${skipped} skipped`)
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
