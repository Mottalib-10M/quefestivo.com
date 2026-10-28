#!/usr/bin/env python3
"""Fiestas nacionales y autonómicas desde la resolución anual de la Dirección General de Trabajo (BOE).

Uso : python3 scripts/datos/build-festivos.py          (descarga el XML del BOE si no está en .cache-raw/)
Escribe src/data/festivos.json. Rejouable : la misma resolución da el mismo fichero.
Las fiestas insulares de Canarias y la fiesta de Arán vienen de las notas de la propia resolución
(se transcriben a mano abajo, con la referencia del decreto que citan).
"""
import json, os, re, html, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RES = {
    2026: {'id': 'BOE-A-2025-21667', 'titulo': 'Resolución de 17 de octubre de 2025, de la Dirección General de Trabajo, por la que se publica la relación de fiestas laborales para el año 2026', 'boe': 'BOE núm. 259, de 28 de octubre de 2025', 'fecha': '2025-10-28'},
    2027: {'id': 'BOE-A-2026-21254', 'titulo': 'Resolución de 8 de octubre de 2026, de la Dirección General de Trabajo, por la que se publica relación de fiestas laborales para el año 2027', 'boe': 'BOE núm. 254, de 13 de octubre de 2026', 'fecha': '2026-10-13'},
}
CCAA = ['andalucia', 'aragon', 'asturias', 'baleares', 'canarias', 'cantabria', 'castilla-la-mancha', 'castilla-y-leon', 'cataluna',
        'extremadura', 'galicia', 'madrid', 'murcia', 'navarra', 'pais-vasco', 'la-rioja', 'valenciana', 'ceuta', 'melilla']
MESES = {'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12}
# Nombre en inglés (para la versión inglesa del sitio), por el nombre del BOE sin el punto final.
EN = {
    'Año Nuevo': "New Year's Day", 'Epifanía del Señor': 'Epiphany (Three Kings)', 'Día de Andalucía': 'Andalusia Day',
    'Lunes siguiente al Día de les Illes Balears': 'Monday after Balearic Islands Day', 'Día de les Illes Balears': 'Balearic Islands Day',
    'San José': "St Joseph's Day", 'Fiesta del Eid Fitr': 'Eid al-Fitr', 'Jueves Santo': 'Maundy Thursday', 'Viernes Santo': 'Good Friday',
    'Lunes de Pascua': 'Easter Monday', 'San Jorge/Día de Aragón': "St George's Day / Aragon Day", 'Fiesta de Castilla y León': 'Castile and León Day',
    'Fiesta del Trabajo': 'Labour Day', 'Fiesta de la Comunidad de Madrid': 'Madrid Region Day', 'Fiesta Sacrificio-Eidul Adha': 'Eid al-Adha',
    'Fiesta Sacrificio-Aid al Adha': 'Eid al-Adha', 'Fiesta Sacrificio-Aid Al Adha': 'Eid al-Adha', 'Eidul Adha-Fiesta Sacrificio': 'Eid al-Adha',
    'Día de Canarias': 'Canary Islands Day', 'Corpus Christi': 'Corpus Christi', 'Día de la Región de Murcia': 'Murcia Region Day',
    'Día de la Rioja': 'La Rioja Day', 'Día de La Rioja': 'La Rioja Day', 'San Juan': "St John's Day", 'Día de San Juan': "St John's Day",
    'Santiago Apóstol/Día Nacional de Galicia': "St James's Day / Galicia Day", 'Día de las Instituciones de Cantabria': 'Cantabria Institutions Day',
    'Nuestra Señora de África': 'Our Lady of Africa', 'Asunción de la Virgen': 'Assumption Day', 'Lunes siguiente a asunción de la Virgen': 'Monday after Assumption Day',
    'Día de Ceuta': 'Ceuta Day', 'Día de Asturias': 'Asturias Day', 'Día de Extremadura': 'Extremadura Day', 'Fiesta Nacional de Cataluña': 'National Day of Catalonia',
    'La Bien Aparecida': 'La Bien Aparecida', 'Día de la Comunitat Valenciana': 'Valencian Community Day', 'Fiesta Nacional de España': 'National Day of Spain',
    'Día siguiente a Todos los Santos': "Day after All Saints' Day", 'Todos los Santos': "All Saints' Day",
    'Lunes siguiente al Día de la Constitución Española': 'Monday after Constitution Day', 'Día de la Constitución Española': 'Constitution Day',
    'Inmaculada Concepción': 'Immaculate Conception', 'Natividad del Señor': 'Christmas Day', 'San Esteban': "St Stephen's Day",
    'Día de las Letras Gallegas': 'Galician Literature Day', 'Día de Castilla-La Mancha': 'Castilla-La Mancha Day',
    'Aniversario 1er Gobierno Euskadi': 'Anniversary of the first Basque Government', 'Sustitución 15 de agosto': 'Replaces 15 August (Assumption)',
}
TIPO = {'*': 'nacional', '**': 'nacional-no-sustituida', '***': 'autonomica'}
# Notas de la resolución : fiestas insulares de Canarias (decreto citado en la nota 1) y fiesta de Arán (nota 2).
ISLAS = {
    2026: {'ref': 'Decreto 61/2025, de 28 de abril (BOC de 5 de mayo de 2025)', 'fiestas': {
        'el-hierro': ('2026-09-24', 'Nuestra Señora de los Reyes', 'Our Lady of the Kings'), 'fuerteventura': ('2026-09-18', 'Nuestra Señora de la Peña', 'Our Lady of La Peña'),
        'gran-canaria': ('2026-09-08', 'Nuestra Señora del Pino', 'Our Lady of El Pino'), 'la-gomera': ('2026-10-05', 'Nuestra Señora de Guadalupe', 'Our Lady of Guadalupe'),
        'la-palma': ('2026-08-05', 'Nuestra Señora de las Nieves', 'Our Lady of the Snows'), 'lanzarote': ('2026-09-15', 'Nuestra Señora de los Volcanes', 'Our Lady of the Volcanoes'),
        'tenerife': ('2026-02-02', 'Virgen de la Candelaria', 'Our Lady of Candelaria')}},
    2027: {'ref': 'Decreto 115/2026, de 29 de junio (BOC de 3 de julio de 2026)', 'fiestas': {
        'el-hierro': ('2027-09-24', 'Nuestra Señora de los Reyes', 'Our Lady of the Kings'), 'fuerteventura': ('2027-09-17', 'Nuestra Señora de la Peña', 'Our Lady of La Peña'),
        'gran-canaria': ('2027-09-08', 'Nuestra Señora del Pino', 'Our Lady of El Pino'), 'la-gomera': ('2027-10-04', 'Nuestra Señora de Guadalupe', 'Our Lady of Guadalupe'),
        'la-palma': ('2027-08-05', 'Nuestra Señora de las Nieves', 'Our Lady of the Snows'), 'lanzarote': ('2027-09-15', 'Nuestra Señora de los Volcanes', 'Our Lady of the Volcanoes'),
        'tenerife': ('2027-02-02', 'Virgen de la Candelaria', 'Our Lady of Candelaria')}},
}
ARAN = {
    2026: {'ref': 'Orden EMT/66/2025, de 30 de abril (DOGC de 6 de mayo de 2025)', 'quita': '2026-12-26', 'pone': '2026-06-17'},
    2027: {'ref': 'Orden EMT/52/2026, de 25 de marzo (DOGC de 1 de abril de 2026)', 'quita': '2027-03-29', 'pone': '2027-06-17'},
}

def leer(year):
    p = os.path.join(ROOT, '.cache-raw', f'boe-fiestas-{year}.xml')
    if not os.path.exists(p):
        subprocess.run(['curl', '-s', '-A', 'Mozilla/5.0', '-o', p, f"https://www.boe.es/diario_boe/xml.php?id={RES[year]['id']}"], check=True)
    return open(p, encoding='utf-8').read()

def filas(t):
    for r in re.findall(r'<tr[^>]*>(.*?)</tr>', t, flags=re.S):
        yield [html.unescape(re.sub(r'<[^>]+>', '', c)).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, flags=re.S)]

