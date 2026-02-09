import puppeteer, { Browser } from 'puppeteer'
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

const DATA_DIR = path.join(process.cwd(), 'data')
const OUTPUT_FILE = path.join(DATA_DIR, 'votos-completos.json')

async function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

async function scrapeVotos(): Promise<void> {
  let browser: Browser | null = null
  const votos: Voto[] = []

  try {
    console.log('🚀 Iniciando scraper de votos SCIJ...')

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
    })

    const page = await browser.newPage()

    page.on('error', (err) => console.error('❌ Error:', err.message))

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    await page.setDefaultNavigationTimeout(30000)

    console.log('📄 Navegando a SCIJ...')

    await page.goto('https://www.pgrweb.go.cr/scij/', { 
      waitUntil: 'domcontentloaded' 
    }).catch(() => null)

    console.log('✓ Conectado a SCIJ')

    const urls = [
      'https://www.pgrweb.go.cr/scij/Busqueda/Pronunciamientos.aspx',
      'https://www.pgrweb.go.cr/scij/Busqueda/Default.aspx?tipo=Pronunciamientos'
    ]

    for (const url of urls) {
      try {
        console.log(`\n🔍 Accediendo a: ${url}`)
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        
        await new Promise(resolve => setTimeout(resolve, 1500))

        const extracted = await page.evaluate(() => {
          const results: any[] = []
          
          const rows = Array.from(document.querySelectorAll('table tbody tr, tr[onclick]'))
          
          rows.slice(0, 100).forEach(row => {
            const cells = row.querySelectorAll('td')
            if (cells.length < 2) return

            const firstCell = cells[0].textContent?.trim()
            const secondCell = cells[1].textContent?.trim()
            
            if (!firstCell || !secondCell) return

            const voto: any = {}
            
            voto.numero = firstCell.substring(0, 30)
            voto.tipo = 'Pronunciamiento'
            voto.resumen = Array.from(cells).slice(1, 3)
              .map(c => c.textContent?.trim())
              .filter(Boolean)
              .join(' ')
              .substring(0, 200)

            const link = row.querySelector('a')
            if (link?.href) {
              voto.urlSCIJ = link.href
            }

            if (voto.numero && voto.numero.length > 2) {
              results.push(voto)
            }
          })

          return results
        })

        if (extracted.length > 0) {
          console.log(`✓ Extrajeron: ${extracted.length} registros`)
          votos.push(...extracted.slice(0, 100))
          break
        }
      } catch (e) {
        console.log(`⚠️  Error accediendo a ${url}`)
      }
    }

    console.log('\n🔗 Analizando referencias a artículos...')

    for (let i = 0; i < Math.min(votos.length, 3); i++) {
      const voto = votos[i]
      if (!voto.urlSCIJ) continue

      try {
        await page.goto(voto.urlSCIJ, { waitUntil: 'domcontentloaded' })
        
        const articulos = await page.evaluate(() => {
          const text = document.body.textContent || ''
          const matches = text.match(/artículo\s+(\d+)/gi) || []
          const nums = new Set<string>()
          
          matches.slice(0, 5).forEach(m => {
            const num = m.match(/\d+/)
            if (num) nums.add(num[0])
          })
          
          return Array.from(nums)
        })

        if (articulos.length > 0) {
          voto.articulos = articulos
        }
      } catch (e) {
        console.log(`⚠️  No se pudieron extraer referencias para ${voto.numero}`)
      }
    }

    await ensureDataDir()
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(votos, null, 2))

    console.log(`\n✅ Datos guardados: ${OUTPUT_FILE}`)
    console.log(`📊 Total: ${votos.length} registros`)

    if (votos.length > 0) {
      console.log('\n📋 Primeros 3 registros:')
      votos.slice(0, 3).forEach(v => {
        console.log(`  - ${v.numero}: ${v.tipo || 'N/A'}`)
        if (v.articulos?.length) {
          console.log(`    Artículos: ${v.articulos.join(', ')}`)
        }
      })
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    if (browser) await browser.close()
    console.log('\n🏁 Finalizado')
  }
}

scrapeVotos()
