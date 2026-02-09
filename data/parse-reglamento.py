import re, json

# Read with proper encoding handling
with open(r'C:\Users\jovy2\delfino-reglamento\data\reglamento-fulltext.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix common PDF encoding issues (cp1252 -> utf8 mojibake)
replacements = {
    '\u00e1': 'á', '\u00e9': 'é', '\u00ed': 'í', '\u00f3': 'ó', '\u00fa': 'ú',
    '\u00c1': 'Á', '\u00c9': 'É', '\u00cd': 'Í', '\u00d3': 'Ó', '\u00da': 'Ú',
    '\u00f1': 'ñ', '\u00d1': 'Ñ', '\u00fc': 'ü', '\u00dc': 'Ü',
    '\u00bf': '¿', '\u00ab': '«', '\u00bb': '»',
    '\ufffd': '',  # replacement character
}
for old, new in replacements.items():
    text = text.replace(old, new)

# Skip the Table of Contents
second_primera = text.find('PRIMERA PARTE', text.find('PRIMERA PARTE') + 1)
if second_primera > 0:
    text = text[second_primera:]
    print(f'Skipped TOC, content starts ({len(text)} chars)')

# Clean up
text = text.replace('\r\n', '\n').replace('\r', '\n')

# Match articles: must be at start of line or after whitespace, with "ARTÍCULO X." format
# The key: articles in this PDF start with "ARTÍCULO" in uppercase at the beginning of a paragraph
pattern = r'\n\s*(?:ARTÍCULO|Artículo|ART[ÍI]CULO)\s+(\d+(?:\s*bis|\s*ter)?)\s*[\.\-–—]?\s*[\-–—]?\s*'

matches = list(re.finditer(pattern, text, re.IGNORECASE))
print(f'Found {len(matches)} article markers')

articles = []
seen = set()

for i, match in enumerate(matches):
    numero = re.sub(r'\s+', ' ', match.group(1)).strip()

    # Skip if already seen
    if numero in seen:
        continue
    seen.add(numero)

    # Get text between this article and the next
    start = match.end()
    end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
    body = text[start:end].strip()

    # Remove trailing structural headers
    body = re.split(r'\n\s*(?:PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|T[ÍI]TULO|CAP[ÍI]TULO|SECCI[ÓO]N|TRANSITORIOS?|DISPOSICI[ÓO]N)\b', body, flags=re.IGNORECASE)[0].strip()

    # Remove standalone page numbers
    body = re.sub(r'^\d{1,3}\s*$', '', body, flags=re.MULTILINE)
    body = re.sub(r'\n{3,}', '\n\n', body).strip()

    if len(body) < 10:
        continue

    # Extract nombre from first line
    lines = body.split('\n')
    nombre = lines[0].strip()
    nombre = re.sub(r'^[\-–—]\s*', '', nombre).strip()
    nombre = re.sub(r'\s*\.{3,}\s*\d*\s*$', '', nombre).strip()

    if len(nombre) > 150:
        period = nombre.find('.')
        if 0 < period < 150:
            nombre = nombre[:period].strip()
        else:
            nombre = nombre[:150].strip()

    articles.append({
        'numero': numero,
        'nombre': nombre,
        'textoLegal': body,
    })

# Sort by numeric article number
def sort_key(a):
    num = a['numero']
    base = int(re.match(r'\d+', num).group())
    suffix = 0
    if 'bis' in num.lower(): suffix = 1
    if 'ter' in num.lower(): suffix = 2
    return (base, suffix)

articles.sort(key=sort_key)

# Assign orden after sorting
for i, a in enumerate(articles):
    a['orden'] = i + 1

print(f'\nParsed {len(articles)} unique articles')

# Show first 10
for a in articles[:10]:
    print(f'  Art. {a["numero"]:>8} (orden {a["orden"]:>3}) - {a["nombre"][:60]}')

print('...')
for a in articles[-5:]:
    print(f'  Art. {a["numero"]:>8} (orden {a["orden"]:>3}) - {a["nombre"][:60]}')

# Now find transitorios
trans_start = text.lower().find('\ntransitorio')
if trans_start > 0:
    trans_text = text[trans_start:]
    trans_matches = list(re.finditer(r'TRANSITORIO\s+([IÚIVXLC]+|ÚNICO)\b', trans_text, re.IGNORECASE))
    print(f'\nFound {len(trans_matches)} transitorio markers')

    for i, m in enumerate(trans_matches):
        tnum = m.group(1).strip()
        tstart = m.end()
        tend = trans_matches[i+1].start() if i+1 < len(trans_matches) else len(trans_text)
        tbody = trans_text[tstart:tend].strip()
        tbody = re.sub(r'^\d{1,3}\s*$', '', tbody, flags=re.MULTILINE).strip()

        # Remove trailing structure
        tbody = re.split(r'\n\s*(?:ART[ÍI]CULO|NOTAS FINALES)', tbody, flags=re.IGNORECASE)[0].strip()

        if len(tbody) > 5:
            articles.append({
                'numero': f'T-{tnum}',
                'nombre': f'Transitorio {tnum}',
                'textoLegal': tbody,
                'orden': len(articles) + 1
            })
            print(f'  Transitorio {tnum}: {tbody[:80]}...')

# Save
with open(r'C:\Users\jovy2\delfino-reglamento\data\reglamento-articles.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f'\nTotal saved: {len(articles)} (articles + transitorios)')
