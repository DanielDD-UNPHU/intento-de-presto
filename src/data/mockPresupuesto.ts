import type { ConceptoPresupuesto } from '../types';

export function createMockPresupuesto(): Record<string, ConceptoPresupuesto> {
  const conceptos: Record<string, ConceptoPresupuesto> = {};

  const items: Omit<ConceptoPresupuesto, 'nivel' | 'orden'>[] = [
    // =====================================================
    // NIVEL 0 — CAPITULOS PRINCIPALES
    // =====================================================
    { id: '1', codigo: 'A', descripcion: 'OBRA GRUESA', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: null, childrenIds: ['2','3','4','5','6'] },
    { id: '50', codigo: 'B', descripcion: 'TERMINACIONES', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: null, childrenIds: ['51','52','53','54','55'] },
    { id: '80', codigo: 'C', descripcion: 'INSTALACIONES SANITARIAS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: null, childrenIds: ['81','82','83'] },
    { id: '100', codigo: 'D', descripcion: 'INSTALACIONES ELECTRICAS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: null, childrenIds: ['101','102','103','104'] },
    { id: '130', codigo: 'E', descripcion: 'INSTALACIONES ESPECIALES', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: null, childrenIds: ['131','132','133','134'] },
    { id: '160', codigo: 'F', descripcion: 'OBRAS EXTERIORES', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: null, childrenIds: ['161','162','163','164'] },

    // =====================================================
    // A: OBRA GRUESA — Sub-capitulos (nivel 1)
    // =====================================================
    { id: '2', codigo: 'A1', descripcion: 'PRELIMINARES', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '1', childrenIds: ['7','8','9','10','11'] },
    { id: '3', codigo: 'A2', descripcion: 'MOVIMIENTO DE TIERRAS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '1', childrenIds: ['12','13','14','15'] },
    { id: '4', codigo: 'A3', descripcion: 'FUNDACIONES', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '1', childrenIds: ['16','17','18','19','20'] },
    { id: '5', codigo: 'A4', descripcion: 'ESTRUCTURA', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '1', childrenIds: ['21','22','23','24','25','26'] },
    { id: '6', codigo: 'A5', descripcion: 'MAMPOSTERIA', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '1', childrenIds: ['27','28','29','30'] },

    // A1 - PRELIMINARES (nivel 2)
    { id: '7', codigo: 'A1.01', descripcion: 'Limpieza y desbroce del terreno', tipo: 'Partida', unidad: 'M2', cantidad: 2400, precioRef: 85, precioInterno: 90, precioCliente: 100, parentId: '2', childrenIds: [] },
    { id: '8', codigo: 'A1.02', descripcion: 'Replanteo y nivelacion topografica', tipo: 'ManoObra', unidad: 'M2', cantidad: 2400, precioRef: 55, precioInterno: 60, precioCliente: 68, parentId: '2', childrenIds: [] },
    { id: '9', codigo: 'A1.03', descripcion: 'Instalacion de campamento provisional', tipo: 'Partida', unidad: 'GLB', cantidad: 1, precioRef: 380000, precioInterno: 395000, precioCliente: 445000, parentId: '2', childrenIds: [] },
    { id: '10', codigo: 'A1.04', descripcion: 'Valla perimetral de seguridad', tipo: 'Material', unidad: 'ML', cantidad: 196, precioRef: 1800, precioInterno: 1900, precioCliente: 2150, parentId: '2', childrenIds: [] },
    { id: '11', codigo: 'A1.05', descripcion: 'Demolicion de estructura existente', tipo: 'Maquinaria', unidad: 'M3', cantidad: 320, precioRef: 950, precioInterno: 1000, precioCliente: 1120, parentId: '2', childrenIds: [] },

    // A2 - MOVIMIENTO DE TIERRAS (nivel 2)
    { id: '12', codigo: 'A2.01', descripcion: 'Excavacion a cielo abierto con retroexcavadora', tipo: 'Maquinaria', unidad: 'M3', cantidad: 3200, precioRef: 420, precioInterno: 450, precioCliente: 510, parentId: '3', childrenIds: [] },
    { id: '13', codigo: 'A2.02', descripcion: 'Excavacion de zanjas para fundaciones', tipo: 'ManoObra', unidad: 'M3', cantidad: 860, precioRef: 680, precioInterno: 720, precioCliente: 810, parentId: '3', childrenIds: [] },
    { id: '14', codigo: 'A2.03', descripcion: 'Relleno compactado con material selecto', tipo: 'Material', unidad: 'M3', cantidad: 1450, precioRef: 750, precioInterno: 800, precioCliente: 900, parentId: '3', childrenIds: [] },
    { id: '15', codigo: 'A2.04', descripcion: 'Bote de material excedente', tipo: 'Maquinaria', unidad: 'M3', cantidad: 2600, precioRef: 380, precioInterno: 400, precioCliente: 450, parentId: '3', childrenIds: [] },

    // A3 - FUNDACIONES (nivel 2)
    { id: '16', codigo: 'A3.01', descripcion: 'Hormigon armado para zapatas f\'c=280 kg/cm2', tipo: 'Partida', unidad: 'M3', cantidad: 420, precioRef: 12500, precioInterno: 13200, precioCliente: 14850, parentId: '4', childrenIds: [] },
    { id: '17', codigo: 'A3.02', descripcion: 'Acero de refuerzo grado 60 en zapatas', tipo: 'Material', unidad: 'KG', cantidad: 18500, precioRef: 72, precioInterno: 76, precioCliente: 85, parentId: '4', childrenIds: [] },
    { id: '18', codigo: 'A3.03', descripcion: 'Vigas de amarre de fundacion', tipo: 'Partida', unidad: 'M3', cantidad: 185, precioRef: 14200, precioInterno: 15000, precioCliente: 16900, parentId: '4', childrenIds: [] },
    { id: '19', codigo: 'A3.04', descripcion: 'Encofrado metalico para fundaciones', tipo: 'Maquinaria', unidad: 'M2', cantidad: 1100, precioRef: 580, precioInterno: 620, precioCliente: 700, parentId: '4', childrenIds: [] },
    { id: '20', codigo: 'A3.05', descripcion: 'Mano de obra vaciado de fundaciones', tipo: 'ManoObra', unidad: 'M3', cantidad: 605, precioRef: 2800, precioInterno: 3000, precioCliente: 3380, parentId: '4', childrenIds: [] },

    // A4 - ESTRUCTURA (nivel 2)
    { id: '21', codigo: 'A4.01', descripcion: 'Hormigon armado columnas f\'c=350 kg/cm2', tipo: 'Partida', unidad: 'M3', cantidad: 310, precioRef: 15800, precioInterno: 16700, precioCliente: 18800, parentId: '5', childrenIds: [] },
    { id: '22', codigo: 'A4.02', descripcion: 'Hormigon armado vigas f\'c=280 kg/cm2', tipo: 'Partida', unidad: 'M3', cantidad: 480, precioRef: 14500, precioInterno: 15300, precioCliente: 17200, parentId: '5', childrenIds: [] },
    { id: '23', codigo: 'A4.03', descripcion: 'Hormigon armado losas f\'c=280 kg/cm2', tipo: 'Partida', unidad: 'M3', cantidad: 720, precioRef: 13200, precioInterno: 13900, precioCliente: 15700, parentId: '5', childrenIds: [] },
    { id: '24', codigo: 'A4.04', descripcion: 'Acero de refuerzo grado 60 estructura', tipo: 'Material', unidad: 'KG', cantidad: 95000, precioRef: 72, precioInterno: 76, precioCliente: 86, parentId: '5', childrenIds: [] },
    { id: '25', codigo: 'A4.05', descripcion: 'Encofrado y desencofrado losas y vigas', tipo: 'ManoObra', unidad: 'M2', cantidad: 6200, precioRef: 650, precioInterno: 690, precioCliente: 780, parentId: '5', childrenIds: [] },
    { id: '26', codigo: 'A4.06', descripcion: 'Escaleras de hormigon armado', tipo: 'Partida', unidad: 'M3', cantidad: 45, precioRef: 18500, precioInterno: 19500, precioCliente: 22000, parentId: '5', childrenIds: [] },

    // A5 - MAMPOSTERIA (nivel 2)
    { id: '27', codigo: 'A5.01', descripcion: 'Block de 6" para muros exteriores', tipo: 'Material', unidad: 'M2', cantidad: 4800, precioRef: 1650, precioInterno: 1750, precioCliente: 1970, parentId: '6', childrenIds: [] },
    { id: '28', codigo: 'A5.02', descripcion: 'Block de 4" para muros divisorios', tipo: 'Material', unidad: 'M2', cantidad: 6200, precioRef: 1280, precioInterno: 1350, precioCliente: 1520, parentId: '6', childrenIds: [] },
    { id: '29', codigo: 'A5.03', descripcion: 'Mano de obra colocacion de blocks', tipo: 'ManoObra', unidad: 'M2', cantidad: 11000, precioRef: 380, precioInterno: 400, precioCliente: 450, parentId: '6', childrenIds: [] },
    { id: '30', codigo: 'A5.04', descripcion: 'Dinteles y columnas de amarre', tipo: 'Partida', unidad: 'ML', cantidad: 2400, precioRef: 1450, precioInterno: 1530, precioCliente: 1720, parentId: '6', childrenIds: [] },

    // =====================================================
    // B: TERMINACIONES — Sub-capitulos (nivel 1)
    // =====================================================
    { id: '51', codigo: 'B1', descripcion: 'PISOS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '50', childrenIds: ['56','57','58','59'] },
    { id: '52', codigo: 'B2', descripcion: 'REVESTIMIENTOS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '50', childrenIds: ['60','61','62'] },
    { id: '53', codigo: 'B3', descripcion: 'PINTURA', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '50', childrenIds: ['63','64','65'] },
    { id: '54', codigo: 'B4', descripcion: 'CARPINTERIA', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '50', childrenIds: ['66','67','68','69'] },
    { id: '55', codigo: 'B5', descripcion: 'HERRERIA', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '50', childrenIds: ['70','71','72'] },

    // B1 - PISOS (nivel 2)
    { id: '56', codigo: 'B1.01', descripcion: 'Ceramica de piso 60x60 areas comunes', tipo: 'Material', unidad: 'M2', cantidad: 1800, precioRef: 1450, precioInterno: 1520, precioCliente: 1710, parentId: '51', childrenIds: [] },
    { id: '57', codigo: 'B1.02', descripcion: 'Porcelanato 60x60 apartamentos', tipo: 'Material', unidad: 'M2', cantidad: 5400, precioRef: 2100, precioInterno: 2220, precioCliente: 2500, parentId: '51', childrenIds: [] },
    { id: '58', codigo: 'B1.03', descripcion: 'Mano de obra instalacion pisos', tipo: 'ManoObra', unidad: 'M2', cantidad: 7200, precioRef: 420, precioInterno: 450, precioCliente: 510, parentId: '51', childrenIds: [] },
    { id: '59', codigo: 'B1.04', descripcion: 'Pulido y brillado de pisos', tipo: 'Subcontrato', unidad: 'M2', cantidad: 7200, precioRef: 180, precioInterno: 190, precioCliente: 215, parentId: '51', childrenIds: [] },

    // B2 - REVESTIMIENTOS (nivel 2)
    { id: '60', codigo: 'B2.01', descripcion: 'Panete interior fino muros', tipo: 'Partida', unidad: 'M2', cantidad: 22000, precioRef: 380, precioInterno: 400, precioCliente: 450, parentId: '52', childrenIds: [] },
    { id: '61', codigo: 'B2.02', descripcion: 'Panete exterior con impermeabilizante', tipo: 'Partida', unidad: 'M2', cantidad: 4800, precioRef: 520, precioInterno: 550, precioCliente: 620, parentId: '52', childrenIds: [] },
    { id: '62', codigo: 'B2.03', descripcion: 'Ceramica en banos y cocinas', tipo: 'Material', unidad: 'M2', cantidad: 3200, precioRef: 1850, precioInterno: 1950, precioCliente: 2200, parentId: '52', childrenIds: [] },

    // B3 - PINTURA (nivel 2)
    { id: '63', codigo: 'B3.01', descripcion: 'Pintura latex interior 2 manos', tipo: 'Partida', unidad: 'M2', cantidad: 22000, precioRef: 210, precioInterno: 225, precioCliente: 255, parentId: '53', childrenIds: [] },
    { id: '64', codigo: 'B3.02', descripcion: 'Pintura latex exterior 2 manos', tipo: 'Partida', unidad: 'M2', cantidad: 4800, precioRef: 280, precioInterno: 300, precioCliente: 340, parentId: '53', childrenIds: [] },
    { id: '65', codigo: 'B3.03', descripcion: 'Impermeabilizante en techo', tipo: 'Material', unidad: 'M2', cantidad: 600, precioRef: 850, precioInterno: 900, precioCliente: 1020, parentId: '53', childrenIds: [] },

    // B4 - CARPINTERIA (nivel 2)
    { id: '66', codigo: 'B4.01', descripcion: 'Puertas principales de madera caoba', tipo: 'Material', unidad: 'UND', cantidad: 48, precioRef: 28000, precioInterno: 29500, precioCliente: 33200, parentId: '54', childrenIds: [] },
    { id: '67', codigo: 'B4.02', descripcion: 'Puertas interiores de madera pino', tipo: 'Material', unidad: 'UND', cantidad: 192, precioRef: 12500, precioInterno: 13200, precioCliente: 14900, parentId: '54', childrenIds: [] },
    { id: '68', codigo: 'B4.03', descripcion: 'Closets de madera MDF melamina', tipo: 'Subcontrato', unidad: 'ML', cantidad: 480, precioRef: 8500, precioInterno: 9000, precioCliente: 10100, parentId: '54', childrenIds: [] },
    { id: '69', codigo: 'B4.04', descripcion: 'Gabinetes de cocina en PVC', tipo: 'Subcontrato', unidad: 'ML', cantidad: 288, precioRef: 12000, precioInterno: 12700, precioCliente: 14300, parentId: '54', childrenIds: [] },

    // B5 - HERRERIA (nivel 2)
    { id: '70', codigo: 'B5.01', descripcion: 'Ventanas corredizas de aluminio', tipo: 'Subcontrato', unidad: 'M2', cantidad: 1600, precioRef: 4800, precioInterno: 5100, precioCliente: 5750, parentId: '55', childrenIds: [] },
    { id: '71', codigo: 'B5.02', descripcion: 'Barandas metalicas para balcones', tipo: 'Subcontrato', unidad: 'ML', cantidad: 680, precioRef: 5500, precioInterno: 5800, precioCliente: 6530, parentId: '55', childrenIds: [] },
    { id: '72', codigo: 'B5.03', descripcion: 'Puertas de bano en aluminio', tipo: 'Material', unidad: 'UND', cantidad: 96, precioRef: 8200, precioInterno: 8700, precioCliente: 9800, parentId: '55', childrenIds: [] },

    // =====================================================
    // C: INSTALACIONES SANITARIAS — Sub-capitulos (nivel 1)
    // =====================================================
    { id: '81', codigo: 'C1', descripcion: 'AGUA POTABLE', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '80', childrenIds: ['84','85','86','87'] },
    { id: '82', codigo: 'C2', descripcion: 'AGUAS NEGRAS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '80', childrenIds: ['88','89','90'] },
    { id: '83', codigo: 'C3', descripcion: 'AGUAS LLUVIAS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '80', childrenIds: ['91','92','93'] },

    // C1 - AGUA POTABLE (nivel 2)
    { id: '84', codigo: 'C1.01', descripcion: 'Tuberia CPVC 3/4" agua fria', tipo: 'Material', unidad: 'ML', cantidad: 2800, precioRef: 185, precioInterno: 195, precioCliente: 220, parentId: '81', childrenIds: [] },
    { id: '85', codigo: 'C1.02', descripcion: 'Tuberia CPVC 1/2" distribuciones', tipo: 'Material', unidad: 'ML', cantidad: 4200, precioRef: 140, precioInterno: 148, precioCliente: 167, parentId: '81', childrenIds: [] },
    { id: '86', codigo: 'C1.03', descripcion: 'Tanque cisterna 10,000 galones', tipo: 'Partida', unidad: 'UND', cantidad: 2, precioRef: 485000, precioInterno: 510000, precioCliente: 575000, parentId: '81', childrenIds: [] },
    { id: '87', codigo: 'C1.04', descripcion: 'Bomba de presion constante 5HP', tipo: 'Partida', unidad: 'UND', cantidad: 2, precioRef: 220000, precioInterno: 232000, precioCliente: 261000, parentId: '81', childrenIds: [] },

    // C2 - AGUAS NEGRAS (nivel 2)
    { id: '88', codigo: 'C2.01', descripcion: 'Tuberia PVC SDR-26 4" drenaje', tipo: 'Material', unidad: 'ML', cantidad: 3600, precioRef: 320, precioInterno: 340, precioCliente: 385, parentId: '82', childrenIds: [] },
    { id: '89', codigo: 'C2.02', descripcion: 'Registros sanitarios 12"x12"', tipo: 'Partida', unidad: 'UND', cantidad: 48, precioRef: 4500, precioInterno: 4750, precioCliente: 5350, parentId: '82', childrenIds: [] },
    { id: '90', codigo: 'C2.03', descripcion: 'Trampa de grasa doble camara', tipo: 'Partida', unidad: 'UND', cantidad: 1, precioRef: 165000, precioInterno: 175000, precioCliente: 197000, parentId: '82', childrenIds: [] },

    // C3 - AGUAS LLUVIAS (nivel 2)
    { id: '91', codigo: 'C3.01', descripcion: 'Tuberia PVC SDR-41 6" bajantes pluviales', tipo: 'Material', unidad: 'ML', cantidad: 480, precioRef: 450, precioInterno: 475, precioCliente: 535, parentId: '83', childrenIds: [] },
    { id: '92', codigo: 'C3.02', descripcion: 'Canaletas y rejillas en techo', tipo: 'Material', unidad: 'ML', cantidad: 260, precioRef: 1800, precioInterno: 1900, precioCliente: 2140, parentId: '83', childrenIds: [] },
    { id: '93', codigo: 'C3.03', descripcion: 'Pozo filtrante aguas lluvias', tipo: 'Partida', unidad: 'UND', cantidad: 2, precioRef: 280000, precioInterno: 295000, precioCliente: 332000, parentId: '83', childrenIds: [] },

    // =====================================================
    // D: INSTALACIONES ELECTRICAS — Sub-capitulos (nivel 1)
    // =====================================================
    { id: '101', codigo: 'D1', descripcion: 'CANALIZACIONES', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '100', childrenIds: ['105','106','107'] },
    { id: '102', codigo: 'D2', descripcion: 'CABLEADO', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '100', childrenIds: ['108','109','110'] },
    { id: '103', codigo: 'D3', descripcion: 'PANELES Y BREAKERS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '100', childrenIds: ['111','112','113'] },
    { id: '104', codigo: 'D4', descripcion: 'ILUMINACION', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '100', childrenIds: ['114','115','116'] },

    // D1 - CANALIZACIONES (nivel 2)
    { id: '105', codigo: 'D1.01', descripcion: 'Tuberia EMT 3/4" para circuitos', tipo: 'Material', unidad: 'ML', cantidad: 8500, precioRef: 95, precioInterno: 100, precioCliente: 113, parentId: '101', childrenIds: [] },
    { id: '106', codigo: 'D1.02', descripcion: 'Tuberia EMT 1" para alimentadores', tipo: 'Material', unidad: 'ML', cantidad: 2200, precioRef: 145, precioInterno: 153, precioCliente: 172, parentId: '101', childrenIds: [] },
    { id: '107', codigo: 'D1.03', descripcion: 'Cajas de registro y salida', tipo: 'Material', unidad: 'UND', cantidad: 1920, precioRef: 120, precioInterno: 128, precioCliente: 144, parentId: '101', childrenIds: [] },

    // D2 - CABLEADO (nivel 2)
    { id: '108', codigo: 'D2.01', descripcion: 'Cable THHN #12 AWG', tipo: 'Material', unidad: 'ML', cantidad: 24000, precioRef: 28, precioInterno: 30, precioCliente: 34, parentId: '102', childrenIds: [] },
    { id: '109', codigo: 'D2.02', descripcion: 'Cable THHN #10 AWG alimentadores', tipo: 'Material', unidad: 'ML', cantidad: 6000, precioRef: 48, precioInterno: 51, precioCliente: 58, parentId: '102', childrenIds: [] },
    { id: '110', codigo: 'D2.03', descripcion: 'Cable THHN #2/0 acometida principal', tipo: 'Material', unidad: 'ML', cantidad: 320, precioRef: 580, precioInterno: 615, precioCliente: 695, parentId: '102', childrenIds: [] },

    // D3 - PANELES Y BREAKERS (nivel 2)
    { id: '111', codigo: 'D3.01', descripcion: 'Panel electrico 42 espacios apartamento', tipo: 'Partida', unidad: 'UND', cantidad: 48, precioRef: 18500, precioInterno: 19500, precioCliente: 22000, parentId: '103', childrenIds: [] },
    { id: '112', codigo: 'D3.02', descripcion: 'Panel general del edificio 200A', tipo: 'Partida', unidad: 'UND', cantidad: 2, precioRef: 185000, precioInterno: 195000, precioCliente: 220000, parentId: '103', childrenIds: [] },
    { id: '113', codigo: 'D3.03', descripcion: 'Transformador trifasico 500 KVA', tipo: 'Subcontrato', unidad: 'UND', cantidad: 1, precioRef: 2800000, precioInterno: 2950000, precioCliente: 3320000, parentId: '103', childrenIds: [] },

    // D4 - ILUMINACION (nivel 2)
    { id: '114', codigo: 'D4.01', descripcion: 'Luminarias LED empotradas apartamentos', tipo: 'Material', unidad: 'UND', cantidad: 576, precioRef: 850, precioInterno: 900, precioCliente: 1015, parentId: '104', childrenIds: [] },
    { id: '115', codigo: 'D4.02', descripcion: 'Luminarias LED areas comunes', tipo: 'Material', unidad: 'UND', cantidad: 120, precioRef: 3200, precioInterno: 3400, precioCliente: 3830, parentId: '104', childrenIds: [] },
    { id: '116', codigo: 'D4.03', descripcion: 'Luminarias de emergencia con bateria', tipo: 'Material', unidad: 'UND', cantidad: 64, precioRef: 4500, precioInterno: 4750, precioCliente: 5350, parentId: '104', childrenIds: [] },

    // =====================================================
    // E: INSTALACIONES ESPECIALES — Sub-capitulos (nivel 1)
    // =====================================================
    { id: '131', codigo: 'E1', descripcion: 'ASCENSOR', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '130', childrenIds: ['135','136','137'] },
    { id: '132', codigo: 'E2', descripcion: 'CONTRA INCENDIOS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '130', childrenIds: ['138','139','140'] },
    { id: '133', codigo: 'E3', descripcion: 'GAS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '130', childrenIds: ['141','142'] },
    { id: '134', codigo: 'E4', descripcion: 'CCTV Y SEGURIDAD', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '130', childrenIds: ['143','144','145'] },

    // E1 - ASCENSOR (nivel 2)
    { id: '135', codigo: 'E1.01', descripcion: 'Ascensor de pasajeros 8 personas / 10 paradas', tipo: 'Subcontrato', unidad: 'UND', cantidad: 2, precioRef: 6500000, precioInterno: 6850000, precioCliente: 7700000, parentId: '131', childrenIds: [] },
    { id: '136', codigo: 'E1.02', descripcion: 'Obra civil foso de ascensor', tipo: 'Partida', unidad: 'UND', cantidad: 2, precioRef: 580000, precioInterno: 612000, precioCliente: 690000, parentId: '131', childrenIds: [] },
    { id: '137', codigo: 'E1.03', descripcion: 'Puertas de ascensor en acero inoxidable', tipo: 'Material', unidad: 'UND', cantidad: 20, precioRef: 85000, precioInterno: 89500, precioCliente: 100800, parentId: '131', childrenIds: [] },

    // E2 - CONTRA INCENDIOS (nivel 2)
    { id: '138', codigo: 'E2.01', descripcion: 'Sistema de rociadores automaticos', tipo: 'Subcontrato', unidad: 'GLB', cantidad: 1, precioRef: 3200000, precioInterno: 3380000, precioCliente: 3800000, parentId: '132', childrenIds: [] },
    { id: '139', codigo: 'E2.02', descripcion: 'Gabinetes contra incendios clase II', tipo: 'Material', unidad: 'UND', cantidad: 20, precioRef: 45000, precioInterno: 47500, precioCliente: 53500, parentId: '132', childrenIds: [] },
    { id: '140', codigo: 'E2.03', descripcion: 'Sistema de deteccion de humo y alarma', tipo: 'Subcontrato', unidad: 'GLB', cantidad: 1, precioRef: 1450000, precioInterno: 1530000, precioCliente: 1720000, parentId: '132', childrenIds: [] },

    // E3 - GAS (nivel 2)
    { id: '141', codigo: 'E3.01', descripcion: 'Instalacion de gas centralizado GLP', tipo: 'Subcontrato', unidad: 'GLB', cantidad: 1, precioRef: 2100000, precioInterno: 2215000, precioCliente: 2490000, parentId: '133', childrenIds: [] },
    { id: '142', codigo: 'E3.02', descripcion: 'Tanque de gas 1000 galones', tipo: 'Material', unidad: 'UND', cantidad: 2, precioRef: 320000, precioInterno: 338000, precioCliente: 380000, parentId: '133', childrenIds: [] },

    // E4 - CCTV Y SEGURIDAD (nivel 2)
    { id: '143', codigo: 'E4.01', descripcion: 'Camaras IP 4MP con NVR 32 canales', tipo: 'Subcontrato', unidad: 'GLB', cantidad: 1, precioRef: 680000, precioInterno: 718000, precioCliente: 808000, parentId: '134', childrenIds: [] },
    { id: '144', codigo: 'E4.02', descripcion: 'Sistema de intercomunicador por apartamento', tipo: 'Subcontrato', unidad: 'UND', cantidad: 48, precioRef: 12000, precioInterno: 12700, precioCliente: 14300, parentId: '134', childrenIds: [] },
    { id: '145', codigo: 'E4.03', descripcion: 'Control de acceso con biometrico', tipo: 'Subcontrato', unidad: 'GLB', cantidad: 1, precioRef: 420000, precioInterno: 443000, precioCliente: 499000, parentId: '134', childrenIds: [] },

    // =====================================================
    // F: OBRAS EXTERIORES — Sub-capitulos (nivel 1)
    // =====================================================
    { id: '161', codigo: 'F1', descripcion: 'PAVIMENTOS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '160', childrenIds: ['165','166','167'] },
    { id: '162', codigo: 'F2', descripcion: 'JARDINERIA', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '160', childrenIds: ['168','169','170'] },
    { id: '163', codigo: 'F3', descripcion: 'MUROS PERIMETRALES', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '160', childrenIds: ['171','172'] },
    { id: '164', codigo: 'F4', descripcion: 'PORTONES Y ACCESOS', tipo: 'Capitulo', unidad: '', cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0, parentId: '160', childrenIds: ['173','174','175'] },

    // F1 - PAVIMENTOS (nivel 2)
    { id: '165', codigo: 'F1.01', descripcion: 'Pavimento de hormigon estacionamiento', tipo: 'Partida', unidad: 'M2', cantidad: 1200, precioRef: 2800, precioInterno: 2950, precioCliente: 3320, parentId: '161', childrenIds: [] },
    { id: '166', codigo: 'F1.02', descripcion: 'Aceras peatonales de hormigon', tipo: 'Partida', unidad: 'M2', cantidad: 450, precioRef: 1800, precioInterno: 1900, precioCliente: 2140, parentId: '161', childrenIds: [] },
    { id: '167', codigo: 'F1.03', descripcion: 'Senalizacion vial y demarcacion', tipo: 'Partida', unidad: 'GLB', cantidad: 1, precioRef: 120000, precioInterno: 127000, precioCliente: 143000, parentId: '161', childrenIds: [] },

    // F2 - JARDINERIA (nivel 2)
    { id: '168', codigo: 'F2.01', descripcion: 'Grama natural en areas verdes', tipo: 'Partida', unidad: 'M2', cantidad: 600, precioRef: 350, precioInterno: 370, precioCliente: 420, parentId: '162', childrenIds: [] },
    { id: '169', codigo: 'F2.02', descripcion: 'Arboles ornamentales y palmas', tipo: 'Material', unidad: 'UND', cantidad: 35, precioRef: 8500, precioInterno: 9000, precioCliente: 10100, parentId: '162', childrenIds: [] },
    { id: '170', codigo: 'F2.03', descripcion: 'Sistema de riego automatizado', tipo: 'Subcontrato', unidad: 'GLB', cantidad: 1, precioRef: 280000, precioInterno: 295000, precioCliente: 332000, parentId: '162', childrenIds: [] },

    // F3 - MUROS PERIMETRALES (nivel 2)
    { id: '171', codigo: 'F3.01', descripcion: 'Muro perimetral block 8" con columnas', tipo: 'Partida', unidad: 'ML', cantidad: 196, precioRef: 8500, precioInterno: 8950, precioCliente: 10100, parentId: '163', childrenIds: [] },
    { id: '172', codigo: 'F3.02', descripcion: 'Verja ornamental sobre muro', tipo: 'Subcontrato', unidad: 'ML', cantidad: 120, precioRef: 6200, precioInterno: 6550, precioCliente: 7370, parentId: '163', childrenIds: [] },

    // F4 - PORTONES Y ACCESOS (nivel 2)
    { id: '173', codigo: 'F4.01', descripcion: 'Porton vehicular electrico corredizo', tipo: 'Subcontrato', unidad: 'UND', cantidad: 2, precioRef: 380000, precioInterno: 400000, precioCliente: 450000, parentId: '164', childrenIds: [] },
    { id: '174', codigo: 'F4.02', descripcion: 'Porton peatonal en hierro forjado', tipo: 'Material', unidad: 'UND', cantidad: 2, precioRef: 95000, precioInterno: 100000, precioCliente: 113000, parentId: '164', childrenIds: [] },
    { id: '175', codigo: 'F4.03', descripcion: 'Caseta de vigilancia prefabricada', tipo: 'Partida', unidad: 'UND', cantidad: 1, precioRef: 350000, precioInterno: 370000, precioCliente: 416000, parentId: '164', childrenIds: [] },
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

export const mockRootIds = ['1', '50', '80', '100', '130', '160'];
