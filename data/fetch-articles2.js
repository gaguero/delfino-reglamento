const https = require('https');
const http = require('http');
const fs = require('fs');

function fetch(url, cookies = '') {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CR,es;q=0.9,en;q=0.5',
        'Cookie': cookies,
        'Referer': 'https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=46479&nValor3=145323&strTipM=TC'
      },
      rejectUnauthorized: false
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const setCookies = res.headers['set-cookie'] || [];
        resolve({ html: data, status: res.statusCode, cookies: setCookies, headers: res.headers });
      });
    });
    req.on('error', err => resolve({ html: '', error: err.message }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ html: '', error: 'timeout' }); });
  });
}

async function main() {
  // Step 1: Visit the full text page to get session cookies
  console.log('Step 1: Getting session cookies from full text page...');
  const mainPage = await fetch('https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=46479&nValor3=145323&strTipM=TC');

  console.log('Status:', mainPage.status);
  console.log('Set-Cookie headers:', mainPage.cookies?.length || 0);
  console.log('HTML length:', mainPage.html?.length || 0);

  // Extract cookies
  const cookieStr = (mainPage.cookies || []).map(c => c.split(';')[0]).join('; ');
  console.log('Cookies:', cookieStr);

  // Check if we got article content in the full text
  const hasArt83 = mainPage.html.includes('83');
  console.log('Contains "83":', hasArt83);

  // Save a sample of the HTML to understand the structure
  if (mainPage.html) {
    // Find where the content ends
    const lastArt = mainPage.html.lastIndexOf('ARTICULO');
    const lastArtAlt = mainPage.html.lastIndexOf('Artículo');
    console.log('Last ARTICULO at position:', lastArt, 'of', mainPage.html.length);
    console.log('Last Artículo at position:', lastArtAlt);

    // Show what's around the last article reference
    if (lastArt > 0) {
      console.log('Context around last ARTICULO:', mainPage.html.substring(lastArt, lastArt + 200));
    }

    // Check for article 83 specifically
    const art83Pos = mainPage.html.indexOf('83.');
    if (art83Pos > 0) {
      // Find surrounding context
      const nearbyArt = mainPage.html.lastIndexOf('ARTICULO', art83Pos);
      if (nearbyArt > 0 && art83Pos - nearbyArt < 200) {
        console.log('\nArt 83 context:', mainPage.html.substring(nearbyArt, nearbyArt + 500));
      }
    }
  }

  // Step 2: Try fetching an individual article with cookies
  console.log('\nStep 2: Trying individual article with cookies...');
  const art = await fetch('https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_articulo.aspx?param1=NRA&nValor1=1&nValor2=46479&nValor3=145323&nValor5=90', cookieStr);
  console.log('Article page status:', art.status);
  console.log('Article HTML length:', art.html?.length || 0);

  const artHasContent = art.html.includes('ARTICULO') || art.html.includes('Artículo');
  console.log('Has article content:', artHasContent);

  if (artHasContent) {
    const match = art.html.match(/(ARTICULO|Artículo)[\s\S]{0,500}/);
    if (match) console.log('Article snippet:', match[0].substring(0, 300));
  }

  // Save full HTML for inspection
  fs.writeFileSync('C:\\Users\\jovy2\\delfino-reglamento\\data\\debug_fulltext.html', mainPage.html || '');
  fs.writeFileSync('C:\\Users\\jovy2\\delfino-reglamento\\data\\debug_article90.html', art.html || '');
  console.log('\nSaved debug files');
}

main().catch(console.error);
