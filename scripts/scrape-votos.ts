import puppeteer, { Page } from 'puppeteer-core'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

const CHROME_PATH = 'C:\\Users\\jovy2\\Downloads\\chrome-win64\\chrome-win64\\chrome.exe'
const OUTPUT_FILE = join(__dirname, '..', 'data', 'votos-found.json')

interface VotoResult {
  votoNumero: string
  fecha?: string
  resumen?: string
  url: string
  source: string
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function scrapeFromSCIJ(page: Page): Promise<VotoResult[]> {
  const results: VotoResult[] = []

  // Go to the Reglamento page on SCIJ
  console.log('[SCIJ] Navigating to Reglamento...')
  await page.goto(
    'https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=46479&nValor3=0&strTipM=TC',
    { waitUntil: 'networkidle2', timeout: 30000 }
  )
  await delay(2000)

  // Click "Acciones y resoluciones constitucionales" in sidebar
  console.log('[SCIJ] Looking for "Acciones y resoluciones constitucionales"...')
  const links = await page.$$('a')
  for (const link of links) {
    const text = await page.evaluate(el => el.textContent?.trim(), link)
    if (text && text.includes('Acciones y resoluciones constitucionales')) {
      console.log('[SCIJ] Found link, clicking...')
      await link.click()
      await delay(3000)
      await page.screenshot({ path: join(__dirname, '..', 'data', 'scij-acciones.png') })

      // Extract all links/data from the page
      const pageContent = await page.content()
      console.log(`[SCIJ] Page content length: ${pageContent.length}`)

      // Look for vote references in the page
      const votoLinks = await page.$$eval('a[href]', (anchors) =>
        anchors
          .filter(a => {
            const href = a.getAttribute('href') || ''
            const text = a.textContent || ''
            return (
              text.match(/\d{4}[-–]\d+/) ||
              href.includes('nValor') ||
              text.includes('Voto') ||
              text.includes('Resolución')
            )
          })
          .map(a => ({
            text: a.textContent?.trim() || '',
            href: a.getAttribute('href') || '',
          }))
      )
      console.log(`[SCIJ] Found ${votoLinks.length} potential vote links`)
      for (const vl of votoLinks.slice(0, 5)) {
        console.log(`  ${vl.text} -> ${vl.href.substring(0, 80)}`)
      }

      // Extract all text content for vote numbers
      const bodyText = await page.evaluate(() => document.body.innerText)
      const votoMatches = bodyText.match(/(?:Res\.|Voto|Resolución)\s*(?:N[°ºo]?\s*)?(\d{4}[-–]\d+)/g)
      if (votoMatches) {
        console.log(`[SCIJ] Found ${votoMatches.length} vote references in text`)
        for (const vm of votoMatches) {
          console.log(`  ${vm}`)
        }
      }

      break
    }
  }

  // Also try "Jurisprudencia relacionada"
  console.log('[SCIJ] Navigating back to Reglamento...')
  await page.goto(
    'https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=46479&nValor3=0&strTipM=TC',
    { waitUntil: 'networkidle2', timeout: 30000 }
  )
  await delay(2000)

  const links2 = await page.$$('a')
  for (const link of links2) {
    const text = await page.evaluate(el => el.textContent?.trim(), link)
    if (text && text.includes('Jurisprudencia relacionada')) {
      console.log('[SCIJ] Found "Jurisprudencia relacionada", clicking...')
      await link.click()
      await delay(3000)
      await page.screenshot({ path: join(__dirname, '..', 'data', 'scij-jurisprudencia.png') })

      // Extract all links
      const jurLinks = await page.$$eval('a[href]', (anchors) =>
        anchors
          .filter(a => {
            const text = a.textContent || ''
            return text.match(/\d{4}[-–]\d+/) || text.includes('Sala Constitucional')
          })
          .map(a => ({
            text: a.textContent?.trim() || '',
            href: a.getAttribute('href') || '',
          }))
      )
      console.log(`[SCIJ] Found ${jurLinks.length} jurisprudencia links`)
      for (const jl of jurLinks) {
        console.log(`  ${jl.text} -> ${jl.href.substring(0, 100)}`)
        const numMatch = jl.text.match(/(\d{4}[-–]\d+)/)
        if (numMatch) {
          results.push({
            votoNumero: numMatch[1],
            resumen: jl.text,
            url: jl.href.startsWith('http') ? jl.href : `https://www.pgrweb.go.cr${jl.href}`,
            source: 'SCIJ-Jurisprudencia',
          })
        }
      }

      // Get full page text for any additional references
      const bodyText2 = await page.evaluate(() => document.body.innerText)
      writeFileSync(
        join(__dirname, '..', 'data', 'scij-jurisprudencia-text.txt'),
        bodyText2,
        'utf-8'
      )
      console.log('[SCIJ] Saved jurisprudencia text to file')

      break
    }
  }

  return results
}

async function scrapeFromNexusPJ(page: Page): Promise<VotoResult[]> {
  const results: VotoResult[] = []

  console.log('[Nexus] Navigating to Nexus PJ...')
  await page.goto('https://nexuspj.poder-judicial.go.cr/', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  })
  await delay(2000)

