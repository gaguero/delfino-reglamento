import puppeteer, { Browser } from 'puppeteer'
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

const DATA_DIR = path.join(process.cwd(), 'data')
const OUTPUT_FILE = path.join(DATA_DIR, 'actas-asamblea.json')

async function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

async function scrapeActas(): Promise<void> {
  let browser: Browser | null = null
  const actas: Acta[] = []

  try {
    console.log('🚀 Iniciando scraper de actas de Asamblea Legislativa...')

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

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    await page.setDefaultNavigationTimeout(30000)

    console.log('📄 Navegando a Asamblea Legislativa...')

    const urls = [
      'https://www.asamblea.go.cr/glcp/actas/forms/plenario.aspx',
      'https://www.asamblea.go.cr/sd/actas_constituyentes/Forms/AllItems.aspx'
    ]

    for (const url of urls) {
      try {
        console.log(`\n🔍 Accediendo a: ${url}`)
        
        await page.goto(url, { 
          waitUntil: 'domcontentloaded'
        }).catch(() => null)

        await new Promise(resolve => setTimeout(resolve, 1500))

        const extracted = await page.evaluate(() => {
          const results: any[] = []
          
          const rows = Array.from(document.querySelectorAll('table tbody tr, tr[onclick]'))
          
          rows.slice(0, 50).forEach(row => {
            const cells = row.querySelectorAll('td')
            if (cells.length < 1) return

            const acta: any = {}
            
            const text = row.textContent || ''
            const numero = cells[0].textContent?.trim()

            if (!numero || numero.length < 2) return

            acta.numero = numero.substring(0, 30)
            acta.tipo = text.toLowerCase().includes('plenario') ? 'Plenario' : 'Comisión'
            acta.resumen = Array.from(cells).slice(1)
              .map(c => c.textContent?.trim())
              .filter(Boolean)
              .join(' ')
              .substring(0, 200)

            const link = row.querySelector('a')
            if (link?.href) {
              acta.url = link.href
            }

            if (acta.numero) {
              results.push(acta)
            }
          })

          return results
        })

        if (extracted.length > 0) {
          console.log(`✓ Extrajeron: ${extracted.length} actas`)
          actas.push(...extracted)
          break
        }
      } catch (e) {
        console.log(`⚠️  Error accediendo a ${url}`)
      }
    }

    console.log('\n🔗 Analizando referencias a artículos...')

    for (let i = 0; i < Math.min(actas.length, 2); i++) {
      const acta = actas[i]
      if (!acta.url) continue

      try {
        await page.goto(acta.url, { waitUntil: 'domcontentloaded' })
        
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
          acta.articulos = articulos
        }
      } catch (e) {
        console.log(`⚠️  No se pudieron extraer referencias para ${acta.numero}`)
      }
    }

    await ensureDataDir()
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(actas, null, 2))

    console.log(`\n✅ Datos guardados: ${OUTPUT_FILE}`)
    console.log(`📊 Total: ${actas.length} actas`)

    if (actas.length > 0) {
      console.log('\n📋 Primeras actas:')
      actas.slice(0, 3).forEach(a => {
        console.log(`  - ${a.numero} (${a.tipo})`)
        if (a.articulos?.length) {
          console.log(`    Artículos: ${a.articulos.join(', ')}`)
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

scrapeActas()