out = {'fuente': 'Resoluciones anuales de la Dirección General de Trabajo (BOE), art. 45.4 RD 2001/1983', 'ccaa': CCAA, 'years': {}}
for year in RES:
    mes, items = None, []
    for c in filas(leer(year)):
        if len(c) != 20: continue
        head = c[0]
        if head.lower() in MESES: mes = MESES[head.lower()]; continue
        m = re.match(r'^(\d{1,2})\s+(.+?)\.?$', head)
        if not m or not mes: continue
        nombre = m.group(2).strip()
        if nombre not in EN: sys.exit(f'Sin traducción: {nombre!r}')
        ambito = {CCAA[i]: TIPO[x] for i, x in enumerate(c[1:]) if x in TIPO}
        items.append({'fecha': f'{year}-{mes:02d}-{int(m.group(1)):02d}', 'es': nombre, 'en': EN[nombre], 'ccaa': ambito})
    # Control : cada comunidad tiene 12 fiestas (13 o 14 si añade una recuperable) ; Canarias 11 + insular.
    for i, cc in enumerate(CCAA):
        n = sum(1 for x in items if cc in x['ccaa']) + (1 if cc == 'canarias' else 0)
        if n not in (12, 13, 14): sys.exit(f'{year} {cc}: {n} fiestas')
    out['years'][str(year)] = {**RES[year], 'url': f"https://www.boe.es/diario_boe/txt.php?id={RES[year]['id']}", 'fiestas': items,
                               'islas': {'ref': ISLAS[year]['ref'], 'fiestas': {k: {'fecha': v[0], 'es': v[1], 'en': v[2]} for k, v in ISLAS[year]['fiestas'].items()}},
                               'aran': ARAN[year]}
json.dump(out, open(os.path.join(ROOT, 'src/data/festivos.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', {y: len(v['fiestas']) for y, v in out['years'].items()})
