import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create tipos de referencia
  const tipoVoto = await prisma.tipoReferencia.upsert({
    where: { nombre: 'Voto' },
    update: {},
    create: {
      nombre: 'Voto',
      descripcion: 'Voto de la Sala Constitucional',
    },
  })

  const tipoActa = await prisma.tipoReferencia.upsert({
    where: { nombre: 'Acta' },
    update: {},
    create: {
      nombre: 'Acta',
      descripcion: 'Acta de sesión plenaria',
    },
  })

  const tipoLey = await prisma.tipoReferencia.upsert({
    where: { nombre: 'Ley' },
    update: {},
    create: {
      nombre: 'Ley',
      descripcion: 'Ley de la República',
    },
  })

  console.log('Tipos de referencia creados')

  // Create tipos de anotación
  const tipoContexto = await prisma.tipoAnotacion.upsert({
    where: { nombre: 'Contexto' },
    update: {},
    create: {
      nombre: 'Contexto',
      colorHex: '#3B82F6',
      icono: 'info',
    },
  })

  const tipoJurisprudencia = await prisma.tipoAnotacion.upsert({
    where: { nombre: 'Jurisprudencia' },
    update: {},
    create: {
      nombre: 'Jurisprudencia',
      colorHex: '#8B5CF6',
      icono: 'gavel',
    },
  })

  const tipoNota = await prisma.tipoAnotacion.upsert({
    where: { nombre: 'Nota Editorial' },
    update: {},
    create: {
      nombre: 'Nota Editorial',
      colorHex: '#10B981',
      icono: 'edit',
    },
  })

  console.log('Tipos de anotación creados')

  // Create master user
  const masterPassword = await hash('ChangeMe2024!', 12)
  const masterUser = await prisma.user.upsert({
    where: { email: 'gagueromesen@gmail.com' },
    update: {},
    create: {
      email: 'gagueromesen@gmail.com',
      fullName: 'Gabriel Güero Mesén',
      passwordHash: masterPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('Master user created')

  // Create sample articles
  const articulo1 = await prisma.articulo.upsert({
    where: { numero: '1' },
    update: {},
    create: {
      numero: '1',
      nombre: 'De la facultad de darse su reglamento',
      textoLegal:
        'Artículo 1.- La Asamblea Legislativa se dará su propio reglamento de conformidad con lo dispuesto en el artículo 121, inciso 1), de la Constitución Política.',
      esVigente: true,
      orden: 1,
    },
  })

  const articulo2 = await prisma.articulo.upsert({
    where: { numero: '2' },
    update: {},
    create: {
      numero: '2',
      nombre: 'De su objeto',
      textoLegal:
        'Artículo 2.- El presente Reglamento tiene por objeto regular el funcionamiento de la Asamblea Legislativa y garantizar el pleno ejercicio de sus funciones constitucionales.',
      esVigente: true,
      orden: 2,
    },
  })

  console.log('Sample articles created')

  // Create sample annotation
  await prisma.anotacion.create({
    data: {
      articuloId: articulo1.id,
      tipoAnotacionId: tipoContexto.id,
      contenido:
        '<p>Este artículo establece la autonomía constitucional de la Asamblea Legislativa para darse su propio reglamento, sin intervención de otros poderes del Estado.</p>',
      orden: 1,
      esVisible: true,
      createdById: masterUser.id,
    },
  })

  console.log('Sample annotation created')

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
