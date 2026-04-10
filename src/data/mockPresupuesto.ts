import type { ConceptoPresupuesto } from '../types';

function c(
  id: string, codigo: string, descripcion: string, tipo: ConceptoPresupuesto['tipo'],
  parentId: string | null, childrenIds: string[],
  unidad = '', cantidad = 0, precioRef = 0, precioInterno = 0, _precioCliente = 0
): Omit<ConceptoPresupuesto, 'nivel' | 'orden'> {
  return { id, codigo, descripcion, tipo, unidad, cantidad, precioRef, precioInterno, precioCliente: precioRef, parentId, childrenIds };
}

export function createMockPresupuesto(): Record<string, ConceptoPresupuesto> {
  const conceptos: Record<string, ConceptoPresupuesto> = {};

  // All codes and descriptions match exactly the ConstruCosto.do BC3 file (Marzo 2026)
  const items: Omit<ConceptoPresupuesto, 'nivel' | 'orden'>[] = [
    // ══════════════════════════════════════
    // NIVELES (raiz)
    // ══════════════════════════════════════
    c('N-S1', 'S1', 'SOTANO 1', 'Capitulo', null, ['S1-BA','S1-BB']),
    c('N-PB', 'PB', 'PLANTA BAJA', 'Capitulo', null, ['PB-BA','PB-BB','PB-BC']),
    c('N-1', 'N1', 'NIVEL 1', 'Capitulo', null, ['N1-BA','N1-BB']),
    c('N-2', 'N2', 'NIVEL 2', 'Capitulo', null, ['N2-BA']),
    c('N-3', 'N3', 'NIVEL 3', 'Capitulo', null, ['N3-BA']),
    c('N-AZ', 'AZ', 'AZOTEA', 'Capitulo', null, ['AZ-BA']),

    // ══════════════════════════════════════
    // SOTANO 1
    // ══════════════════════════════════════
    c('S1-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-S1', ['S1-A-A03','S1-A-A04']),
    c('S1-BB', 'BLQ-B', 'BLOQUE B', 'Capitulo', 'N-S1', ['S1-B-A03']),

    // S1 > BLQ A > A03 Movimientos de Tierra
    c('S1-A-A03', 'A03', 'MOVIMIENTOS DE TIERRA Y DEMOLICIONES', 'Capitulo', 'S1-BA', ['S1-A-A03-01','S1-A-A03-02','S1-A-A03-03']),
    c('S1-A-A03-01', 'A030000', 'Desmonte de vegetacion terreno', 'Partida', 'S1-A-A03', [], 'M2', 2400, 12.17, 13, 0),
    c('S1-A-A03-02', 'A030001', 'Extraccion capa vegetal e=0.20m', 'Partida', 'S1-A-A03', [], 'M2', 2400, 27.82, 29, 0),
    c('S1-A-A03-03', 'A030100', 'Demolicion elementos hormigon con compresor 185CFM', 'Maquinaria', 'S1-A-A03', [], 'M3', 320, 4000, 4200, 0),

    // S1 > BLQ A > A04 Hormigon (Zapatas)
    c('S1-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'S1-BA', ['S1-A-A04-01','S1-A-A04-02','S1-A-A04-03']),
    c('S1-A-A04-01', 'A040000', 'Zapatas muros 4" 0.30m x 0.20m hormigon industrial 180kg/cm2', 'Partida', 'S1-A-A04', [], 'M3', 180, 16129.03, 16935, 0),
    c('S1-A-A04-02', 'A040100', 'Zapatas columna 1.20m x 1.20m x 0.40m hormigon industrial 210kg/cm2', 'Partida', 'S1-A-A04', [], 'M3', 280, 13559.47, 14237, 0),
    c('S1-A-A04-03', 'A040401', 'Viga de amarre 15x20 4 3/8 - 3/8@0.20m 1:2:4 con ligadora', 'Partida', 'S1-A-A04', [], 'M3', 95, 47682.88, 50067, 0),

    // S1 > BLQ B > A03
    c('S1-B-A03', 'A03', 'MOVIMIENTOS DE TIERRA Y DEMOLICIONES', 'Capitulo', 'S1-BB', ['S1-B-A03-01']),
    c('S1-B-A03-01', 'A030000', 'Desmonte de vegetacion terreno', 'Partida', 'S1-B-A03', [], 'M2', 1600, 12.17, 13, 0),

    // ══════════════════════════════════════
    // PLANTA BAJA
    // ══════════════════════════════════════
    c('PB-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-PB', ['PB-A-A04','PB-A-A06','PB-A-A09','PB-A-A15']),
    c('PB-BB', 'BLQ-B', 'BLOQUE B', 'Capitulo', 'N-PB', ['PB-B-A04']),
    c('PB-BC', 'BLQ-C', 'AREAS COMUNES', 'Capitulo', 'N-PB', ['PB-C-A21']),

    // PB > BLQ A > A04 Hormigon (Columnas, Vigas, Losa)
    c('PB-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'PB-BA', ['PB-A-A04-01','PB-A-A04-02','PB-A-A04-03']),
    c('PB-A-A04-01', 'A040237', 'Columna 30x30 8 1/2 hormigon industrial 210kg/cm2', 'Partida', 'PB-A-A04', [], 'M3', 65, 54261.05, 56974, 0),
    c('PB-A-A04-02', 'A040401', 'Viga de amarre 15x20 4 3/8 - 3/8@0.20m 1:2:4 con ligadora', 'Partida', 'PB-A-A04', [], 'M3', 85, 47682.88, 50067, 0),
    c('PB-A-A04-03', 'A040803', 'Losa ha e=0.10m 3/8"@0.25m hormigon industrial 210kg/cm2', 'Partida', 'PB-A-A04', [], 'M3', 120, 27469.04, 28842, 0),

    // PB > BLQ A > A06 Mamposteria
    c('PB-A-A06', 'A06', 'MAMPOSTERIA', 'Capitulo', 'PB-BA', ['PB-A-A06-01','PB-A-A06-02']),
    c('PB-A-A06-01', 'A060220', 'Bloques hormigon de 6" - 3/8" @ 0.80m', 'Partida', 'PB-A-A06', [], 'M2', 380, 1715.44, 1801, 0),
    c('PB-A-A06-02', 'A060210', 'Bloques hormigon de 4" - 3/8" @ 0.80m', 'Partida', 'PB-A-A06', [], 'M2', 520, 1404.80, 1475, 0),

    // PB > BLQ A > A09 Pisos
    c('PB-A-A09', 'A09', 'PISOS', 'Capitulo', 'PB-BA', ['PB-A-A09-01','PB-A-A09-02']),
    c('PB-A-A09-01', 'A090120', 'Ceramica europea buena calidad', 'Material', 'PB-A-A09', [], 'M2', 280, 2823.74, 2965, 0),
    c('PB-A-A09-02', 'A090100', 'Adoquin barahona gris', 'Material', 'PB-A-A09', [], 'M2', 150, 1951.72, 2050, 0),

    // PB > BLQ A > A15 Instalaciones Sanitarias
    c('PB-A-A15', 'A15', 'INSTALACIONES SANITARIAS', 'Capitulo', 'PB-BA', ['PB-A-A15-01','PB-A-A15-02']),
    c('PB-A-A15-01', 'A150100', 'Salida agua pot. 1/2" - polietileno 18mm', 'Partida', 'PB-A-A15', [], 'UND', 24, 2371.94, 2490, 0),
    c('PB-A-A15-02', 'A150110', 'Salida sanitaria A.N. PVC 4" - aerea', 'Partida', 'PB-A-A15', [], 'UND', 16, 3124.21, 3280, 0),

    // PB > BLQ B > A04
    c('PB-B-A04', 'A04', 'HORMIGON', 'Capitulo', 'PB-BB', ['PB-B-A04-01','PB-B-A04-02']),
    c('PB-B-A04-01', 'A040237', 'Columna 30x30 8 1/2 hormigon industrial 210kg/cm2', 'Partida', 'PB-B-A04', [], 'M3', 42, 54261.05, 56974, 0),
    c('PB-B-A04-02', 'A040401', 'Viga de amarre 15x20 4 3/8 - 3/8@0.20m 1:2:4 con ligadora', 'Partida', 'PB-B-A04', [], 'M3', 56, 47682.88, 50067, 0),

    // PB > Areas Comunes > A21 Parqueos
    c('PB-C-A21', 'A21', 'PARQUEOS Y VIAS', 'Capitulo', 'PB-BC', ['PB-C-A21-01','PB-C-A21-02']),
    c('PB-C-A21-01', 'A210131', 'Conten pulido h=0.40m hormigon 1:2:4 con ligadora', 'Partida', 'PB-C-A21', [], 'ML', 240, 2335.70, 2452, 0),
    c('PB-C-A21-02', 'A210110', 'Acera hormigon violinada e=0.10m con ligadora', 'Partida', 'PB-C-A21', [], 'M2', 120, 2950, 3098, 0),

    // ══════════════════════════════════════
    // NIVEL 1 (el más completo)
    // ══════════════════════════════════════
    c('N1-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-1', ['N1-A-A04','N1-A-A06','N1-A-A07','N1-A-A09','N1-A-A15','N1-A-A17','N1-A-A19']),
    c('N1-BB', 'BLQ-B', 'BLOQUE B', 'Capitulo', 'N-1', ['N1-B-A04']),

    // N1 > BLQ A > A04 Hormigon
    c('N1-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'N1-BA', ['N1-A-A04-01','N1-A-A04-02','N1-A-A04-03']),
    c('N1-A-A04-01', 'A040237', 'Columna 30x30 8 1/2 hormigon industrial 210kg/cm2', 'Partida', 'N1-A-A04', [], 'M3', 52, 54261.05, 56974, 0),
    c('N1-A-A04-02', 'A040401', 'Viga de amarre 15x20 4 3/8 - 3/8@0.20m 1:2:4 con ligadora', 'Partida', 'N1-A-A04', [], 'M3', 78, 47682.88, 50067, 0),
    c('N1-A-A04-03', 'A040803', 'Losa ha e=0.10m 3/8"@0.25m hormigon industrial 210kg/cm2', 'Partida', 'N1-A-A04', [], 'M3', 110, 27469.04, 28842, 0),

    // N1 > BLQ A > A06 Mamposteria
    c('N1-A-A06', 'A06', 'MAMPOSTERIA', 'Capitulo', 'N1-BA', ['N1-A-A06-01','N1-A-A06-02','N1-A-A06-03']),
    c('N1-A-A06-01', 'A060220', 'Bloques hormigon de 6" - 3/8" @ 0.80m', 'Partida', 'N1-A-A06', [], 'M2', 420, 1715.44, 1801, 0),
    c('N1-A-A06-02', 'A060210', 'Bloques hormigon de 4" - 3/8" @ 0.80m', 'Partida', 'N1-A-A06', [], 'M2', 680, 1404.80, 1475, 0),
    c('N1-A-A06-03', 'A060101', 'Mortero 1:3 para bloques', 'Material', 'N1-A-A06', [], 'M3', 45, 8620.01, 9051, 0),

    // N1 > BLQ A > A07 Terminaciones de Superficie
    c('N1-A-A07', 'A07', 'TERMINACIONES DE SUPERFICIE', 'Capitulo', 'N1-BA', ['N1-A-A07-01','N1-A-A07-02']),
    c('N1-A-A07-01', 'A070110', 'Fraguache con llana', 'Partida', 'N1-A-A07', [], 'M2', 4200, 107.10, 112, 0),
    c('N1-A-A07-02', 'A070111', 'Panete maestreado - interior', 'Partida', 'N1-A-A07', [], 'M2', 3600, 539.44, 566, 0),

    // N1 > BLQ A > A09 Pisos
    c('N1-A-A09', 'A09', 'PISOS', 'Capitulo', 'N1-BA', ['N1-A-A09-01','N1-A-A09-02']),
    c('N1-A-A09-01', 'A090110', 'Ceramica europea economica', 'Material', 'N1-A-A09', [], 'M2', 5400, 2427.74, 2550, 0),
    c('N1-A-A09-02', 'A090120', 'Ceramica europea buena calidad', 'Material', 'N1-A-A09', [], 'M2', 1800, 2823.74, 2965, 0),

    // N1 > BLQ A > A15 Instalaciones Sanitarias
    c('N1-A-A15', 'A15', 'INSTALACIONES SANITARIAS', 'Capitulo', 'N1-BA', ['N1-A-A15-01','N1-A-A15-02','N1-A-A15-03']),
    c('N1-A-A15-01', 'A150100', 'Salida agua pot. 1/2" - polietileno 18mm', 'Partida', 'N1-A-A15', [], 'UND', 48, 2371.94, 2490, 0),
    c('N1-A-A15-02', 'A150110', 'Salida sanitaria A.N. PVC 4" - aerea', 'Partida', 'N1-A-A15', [], 'UND', 36, 3124.21, 3280, 0),
    c('N1-A-A15-03', 'A150111', 'Salida sanitaria A.N. PVC 4" - tierra', 'Partida', 'N1-A-A15', [], 'UND', 12, 3258.76, 3422, 0),

    // N1 > BLQ A > A17 Instalaciones Electricas
    c('N1-A-A17', 'A17', 'INSTALACIONES ELECTRICAS', 'Capitulo', 'N1-BA', ['N1-A-A17-01','N1-A-A17-02','N1-A-A17-03']),
    c('N1-A-A17-01', 'A170100', 'Luz cenital', 'Partida', 'N1-A-A17', [], 'UND', 96, 2458.69, 2582, 0),
    c('N1-A-A17-02', 'A170101', 'Luz de pared', 'Partida', 'N1-A-A17', [], 'UND', 48, 2552.41, 2680, 0),
    c('N1-A-A17-03', 'A170110', 'Interruptor sencillo', 'Partida', 'N1-A-A17', [], 'UND', 72, 2135.89, 2243, 0),

    // N1 > BLQ A > A19 Pinturas
    c('N1-A-A19', 'A19', 'PINTURAS', 'Capitulo', 'N1-BA', ['N1-A-A19-01','N1-A-A19-02']),
    c('N1-A-A19-01', 'A190100', 'Pintura economica int/ext', 'Partida', 'N1-A-A19', [], 'M2', 4200, 202.55, 213, 0),
    c('N1-A-A19-02', 'A190110', 'Primer acrilico contractor Tropical', 'Material', 'N1-A-A19', [], 'M2', 4200, 160.91, 169, 0),

    // N1 > BLQ B > A04
    c('N1-B-A04', 'A04', 'HORMIGON', 'Capitulo', 'N1-BB', ['N1-B-A04-01']),
    c('N1-B-A04-01', 'A040237', 'Columna 30x30 8 1/2 hormigon industrial 210kg/cm2', 'Partida', 'N1-B-A04', [], 'M3', 38, 54261.05, 56974, 0),

    // ══════════════════════════════════════
    // NIVEL 2
    // ══════════════════════════════════════
    c('N2-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-2', ['N2-A-A04','N2-A-A09']),
    c('N2-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'N2-BA', ['N2-A-A04-01','N2-A-A04-02','N2-A-A04-03']),
    c('N2-A-A04-01', 'A040237', 'Columna 30x30 8 1/2 hormigon industrial 210kg/cm2', 'Partida', 'N2-A-A04', [], 'M3', 48, 54261.05, 56974, 0),
    c('N2-A-A04-02', 'A040401', 'Viga de amarre 15x20 4 3/8 - 3/8@0.20m 1:2:4 con ligadora', 'Partida', 'N2-A-A04', [], 'M3', 72, 47682.88, 50067, 0),
    c('N2-A-A04-03', 'A040803', 'Losa ha e=0.10m 3/8"@0.25m hormigon industrial 210kg/cm2', 'Partida', 'N2-A-A04', [], 'M3', 105, 27469.04, 28842, 0),
    c('N2-A-A09', 'A09', 'PISOS', 'Capitulo', 'N2-BA', ['N2-A-A09-01']),
    c('N2-A-A09-01', 'A090120', 'Ceramica europea buena calidad', 'Material', 'N2-A-A09', [], 'M2', 5200, 2823.74, 2965, 0),

    // ══════════════════════════════════════
    // NIVEL 3
    // ══════════════════════════════════════
    c('N3-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-3', ['N3-A-A04']),
    c('N3-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'N3-BA', ['N3-A-A04-01']),
    c('N3-A-A04-01', 'A040237', 'Columna 30x30 8 1/2 hormigon industrial 210kg/cm2', 'Partida', 'N3-A-A04', [], 'M3', 48, 54261.05, 56974, 0),

    // ══════════════════════════════════════
    // AZOTEA
    // ══════════════════════════════════════
    c('AZ-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-AZ', ['AZ-A-A11','AZ-A-A19']),
    c('AZ-A-A11', 'A11', 'TERMINACION DE TECHOS', 'Capitulo', 'AZ-BA', ['AZ-A-A11-01','AZ-A-A11-02']),
    c('AZ-A-A11-01', 'A110100', 'Fino techo plano', 'Partida', 'AZ-A-A11', [], 'M2', 850, 869.44, 913, 0),
    c('AZ-A-A11-02', 'A110300', 'Impermeabilizante de techo tela asfaltica 3mm - todo costo', 'Partida', 'AZ-A-A11', [], 'M2', 850, 1100.90, 1156, 0),
    c('AZ-A-A19', 'A19', 'PINTURAS', 'Capitulo', 'AZ-BA', ['AZ-A-A19-01']),
    c('AZ-A-A19-01', 'A190100', 'Pintura economica int/ext', 'Partida', 'AZ-A-A19', [], 'M2', 1800, 202.55, 213, 0),
  ];

  function calcNivel(item: typeof items[0]): number {
    if (!item.parentId) return 0;
    const parent = items.find(i => i.id === item.parentId);
    return parent ? calcNivel(parent) + 1 : 0;
  }

  items.forEach((item) => {
    const siblings = items.filter(i => i.parentId === item.parentId);
    const orden = siblings.indexOf(item);
    conceptos[item.id] = { ...item, nivel: calcNivel(item), orden };
  });

  return conceptos;
}

export const mockRootIds = ['N-S1', 'N-PB', 'N-1', 'N-2', 'N-3', 'N-AZ'];
