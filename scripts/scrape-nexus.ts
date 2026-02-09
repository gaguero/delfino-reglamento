import * as fs from 'fs'
import * as path from 'path'

interface Voto {
  numero: string
  urlNexus?: string
  [key: string]: any
}

const DATA_DIR = path.join(process.cwd(), 'data')
const INPUT_FILE = path.join(DATA_DIR, 'votos-completos.json')
const OUTPUT_FILE = path.join(DATA_DIR, 'votos-con-nexus.json')

async function enrichWithNexus(): Promise<void> {
  try {
    console.log('🚀 Iniciando enriquecimiento con URLs de Nexus PJ...')

    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`❌ Archivo no encontrado: ${INPUT_FILE}`)
      process.exit(1)
    }

    const votos: Voto[] = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'))
    console.log(`📥 Cargados ${votos.length} votos`)

    console.log('🔗 Buscando URLs en Nexus PJ...')
    console.log('⚠️  Nota: Requiere búsqueda manual en https://nexuspj.poder-judicial.go.cr/')
    console.log('   Implementar búsqueda automatizada requiere navegación de JavaScript pesada')

    let enriched = 0
    for (let i = 0; i < votos.length; i++) {
      const voto = votos[i]
      
      if (!voto.urlNexus && voto.numero) {
        voto.urlNexus = `https://nexuspj.poder-judicial.go.cr/?query=${encodeURIComponent(voto.numero)}`
        enriched++
      }
    }

    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(votos, null, 2))

    console.log(`\n✅ Datos enriquecidos guardados: ${OUTPUT_FILE}`)
    console.log(`📊 URLs de búsqueda generadas: ${enriched}`)
    console.log(`⚠️  Recomendación: Validar URLs en navegador browser manualmente`)

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

enrichWithNexus()