  // Search for Reglamento Asamblea Legislativa votos
  const searchInput = await page.$('input[type="search"], input[type="text"], input[placeholder*="Digite"]')
  if (searchInput) {
    console.log('[Nexus] Found search input, typing query...')
    await searchInput.click({ clickCount: 3 })
    await searchInput.type('Reglamento Asamblea Legislativa Sala Constitucional', { delay: 50 })
    await delay(500)

    // Press Enter or click search button
    await page.keyboard.press('Enter')
    console.log('[Nexus] Search submitted, waiting for results...')
    await delay(5000)
    await page.screenshot({ path: join(__dirname, '..', 'data', 'nexus-results.png') })

    // Try to extract results
    const bodyText = await page.evaluate(() => document.body.innerText)
    writeFileSync(
      join(__dirname, '..', 'data', 'nexus-results-text.txt'),
      bodyText,
      'utf-8'
    )
    console.log(`[Nexus] Page text saved (${bodyText.length} chars)`)

    // Extract all links that look like vote results
    const nexusLinks = await page.$$eval('a[href]', (anchors) =>
      anchors.map(a => ({
        text: a.textContent?.trim() || '',
        href: a.getAttribute('href') || '',
      }))
    )

    const votoPattern = /(\d{4}[-–]\d+)/
    for (const nl of nexusLinks) {
      const match = nl.text.match(votoPattern) || nl.href.match(votoPattern)
      if (match) {
        results.push({
          votoNumero: match[1],
          resumen: nl.text.substring(0, 200),
          url: nl.href.startsWith('http') ? nl.href : `https://nexuspj.poder-judicial.go.cr${nl.href}`,
          source: 'NexusPJ',
        })
      }
    }
    console.log(`[Nexus] Extracted ${results.length} vote links`)

    // Try clicking through pages if there's pagination
    let pageNum = 1
    while (pageNum < 5) {
      const nextBtn = await page.$('a[aria-label="Next"], button:has-text("Siguiente"), .pagination .next a, a:has-text(">")')
      if (!nextBtn) break
      pageNum++
      console.log(`[Nexus] Going to page ${pageNum}...`)
      await nextBtn.click()
      await delay(3000)

      const moreLinks = await page.$$eval('a[href]', (anchors) =>
        anchors.map(a => ({
          text: a.textContent?.trim() || '',
          href: a.getAttribute('href') || '',
        }))
      )

      for (const nl of moreLinks) {
        const match = nl.text.match(votoPattern) || nl.href.match(votoPattern)
        if (match && !results.find(r => r.votoNumero === match[1])) {
          results.push({
            votoNumero: match[1],
            resumen: nl.text.substring(0, 200),
            url: nl.href.startsWith('http') ? nl.href : `https://nexuspj.poder-judicial.go.cr${nl.href}`,
            source: 'NexusPJ',
          })
        }
      }
    }

    // Also try a more specific search
    console.log('[Nexus] Trying advanced search...')
    await page.goto('https://nexuspj.poder-judicial.go.cr/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })
    await delay(2000)

    // Click "Búsqueda Avanzada"
    const advLink = await page.$('a[href*="avanzada"], a:has-text("Avanzada")')
    if (advLink) {
      await advLink.click()
      await delay(3000)
      await page.screenshot({ path: join(__dirname, '..', 'data', 'nexus-advanced.png') })
      console.log('[Nexus] Advanced search screenshot saved')
    }
  } else {
    console.log('[Nexus] Could not find search input')
    await page.screenshot({ path: join(__dirname, '..', 'data', 'nexus-no-input.png') })
  }

  return results
}

async function main() {
  let allResults: VotoResult[] = []
  if (existsSync(OUTPUT_FILE)) {
    allResults = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'))
    console.log(`Loaded ${allResults.length} existing results`)
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox'],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(15000)

  try {
    // 1. Scrape from SCIJ
    const scijResults = await scrapeFromSCIJ(page)
    console.log(`\n[SCIJ] Total: ${scijResults.length} votes found`)
    allResults.push(...scijResults)

    // 2. Scrape from Nexus PJ
    const nexusResults = await scrapeFromNexusPJ(page)
    console.log(`\n[Nexus] Total: ${nexusResults.length} votes found`)
    allResults.push(...nexusResults)

    // Deduplicate
    const seen = new Set<string>()
    allResults = allResults.filter(r => {
      const key = r.votoNumero.replace('–', '-')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    console.log(`\n=== Total unique votes: ${allResults.length} ===`)
    for (const r of allResults) {
      console.log(`  ${r.votoNumero} (${r.source}): ${r.url.substring(0, 80)}`)
    }

  } catch (err) {
    console.error('Error:', err)
  }

  // Save results
  writeFileSync(OUTPUT_FILE, JSON.stringify(allResults, null, 2), 'utf-8')
  console.log(`\nSaved ${allResults.length} results to ${OUTPUT_FILE}`)

  // Keep browser open for manual inspection
  console.log('\nBrowser stays open. Close it or press Ctrl+C when done.')
  await new Promise<void>(resolve => {
    browser.on('disconnected', resolve)
    process.on('SIGINT', async () => {
      await browser.close()
      resolve()
    })
  })
}

main().catch(console.error)
