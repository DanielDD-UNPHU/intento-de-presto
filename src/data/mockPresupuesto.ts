import type { ConceptoPresupuesto } from '../types';

function c(
  id: string, codigo: string, descripcion: string, tipo: ConceptoPresupuesto['tipo'],
  parentId: string | null, childrenIds: string[],
  unidad = '', cantidad = 0, precioRef = 0, precioInterno = 0, _precioCliente = 0
): Omit<ConceptoPresupuesto, 'nivel' | 'orden'> {
  // precioCliente = precioRef al inicio (son independientes pero arrancan iguales)
  return { id, codigo, descripcion, tipo, unidad, cantidad, precioRef, precioInterno, precioCliente: precioRef, parentId, childrenIds };
}

export function createMockPresupuesto(): Record<string, ConceptoPresupuesto> {
  const conceptos: Record<string, ConceptoPresupuesto> = {};

  const items: Omit<ConceptoPresupuesto, 'nivel' | 'orden'>[] = [
    // ══════════════════════════════════════
    // NIVELES (nivel 0) — padres principales
    // ══════════════════════════════════════
    c('N-S1', 'S1', 'SOTANO 1', 'Capitulo', null, ['S1-BLQ-A','S1-BLQ-B']),
    c('N-PB', 'PB', 'PLANTA BAJA', 'Capitulo', null, ['PB-BLQ-A','PB-BLQ-B','PB-BLQ-C']),
    c('N-1', 'N1', 'NIVEL 1', 'Capitulo', null, ['N1-BLQ-A','N1-BLQ-B']),
    c('N-2', 'N2', 'NIVEL 2', 'Capitulo', null, ['N2-BLQ-A']),
    c('N-3', 'N3', 'NIVEL 3', 'Capitulo', null, ['N3-BLQ-A']),
    c('N-AZ', 'AZ', 'AZOTEA', 'Capitulo', null, ['AZ-BLQ-A']),

    // ══════════════════════════════════════
    // SOTANO 1 → Bloques
    // ══════════════════════════════════════
    c('S1-BLQ-A', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-S1', ['S1-A-OG']),
    c('S1-BLQ-B', 'BLQ-B', 'BLOQUE B', 'Capitulo', 'N-S1', ['S1-B-OG']),

    // Sótano 1 > Bloque A > Obra Gruesa
    c('S1-A-OG', 'A', 'OBRA GRUESA', 'Capitulo', 'S1-BLQ-A', ['S1-A-OG-MT','S1-A-OG-FUN']),
    c('S1-A-OG-MT', 'A1', 'MOVIMIENTO DE TIERRAS', 'Capitulo', 'S1-A-OG', ['S1-A-OG-MT-01','S1-A-OG-MT-02']),
    c('S1-A-OG-MT-01', 'A1.01', 'Excavacion sotano con retroexcavadora', 'Maquinaria', 'S1-A-OG-MT', [], 'M3', 4200, 420, 450, 510),
    c('S1-A-OG-MT-02', 'A1.02', 'Bote de material excedente', 'Maquinaria', 'S1-A-OG-MT', [], 'M3', 3800, 380, 400, 450),
    c('S1-A-OG-FUN', 'A3', 'FUNDACIONES', 'Capitulo', 'S1-A-OG', ['S1-A-OG-FUN-01','S1-A-OG-FUN-02','S1-A-OG-FUN-03']),
    c('S1-A-OG-FUN-01', 'A3.01', 'Hormigon armado zapatas f\'c=280', 'Partida', 'S1-A-OG-FUN', [], 'M3', 520, 12500, 13200, 14850),
    c('S1-A-OG-FUN-02', 'A3.02', 'Acero de refuerzo grado 60 zapatas', 'Material', 'S1-A-OG-FUN', [], 'KG', 22000, 72, 76, 85),
    c('S1-A-OG-FUN-03', 'A3.03', 'Encofrado metalico fundaciones', 'Maquinaria', 'S1-A-OG-FUN', [], 'M2', 1400, 580, 620, 700),

    // Sótano 1 > Bloque B > Obra Gruesa
    c('S1-B-OG', 'A', 'OBRA GRUESA', 'Capitulo', 'S1-BLQ-B', ['S1-B-OG-MT']),
    c('S1-B-OG-MT', 'A1', 'MOVIMIENTO DE TIERRAS', 'Capitulo', 'S1-B-OG', ['S1-B-OG-MT-01']),
    c('S1-B-OG-MT-01', 'A1.01', 'Excavacion sotano con retroexcavadora', 'Maquinaria', 'S1-B-OG-MT', [], 'M3', 2800, 420, 450, 510),

    // ══════════════════════════════════════
    // PLANTA BAJA → Bloques
    // ══════════════════════════════════════
    c('PB-BLQ-A', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-PB', ['PB-A-OG','PB-A-TER','PB-A-SAN']),
    c('PB-BLQ-B', 'BLQ-B', 'BLOQUE B', 'Capitulo', 'N-PB', ['PB-B-OG']),
    c('PB-BLQ-C', 'BLQ-C', 'AREAS COMUNES', 'Capitulo', 'N-PB', ['PB-C-EXT']),

    // PB > Bloque A > Obra Gruesa
    c('PB-A-OG', 'A', 'OBRA GRUESA', 'Capitulo', 'PB-BLQ-A', ['PB-A-OG-EST','PB-A-OG-MAM']),
    c('PB-A-OG-EST', 'A4', 'ESTRUCTURA', 'Capitulo', 'PB-A-OG', ['PB-A-OG-EST-01','PB-A-OG-EST-02','PB-A-OG-EST-03']),
    c('PB-A-OG-EST-01', 'A4.01', 'Hormigon armado columnas f\'c=350', 'Partida', 'PB-A-OG-EST', [], 'M3', 65, 15800, 16700, 18800),
    c('PB-A-OG-EST-02', 'A4.02', 'Hormigon armado vigas f\'c=280', 'Partida', 'PB-A-OG-EST', [], 'M3', 85, 14500, 15300, 17200),
    c('PB-A-OG-EST-03', 'A4.03', 'Hormigon armado losa f\'c=280', 'Partida', 'PB-A-OG-EST', [], 'M3', 120, 13200, 13900, 15700),
    c('PB-A-OG-MAM', 'A5', 'MAMPOSTERIA', 'Capitulo', 'PB-A-OG', ['PB-A-OG-MAM-01','PB-A-OG-MAM-02']),
    c('PB-A-OG-MAM-01', 'A5.01', 'Block 6" muros exteriores', 'Material', 'PB-A-OG-MAM', [], 'M2', 380, 1650, 1750, 1970),
    c('PB-A-OG-MAM-02', 'A5.02', 'Block 4" muros divisorios', 'Material', 'PB-A-OG-MAM', [], 'M2', 520, 1200, 1280, 1520),

    // PB > Bloque A > Terminaciones
    c('PB-A-TER', 'B', 'TERMINACIONES', 'Capitulo', 'PB-BLQ-A', ['PB-A-TER-PI']),
    c('PB-A-TER-PI', 'B1', 'PISOS', 'Capitulo', 'PB-A-TER', ['PB-A-TER-PI-01','PB-A-TER-PI-02']),
    c('PB-A-TER-PI-01', 'B1.01', 'Porcelanato 60x60 lobby', 'Material', 'PB-A-TER-PI', [], 'M2', 280, 2100, 2220, 2500),
    c('PB-A-TER-PI-02', 'B1.02', 'Mano de obra instalacion pisos', 'ManoObra', 'PB-A-TER-PI', [], 'M2', 280, 420, 450, 510),

    // PB > Bloque A > Sanitarias
    c('PB-A-SAN', 'C', 'INSTALACIONES SANITARIAS', 'Capitulo', 'PB-BLQ-A', ['PB-A-SAN-AG']),
    c('PB-A-SAN-AG', 'C1', 'AGUA POTABLE', 'Capitulo', 'PB-A-SAN', ['PB-A-SAN-AG-01','PB-A-SAN-AG-02']),
    c('PB-A-SAN-AG-01', 'C1.01', 'Punto agua fria PVC 1/2"', 'Partida', 'PB-A-SAN-AG', [], 'UND', 24, 2500, 2650, 2980),
    c('PB-A-SAN-AG-02', 'C1.02', 'Punto agua caliente CPVC 1/2"', 'Partida', 'PB-A-SAN-AG', [], 'UND', 16, 3200, 3380, 3800),

    // PB > Bloque B > Obra Gruesa
    c('PB-B-OG', 'A', 'OBRA GRUESA', 'Capitulo', 'PB-BLQ-B', ['PB-B-OG-EST']),
    c('PB-B-OG-EST', 'A4', 'ESTRUCTURA', 'Capitulo', 'PB-B-OG', ['PB-B-OG-EST-01','PB-B-OG-EST-02']),
    c('PB-B-OG-EST-01', 'A4.01', 'Hormigon armado columnas f\'c=350', 'Partida', 'PB-B-OG-EST', [], 'M3', 42, 15800, 16700, 18800),
    c('PB-B-OG-EST-02', 'A4.02', 'Hormigon armado vigas f\'c=280', 'Partida', 'PB-B-OG-EST', [], 'M3', 56, 14500, 15300, 17200),

    // PB > Areas Comunes > Obras Exteriores
    c('PB-C-EXT', 'F', 'OBRAS EXTERIORES', 'Capitulo', 'PB-BLQ-C', ['PB-C-EXT-PAV']),
    c('PB-C-EXT-PAV', 'F1', 'PAVIMENTOS', 'Capitulo', 'PB-C-EXT', ['PB-C-EXT-PAV-01','PB-C-EXT-PAV-02']),
    c('PB-C-EXT-PAV-01', 'F1.01', 'Pavimento hormigon vehicular', 'Partida', 'PB-C-EXT-PAV', [], 'M2', 1200, 2800, 2960, 3330),
    c('PB-C-EXT-PAV-02', 'F1.02', 'Aceras peatonales hormigon', 'Partida', 'PB-C-EXT-PAV', [], 'M2', 480, 1800, 1900, 2140),

    // ══════════════════════════════════════
    // NIVEL 1 → Bloques (el más completo)
    // ══════════════════════════════════════
    c('N1-BLQ-A', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-1', ['N1-A-OG','N1-A-TER','N1-A-SAN','N1-A-ELEC']),
    c('N1-BLQ-B', 'BLQ-B', 'BLOQUE B', 'Capitulo', 'N-1', ['N1-B-OG']),

    // N1 > Bloque A > Obra Gruesa
    c('N1-A-OG', 'A', 'OBRA GRUESA', 'Capitulo', 'N1-BLQ-A', ['N1-A-OG-EST','N1-A-OG-MAM']),
    c('N1-A-OG-EST', 'A4', 'ESTRUCTURA', 'Capitulo', 'N1-A-OG', ['N1-A-OG-EST-01','N1-A-OG-EST-02','N1-A-OG-EST-03','N1-A-OG-EST-04','N1-A-OG-EST-05']),
    c('N1-A-OG-EST-01', 'A4.01', 'Hormigon armado columnas f\'c=350', 'Partida', 'N1-A-OG-EST', [], 'M3', 52, 15800, 16700, 18800),
    c('N1-A-OG-EST-02', 'A4.02', 'Hormigon armado vigas f\'c=280', 'Partida', 'N1-A-OG-EST', [], 'M3', 78, 14500, 15300, 17200),
    c('N1-A-OG-EST-03', 'A4.03', 'Hormigon armado losa f\'c=280', 'Partida', 'N1-A-OG-EST', [], 'M3', 110, 13200, 13900, 15700),
    c('N1-A-OG-EST-04', 'A4.04', 'Acero de refuerzo grado 60', 'Material', 'N1-A-OG-EST', [], 'KG', 15200, 72, 76, 86),
    c('N1-A-OG-EST-05', 'A4.05', 'Encofrado losas y vigas', 'ManoObra', 'N1-A-OG-EST', [], 'M2', 980, 650, 690, 780),
    c('N1-A-OG-MAM', 'A5', 'MAMPOSTERIA', 'Capitulo', 'N1-A-OG', ['N1-A-OG-MAM-01','N1-A-OG-MAM-02','N1-A-OG-MAM-03']),
    c('N1-A-OG-MAM-01', 'A5.01', 'Block 6" muros exteriores', 'Material', 'N1-A-OG-MAM', [], 'M2', 420, 1650, 1750, 1970),
    c('N1-A-OG-MAM-02', 'A5.02', 'Block 4" muros divisorios', 'Material', 'N1-A-OG-MAM', [], 'M2', 680, 1200, 1280, 1520),
    c('N1-A-OG-MAM-03', 'A5.03', 'Mano de obra colocacion blocks', 'ManoObra', 'N1-A-OG-MAM', [], 'M2', 1100, 380, 400, 450),

    // N1 > Bloque A > Terminaciones
    c('N1-A-TER', 'B', 'TERMINACIONES', 'Capitulo', 'N1-BLQ-A', ['N1-A-TER-PI','N1-A-TER-PIN']),
    c('N1-A-TER-PI', 'B1', 'PISOS', 'Capitulo', 'N1-A-TER', ['N1-A-TER-PI-01','N1-A-TER-PI-02','N1-A-TER-PI-03']),
    c('N1-A-TER-PI-01', 'B1.01', 'Ceramica 60x60 areas comunes', 'Material', 'N1-A-TER-PI', [], 'M2', 1800, 1450, 1520, 1710),
    c('N1-A-TER-PI-02', 'B1.02', 'Porcelanato 60x60 apartamentos', 'Material', 'N1-A-TER-PI', [], 'M2', 5400, 2100, 2220, 2500),
    c('N1-A-TER-PI-03', 'B1.03', 'Mano de obra instalacion pisos', 'ManoObra', 'N1-A-TER-PI', [], 'M2', 7200, 420, 450, 510),
    c('N1-A-TER-PIN', 'B3', 'PINTURA', 'Capitulo', 'N1-A-TER', ['N1-A-TER-PIN-01','N1-A-TER-PIN-02']),
    c('N1-A-TER-PIN-01', 'B3.01', 'Pintura interior latex 2 manos', 'Partida', 'N1-A-TER-PIN', [], 'M2', 4200, 180, 190, 215),
    c('N1-A-TER-PIN-02', 'B3.02', 'Pintura exterior elastomerica', 'Partida', 'N1-A-TER-PIN', [], 'M2', 1800, 320, 340, 380),

    // N1 > Bloque A > Sanitarias
    c('N1-A-SAN', 'C', 'INSTALACIONES SANITARIAS', 'Capitulo', 'N1-BLQ-A', ['N1-A-SAN-AG','N1-A-SAN-AN']),
    c('N1-A-SAN-AG', 'C1', 'AGUA POTABLE', 'Capitulo', 'N1-A-SAN', ['N1-A-SAN-AG-01','N1-A-SAN-AG-02']),
    c('N1-A-SAN-AG-01', 'C1.01', 'Punto agua fria PVC 1/2"', 'Partida', 'N1-A-SAN-AG', [], 'UND', 48, 2500, 2650, 2980),
    c('N1-A-SAN-AG-02', 'C1.02', 'Punto agua caliente CPVC 1/2"', 'Partida', 'N1-A-SAN-AG', [], 'UND', 32, 3200, 3380, 3800),
    c('N1-A-SAN-AN', 'C2', 'AGUAS NEGRAS', 'Capitulo', 'N1-A-SAN', ['N1-A-SAN-AN-01']),
    c('N1-A-SAN-AN-01', 'C2.01', 'Punto desague PVC 4"', 'Partida', 'N1-A-SAN-AN', [], 'UND', 36, 2200, 2320, 2610),

    // N1 > Bloque A > Electricas
    c('N1-A-ELEC', 'D', 'INSTALACIONES ELECTRICAS', 'Capitulo', 'N1-BLQ-A', ['N1-A-ELEC-CAN']),
    c('N1-A-ELEC-CAN', 'D1', 'CANALIZACIONES', 'Capitulo', 'N1-A-ELEC', ['N1-A-ELEC-CAN-01','N1-A-ELEC-CAN-02']),
    c('N1-A-ELEC-CAN-01', 'D1.01', 'Punto de luz sencillo', 'Partida', 'N1-A-ELEC-CAN', [], 'UND', 96, 3500, 3700, 4160),
    c('N1-A-ELEC-CAN-02', 'D1.02', 'Punto tomacorriente doble', 'Partida', 'N1-A-ELEC-CAN', [], 'UND', 72, 2800, 2960, 3330),

    // N1 > Bloque B > Obra Gruesa
    c('N1-B-OG', 'A', 'OBRA GRUESA', 'Capitulo', 'N1-BLQ-B', ['N1-B-OG-EST']),
    c('N1-B-OG-EST', 'A4', 'ESTRUCTURA', 'Capitulo', 'N1-B-OG', ['N1-B-OG-EST-01']),
    c('N1-B-OG-EST-01', 'A4.01', 'Hormigon armado columnas f\'c=350', 'Partida', 'N1-B-OG-EST', [], 'M3', 38, 15800, 16700, 18800),

    // ══════════════════════════════════════
    // NIVEL 2 → Bloques
    // ══════════════════════════════════════
    c('N2-BLQ-A', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-2', ['N2-A-OG','N2-A-TER']),

    c('N2-A-OG', 'A', 'OBRA GRUESA', 'Capitulo', 'N2-BLQ-A', ['N2-A-OG-EST']),
    c('N2-A-OG-EST', 'A4', 'ESTRUCTURA', 'Capitulo', 'N2-A-OG', ['N2-A-OG-EST-01','N2-A-OG-EST-02','N2-A-OG-EST-03']),
    c('N2-A-OG-EST-01', 'A4.01', 'Hormigon armado columnas f\'c=350', 'Partida', 'N2-A-OG-EST', [], 'M3', 48, 15800, 16700, 18800),
    c('N2-A-OG-EST-02', 'A4.02', 'Hormigon armado vigas f\'c=280', 'Partida', 'N2-A-OG-EST', [], 'M3', 72, 14500, 15300, 17200),
    c('N2-A-OG-EST-03', 'A4.03', 'Hormigon armado losa f\'c=280', 'Partida', 'N2-A-OG-EST', [], 'M3', 105, 13200, 13900, 15700),
    c('N2-A-TER', 'B', 'TERMINACIONES', 'Capitulo', 'N2-BLQ-A', ['N2-A-TER-PI']),
    c('N2-A-TER-PI', 'B1', 'PISOS', 'Capitulo', 'N2-A-TER', ['N2-A-TER-PI-01']),
    c('N2-A-TER-PI-01', 'B1.01', 'Porcelanato 60x60 apartamentos', 'Material', 'N2-A-TER-PI', [], 'M2', 5200, 2100, 2220, 2500),

    // ══════════════════════════════════════
    // NIVEL 3 → Bloques (mínimo)
    // ══════════════════════════════════════
    c('N3-BLQ-A', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-3', ['N3-A-OG']),
    c('N3-A-OG', 'A', 'OBRA GRUESA', 'Capitulo', 'N3-BLQ-A', ['N3-A-OG-EST']),
    c('N3-A-OG-EST', 'A4', 'ESTRUCTURA', 'Capitulo', 'N3-A-OG', ['N3-A-OG-EST-01']),
    c('N3-A-OG-EST-01', 'A4.01', 'Hormigon armado columnas f\'c=350', 'Partida', 'N3-A-OG-EST', [], 'M3', 48, 15800, 16700, 18800),

    // ══════════════════════════════════════
    // AZOTEA → Bloques
    // ══════════════════════════════════════
    c('AZ-BLQ-A', 'BLQ-A', 'BLOQUE A', 'Capitulo', 'N-AZ', ['AZ-A-OG']),
    c('AZ-A-OG', 'A', 'OBRA GRUESA', 'Capitulo', 'AZ-BLQ-A', ['AZ-A-OG-TEC']),
    c('AZ-A-OG-TEC', 'A11', 'TERMINACION DE TECHOS', 'Capitulo', 'AZ-A-OG', ['AZ-A-OG-TEC-01','AZ-A-OG-TEC-02']),
    c('AZ-A-OG-TEC-01', 'A11.01', 'Impermeabilizante asfaltico techo', 'Partida', 'AZ-A-OG-TEC', [], 'M2', 850, 480, 510, 570),
    c('AZ-A-OG-TEC-02', 'A11.02', 'Fino de techo mezcla cemento', 'Partida', 'AZ-A-OG-TEC', [], 'M2', 850, 320, 340, 380),
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
