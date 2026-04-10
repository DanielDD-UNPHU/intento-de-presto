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

    // S1 > Bloque A > A03 Movimientos de Tierra
    c('S1-A-A03', 'A03', 'MOVIMIENTOS DE TIERRA Y DEMOLICIONES', 'Capitulo', 'S1-BA', ['S1-A-A03-01','S1-A-A03-02','S1-A-A03-03']),
    c('S1-A-A03-01', 'A030000', 'Desmonte de vegetacion terreno', 'Partida', 'S1-A-A03', [], 'M2', 2400, 12.17, 13, 0),
    c('S1-A-A03-02', 'A030100', 'Demolicion elementos hormigon con compresor', 'Maquinaria', 'S1-A-A03', [], 'M3', 320, 4000, 4200, 0),
    c('S1-A-A03-03', 'A030300', 'Bote de material con camion volteo', 'Maquinaria', 'S1-A-A03', [], 'M3', 3800, 1200, 1260, 0),

    // S1 > Bloque A > A04 Hormigon (Fundaciones)
    c('S1-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'S1-BA', ['S1-A-A04-01','S1-A-A04-02','S1-A-A04-03']),
    c('S1-A-A04-01', 'A040000', 'Zapatas muros hormigon industrial 180kg/cm2', 'Partida', 'S1-A-A04', [], 'M3', 520, 16129, 16935, 0),
    c('S1-A-A04-02', 'A040100', 'Zapatas columnas hormigon industrial 210kg/cm2', 'Partida', 'S1-A-A04', [], 'M3', 280, 16459, 17280, 0),
    c('S1-A-A04-03', 'A040200', 'Vigas de amarre fundacion 210kg/cm2', 'Partida', 'S1-A-A04', [], 'M3', 185, 14755, 15490, 0),

    // S1 > Bloque B > A03
    c('S1-B-A03', 'A03', 'MOVIMIENTOS DE TIERRA Y DEMOLICIONES', 'Capitulo', 'S1-BB', ['S1-B-A03-01']),
    c('S1-B-A03-01', 'A030000', 'Desmonte de vegetacion terreno', 'Partida', 'S1-B-A03', [], 'M2', 1600, 12.17, 13, 0),

    // ══════════════════════════════════════
    // PLANTA BAJA
    // ══════════════════════════════════════
    c('PB-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-PB', ['PB-A-A04','PB-A-A06','PB-A-A09','PB-A-A15']),
    c('PB-BB', 'BLQ-B', 'BLOQUE B', 'Capitulo', 'N-PB', ['PB-B-A04']),
    c('PB-BC', 'BLQ-C', 'AREAS COMUNES', 'Capitulo', 'N-PB', ['PB-C-A21']),

    // PB > Bloque A > A04 Hormigon (Estructura)
    c('PB-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'PB-BA', ['PB-A-A04-01','PB-A-A04-02','PB-A-A04-03']),
    c('PB-A-A04-01', 'A040200', 'Columnas hormigon industrial 280kg/cm2', 'Partida', 'PB-A-A04', [], 'M3', 65, 15800, 16590, 0),
    c('PB-A-A04-02', 'A040300', 'Vigas hormigon industrial 280kg/cm2', 'Partida', 'PB-A-A04', [], 'M3', 85, 14500, 15225, 0),
    c('PB-A-A04-03', 'A040400', 'Losa maciza hormigon industrial 280kg/cm2', 'Partida', 'PB-A-A04', [], 'M3', 120, 13200, 13860, 0),

    // PB > Bloque A > A06 Mamposteria
    c('PB-A-A06', 'A06', 'MAMPOSTERIA', 'Capitulo', 'PB-BA', ['PB-A-A06-01','PB-A-A06-02']),
    c('PB-A-A06-01', 'A060201', 'Muro bloque 6" con fino ambas caras', 'Partida', 'PB-A-A06', [], 'M2', 380, 2800, 2940, 0),
    c('PB-A-A06-02', 'A060301', 'Muro bloque 4" divisorio con fino', 'Partida', 'PB-A-A06', [], 'M2', 520, 1950, 2050, 0),

    // PB > Bloque A > A09 Pisos
    c('PB-A-A09', 'A09', 'PISOS', 'Capitulo', 'PB-BA', ['PB-A-A09-01','PB-A-A09-02']),
    c('PB-A-A09-01', 'A090120', 'Ceramica europea buena calidad', 'Material', 'PB-A-A09', [], 'M2', 280, 2823.74, 2965, 0),
    c('PB-A-A09-02', 'A090100', 'Adoquin barahona gris', 'Material', 'PB-A-A09', [], 'M2', 150, 1951.72, 2050, 0),

    // PB > Bloque A > A15 Instalaciones Sanitarias
    c('PB-A-A15', 'A15', 'INSTALACIONES SANITARIAS', 'Capitulo', 'PB-BA', ['PB-A-A15-01','PB-A-A15-02']),
    c('PB-A-A15-01', 'A150100', 'Salida agua potable 1/2" polietileno', 'Partida', 'PB-A-A15', [], 'UND', 24, 2371.94, 2490, 0),
    c('PB-A-A15-02', 'A150110', 'Salida sanitaria A.N. PVC 4" aerea', 'Partida', 'PB-A-A15', [], 'UND', 16, 3124.21, 3280, 0),

    // PB > Bloque B > A04 Hormigon
    c('PB-B-A04', 'A04', 'HORMIGON', 'Capitulo', 'PB-BB', ['PB-B-A04-01','PB-B-A04-02']),
    c('PB-B-A04-01', 'A040200', 'Columnas hormigon industrial 280kg/cm2', 'Partida', 'PB-B-A04', [], 'M3', 42, 15800, 16590, 0),
    c('PB-B-A04-02', 'A040300', 'Vigas hormigon industrial 280kg/cm2', 'Partida', 'PB-B-A04', [], 'M3', 56, 14500, 15225, 0),

    // PB > Areas Comunes > A21 Parqueos y Vias
    c('PB-C-A21', 'A21', 'PARQUEOS Y VIAS', 'Capitulo', 'PB-BC', ['PB-C-A21-01','PB-C-A21-02']),
    c('PB-C-A21-01', 'A210100', 'Pavimento hormigon vehicular', 'Partida', 'PB-C-A21', [], 'M2', 1200, 2800, 2940, 0),
    c('PB-C-A21-02', 'A210200', 'Aceras peatonales hormigon', 'Partida', 'PB-C-A21', [], 'M2', 480, 1800, 1890, 0),

    // ══════════════════════════════════════
    // NIVEL 1 (el más completo)
    // ══════════════════════════════════════
    c('N1-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-1', ['N1-A-A04','N1-A-A06','N1-A-A07','N1-A-A09','N1-A-A15','N1-A-A17','N1-A-A19']),
    c('N1-BB', 'BLQ-B', 'BLOQUE B', 'Capitulo', 'N-1', ['N1-B-A04']),

    // N1 > Bloque A > A04 Hormigon
    c('N1-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'N1-BA', ['N1-A-A04-01','N1-A-A04-02','N1-A-A04-03']),
    c('N1-A-A04-01', 'A040200', 'Columnas hormigon industrial 350kg/cm2', 'Partida', 'N1-A-A04', [], 'M3', 52, 15800, 16590, 0),
    c('N1-A-A04-02', 'A040300', 'Vigas hormigon industrial 280kg/cm2', 'Partida', 'N1-A-A04', [], 'M3', 78, 14500, 15225, 0),
    c('N1-A-A04-03', 'A040400', 'Losa maciza hormigon industrial 280kg/cm2', 'Partida', 'N1-A-A04', [], 'M3', 110, 13200, 13860, 0),

    // N1 > Bloque A > A06 Mamposteria
    c('N1-A-A06', 'A06', 'MAMPOSTERIA', 'Capitulo', 'N1-BA', ['N1-A-A06-01','N1-A-A06-02','N1-A-A06-03']),
    c('N1-A-A06-01', 'A060201', 'Muro bloque 6" con fino ambas caras', 'Partida', 'N1-A-A06', [], 'M2', 420, 2800, 2940, 0),
    c('N1-A-A06-02', 'A060301', 'Muro bloque 4" divisorio con fino', 'Partida', 'N1-A-A06', [], 'M2', 680, 1950, 2050, 0),
    c('N1-A-A06-03', 'A060101', 'Mortero 1:3 para bloques', 'Material', 'N1-A-A06', [], 'M3', 45, 8620, 9050, 0),

    // N1 > Bloque A > A07 Terminaciones de Superficie
    c('N1-A-A07', 'A07', 'TERMINACIONES DE SUPERFICIE', 'Capitulo', 'N1-BA', ['N1-A-A07-01','N1-A-A07-02']),
    c('N1-A-A07-01', 'A070110', 'Fraguache con llana', 'Partida', 'N1-A-A07', [], 'M2', 4200, 107.10, 112, 0),
    c('N1-A-A07-02', 'A070300', 'Panete mezcla 1:4 en paredes', 'Partida', 'N1-A-A07', [], 'M2', 3600, 520, 546, 0),

    // N1 > Bloque A > A09 Pisos
    c('N1-A-A09', 'A09', 'PISOS', 'Capitulo', 'N1-BA', ['N1-A-A09-01','N1-A-A09-02','N1-A-A09-03']),
    c('N1-A-A09-01', 'A090110', 'Ceramica europea economica', 'Material', 'N1-A-A09', [], 'M2', 1800, 2427.74, 2550, 0),
    c('N1-A-A09-02', 'A090120', 'Ceramica europea buena calidad', 'Material', 'N1-A-A09', [], 'M2', 5400, 2823.74, 2965, 0),
    c('N1-A-A09-03', 'A090100', 'Adoquin barahona gris areas comunes', 'Material', 'N1-A-A09', [], 'M2', 320, 1951.72, 2050, 0),

    // N1 > Bloque A > A15 Instalaciones Sanitarias
    c('N1-A-A15', 'A15', 'INSTALACIONES SANITARIAS', 'Capitulo', 'N1-BA', ['N1-A-A15-01','N1-A-A15-02','N1-A-A15-03']),
    c('N1-A-A15-01', 'A150100', 'Salida agua potable 1/2" polietileno', 'Partida', 'N1-A-A15', [], 'UND', 48, 2371.94, 2490, 0),
    c('N1-A-A15-02', 'A150110', 'Salida sanitaria A.N. PVC 4" aerea', 'Partida', 'N1-A-A15', [], 'UND', 36, 3124.21, 3280, 0),
    c('N1-A-A15-03', 'A150111', 'Salida sanitaria A.N. PVC 4" tierra', 'Partida', 'N1-A-A15', [], 'UND', 12, 3258.76, 3420, 0),

    // N1 > Bloque A > A17 Instalaciones Electricas
    c('N1-A-A17', 'A17', 'INSTALACIONES ELECTRICAS', 'Capitulo', 'N1-BA', ['N1-A-A17-01','N1-A-A17-02','N1-A-A17-03']),
    c('N1-A-A17-01', 'A170100', 'Luz cenital', 'Partida', 'N1-A-A17', [], 'UND', 96, 2458.69, 2580, 0),
    c('N1-A-A17-02', 'A170101', 'Luz de pared', 'Partida', 'N1-A-A17', [], 'UND', 48, 2552.41, 2680, 0),
    c('N1-A-A17-03', 'A170110', 'Interruptor sencillo', 'Partida', 'N1-A-A17', [], 'UND', 72, 2135.89, 2240, 0),

    // N1 > Bloque A > A19 Pinturas
    c('N1-A-A19', 'A19', 'PINTURAS', 'Capitulo', 'N1-BA', ['N1-A-A19-01','N1-A-A19-02']),
    c('N1-A-A19-01', 'A190100', 'Pintura economica interior/exterior', 'Partida', 'N1-A-A19', [], 'M2', 4200, 202.55, 213, 0),
    c('N1-A-A19-02', 'A190110', 'Primer acrilico contractor', 'Material', 'N1-A-A19', [], 'M2', 4200, 160.91, 169, 0),

    // N1 > Bloque B > A04 Hormigon
    c('N1-B-A04', 'A04', 'HORMIGON', 'Capitulo', 'N1-BB', ['N1-B-A04-01']),
    c('N1-B-A04-01', 'A040200', 'Columnas hormigon industrial 350kg/cm2', 'Partida', 'N1-B-A04', [], 'M3', 38, 15800, 16590, 0),

    // ══════════════════════════════════════
    // NIVEL 2
    // ══════════════════════════════════════
    c('N2-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-2', ['N2-A-A04','N2-A-A09']),

    c('N2-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'N2-BA', ['N2-A-A04-01','N2-A-A04-02','N2-A-A04-03']),
    c('N2-A-A04-01', 'A040200', 'Columnas hormigon industrial 350kg/cm2', 'Partida', 'N2-A-A04', [], 'M3', 48, 15800, 16590, 0),
    c('N2-A-A04-02', 'A040300', 'Vigas hormigon industrial 280kg/cm2', 'Partida', 'N2-A-A04', [], 'M3', 72, 14500, 15225, 0),
    c('N2-A-A04-03', 'A040400', 'Losa maciza hormigon industrial 280kg/cm2', 'Partida', 'N2-A-A04', [], 'M3', 105, 13200, 13860, 0),

    c('N2-A-A09', 'A09', 'PISOS', 'Capitulo', 'N2-BA', ['N2-A-A09-01']),
    c('N2-A-A09-01', 'A090120', 'Ceramica europea buena calidad', 'Material', 'N2-A-A09', [], 'M2', 5200, 2823.74, 2965, 0),

    // ══════════════════════════════════════
    // NIVEL 3
    // ══════════════════════════════════════
    c('N3-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-3', ['N3-A-A04']),
    c('N3-A-A04', 'A04', 'HORMIGON', 'Capitulo', 'N3-BA', ['N3-A-A04-01']),
    c('N3-A-A04-01', 'A040200', 'Columnas hormigon industrial 350kg/cm2', 'Partida', 'N3-A-A04', [], 'M3', 48, 15800, 16590, 0),

    // ══════════════════════════════════════
    // AZOTEA
    // ══════════════════════════════════════
    c('AZ-BA', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-AZ', ['AZ-A-A11','AZ-A-A19']),

    c('AZ-A-A11', 'A11', 'TERMINACION DE TECHOS', 'Capitulo', 'AZ-BA', ['AZ-A-A11-01','AZ-A-A11-02']),
    c('AZ-A-A11-01', 'A110100', 'Fino de techo mezcla cemento', 'Partida', 'AZ-A-A11', [], 'M2', 850, 320, 336, 0),
    c('AZ-A-A11-02', 'A110300', 'Impermeabilizante asfaltico techo', 'Partida', 'AZ-A-A11', [], 'M2', 850, 480, 504, 0),

    c('AZ-A-A19', 'A19', 'PINTURAS', 'Capitulo', 'AZ-BA', ['AZ-A-A19-01']),
    c('AZ-A-A19-01', 'A190100', 'Pintura economica exterior', 'Partida', 'AZ-A-A19', [], 'M2', 1800, 202.55, 213, 0),
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
