const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_articulo.aspx';

function fetchArticle(nValor5) {
  const url = `${BASE_URL}?param1=NRA&nValor1=1&nValor2=46479&nValor3=145323&nValor5=${nValor5}`;
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-CR,es;q=0.9'
      },
      rejectUnauthorized: false
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ nValor5, html: data, status: res.statusCode }));
    });
    req.on('error', err => resolve({ nValor5, html: '', error: err.message }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ nValor5, html: '', error: 'timeout' }); });
  });
}

function extractArticle(html) {
  // Look for article content patterns
  const artMatch = html.match(/ART[IÍ]CULO\s+(\d+[a-z]*(?:\s*bis|\s*ter)?)\s*[\.\-—–]+\s*([^\.<]*?)[\.\s]*(<[^>]*>)?([\s\S]*?)(?=<\/div>|<\/td>|ART[IÍ]CULO\s+\d)/i);
  if (artMatch) {
    return { numero: artMatch[1].trim(), nombre: artMatch[2].trim(), found: true };
  }

  // Try another pattern - look for Artículo in span/strong tags
  const spanMatch = html.match(/(?:Artículo|ARTICULO|ARTÍCULO)\s+(\d+[a-z]*(?:\s*bis|\s*ter)?)\s*[\.\-—–]\s*(?:<[^>]*>)*\s*([^<.]+)/i);
  if (spanMatch) {
    return { numero: spanMatch[1].trim(), nombre: spanMatch[2].trim(), found: true };
  }

  return { found: false };
}

function extractFullText(html) {
  // Remove script and style tags
  let clean = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Find the main content area - look for article text
  const contentMatch = clean.match(/id="TextoCompleto"[\s\S]*?>([\s\S]*?)<\/div>/i)
    || clean.match(/class="texto"[\s\S]*?>([\s\S]*?)<\/div>/i)
    || clean.match(/(ART[IÍ]CULO\s+\d+[\s\S]*?)(?:<\/td>|<\/div>)/i);

  if (contentMatch) {
    let text = contentMatch[1];
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  }
  return '';
}

async function main() {
  // Test range: nValor5 86 to 180 should cover articles 83-160ish
  // First, let's do a mapping scan
  console.log('Scanning nValor5 values 86-200...');

  const results = [];
  const BATCH_SIZE = 5;

  for (let start = 86; start <= 200; start += BATCH_SIZE) {
    const batch = [];
    for (let i = start; i < start + BATCH_SIZE && i <= 200; i++) {
      batch.push(fetchArticle(i));
    }
    const batchResults = await Promise.all(batch);

    for (const r of batchResults) {
      if (r.error) {
        console.log(`nValor5=${r.nValor5}: ERROR ${r.error}`);
        continue;
      }

      const hasArticle = r.html.includes('ARTICULO') || r.html.includes('Artículo') || r.html.includes('ARTÍCULO');
      const isHomePage = r.html.includes('Búsqueda Libre') && !hasArticle;

      if (isHomePage) {
        // Skip - redirected to homepage
        continue;
      }

      const info = extractArticle(r.html);
      const fullText = extractFullText(r.html);

      if (info.found) {
        console.log(`nValor5=${r.nValor5}: Article ${info.numero} - ${info.nombre}`);
        results.push({
          nValor5: r.nValor5,
          numero: info.numero,
          nombre: info.nombre,
          textoLegal: fullText,
          htmlLength: r.html.length
        });
      } else if (hasArticle) {
        console.log(`nValor5=${r.nValor5}: Has article content but couldn't parse`);
        // Save raw for debugging
        fs.writeFileSync(`C:\\Users\\jovy2\\delfino-reglamento\\data\\debug_${r.nValor5}.html`, r.html);
      }
    }

    // Small delay between batches
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nFound ${results.length} articles`);
  fs.writeFileSync('C:\\Users\\jovy2\\delfino-reglamento\\data\\scan-results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to scan-results.json');
}

main().catch(console.error);
