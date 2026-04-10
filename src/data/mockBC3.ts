import type { BC3Data } from '../types';

export const mockBC3: BC3Data = {
  categories: [
    // ─── A# PARTIDAS EDIFICACIONES ───
    {
      codigo: 'A#', nombre: 'PARTIDAS EDIFICACIONES', children: [
        // A01 > sub-subcategorias
        { codigo: 'A0100#', nombre: 'IDENTIFICACION DE PROYECTOS', items: [
          { codigo: 'A010000', descripcion: 'Letrero de obra', unidad: 'UND', precio: 105000 },
        ]},
        { codigo: 'A0101#', nombre: 'VERJAS TEMPORALES Y PROTECCION OBRA', items: [
          { codigo: 'A010100', descripcion: 'Verja perimetral madera y aluzinc acanalado C26 - 6 pies', unidad: 'ML', precio: 3457.17 },
          { codigo: 'A010101', descripcion: 'Verja perimetral madera y zinc acanalado C29 - 6 pies', unidad: 'ML', precio: 2626.19 },
        ]},
        // A03 > sub-subcategorias
        { codigo: 'A0300#', nombre: 'DESMONTE TERRENO Y REMOCION CAPA VEGETAL', items: [
          { codigo: 'A030000', descripcion: 'Desmonte de vegetacion terreno', unidad: 'M2', precio: 12.17 },
          { codigo: 'A030001', descripcion: 'Extraccion capa vegetal e=0.20m', unidad: 'M2', precio: 27.82 },
        ]},
        { codigo: 'A0301#', nombre: 'DEMOLICION DE ESTRUCTURAS EXISTENTES', items: [
          { codigo: 'A030100', descripcion: 'Demolicion elementos hormigon con compresor 185CFM 2 pistolas', unidad: 'M3', precio: 4000 },
        ]},
        { codigo: 'A0302#', nombre: 'EXCAVACIONES', items: [
          { codigo: 'A030200', descripcion: 'Excavacion a mano hasta 1.50m profundidad', unidad: 'M3', precio: 850 },
          { codigo: 'A030201', descripcion: 'Excavacion a mano de 1.50m a 3.00m', unidad: 'M3', precio: 1100 },
        ]},
        { codigo: 'A0303#', nombre: 'CARGADO Y BOTE DE MATERIAL CON CAMION', items: [
          { codigo: 'A030300', descripcion: 'Bote material suelto con camion volteo 10m3', unidad: 'M3', precio: 1200 },
        ]},
        { codigo: 'A0304#', nombre: 'RELLENOS', items: [
          { codigo: 'A030400', descripcion: 'Relleno compactado material selecto', unidad: 'M3', precio: 1650 },
        ]},
        // A04 > sub-subcategorias (las reales)
        { codigo: 'A0400#', nombre: 'HORMIGON ARMADO EN FUNDACIONES - ZAPATAS MUROS', items: [
          { codigo: 'A040000', descripcion: 'Zapatas muros 4" 0.30m x 0.20m hormigon industrial 180kg/cm2', unidad: 'M3', precio: 16129.03 },
          { codigo: 'A040002', descripcion: 'Zapatas muros 4" 0.30m x 0.20m hormigon industrial 210kg/cm2', unidad: 'M3', precio: 16459.03 },
        ]},
        { codigo: 'A0401#', nombre: 'HORMIGON ARMADO EN FUNDACIONES - ZAPATAS COLUMNAS', items: [
          { codigo: 'A040100', descripcion: 'Zapatas columna 1.20m x 1.20m x 0.40m hormigon industrial 210kg/cm2', unidad: 'M3', precio: 13559.47 },
          { codigo: 'A040103', descripcion: 'Zapatas columna 1.50m x 1.50m x 0.40m hormigon industrial 210kg/cm2', unidad: 'M3', precio: 13376.49 },
        ]},
        { codigo: 'A0402#', nombre: 'HORMIGON ARMADO EN COLUMNAS CUADRADAS', items: [
          { codigo: 'A040200', descripcion: 'Columnas cuadradas 0.30x0.30m hormigon industrial 210kg/cm2', unidad: 'M3', precio: 20845.07 },
        ]},
        { codigo: 'A0404#', nombre: 'HORMIGON ARMADO EN VIGAS', items: [
          { codigo: 'A040400', descripcion: 'Viga de amarre 15x20 4 3/8" hormigon 1:2:4 con ligadora', unidad: 'M3', precio: 47682.88 },
          { codigo: 'A040402', descripcion: 'Viga de amarre 20x20 4 3/8" hormigon 1:2:4 ligado a mano', unidad: 'M3', precio: 39205.13 },
        ]},
        { codigo: 'A0408#', nombre: 'HORMIGON ARMADO EN LOSAS MACIZAS', items: [
          { codigo: 'A040800', descripcion: 'Losa ha e=0.10m 3/8"@0.25m - 1:2:4 con ligadora y winche', unidad: 'M3', precio: 27214.38 },
          { codigo: 'A040803', descripcion: 'Losa ha e=0.10m 3/8"@0.25m hormigon industrial 210kg/cm2', unidad: 'M3', precio: 27469.04 },
        ]},
        // A06 Mamposteria
        { codigo: 'A0601#', nombre: 'MORTEROS', items: [
          { codigo: 'A060101', descripcion: 'Mortero 1:3 para bloques', unidad: 'M3', precio: 8620.01 },
          { codigo: 'A060102', descripcion: 'Mortero 1:4 para pisos', unidad: 'M3', precio: 7215.01 },
        ]},
        { codigo: 'A0602#', nombre: 'MUROS DE BLOQUES DE HORMIGON', items: [
          { codigo: 'A060210', descripcion: 'Bloques hormigon de 4" - 3/8" @ 0.80m', unidad: 'M2', precio: 1404.80 },
          { codigo: 'A060220', descripcion: 'Bloques hormigon de 6" - 3/8" @ 0.80m', unidad: 'M2', precio: 1715.44 },
          { codigo: 'A060230', descripcion: 'Bloques hormigon de 8" - 3/8" @ 0.80m', unidad: 'M2', precio: 2086.67 },
        ]},
        // A07 Terminaciones
        { codigo: 'A0701#', nombre: 'PANETES DE MEZCLA DE CEMENTO', items: [
          { codigo: 'A070110', descripcion: 'Fraguache con llana', unidad: 'M2', precio: 107.10 },
          { codigo: 'A070300', descripcion: 'Panete mezcla cemento 1:4 en paredes', unidad: 'M2', precio: 520 },
        ]},
        // A09 Pisos
        { codigo: 'A0901#', nombre: 'PISOS', items: [
          { codigo: 'A090100', descripcion: 'Adoquin barahona gris', unidad: 'M2', precio: 1951.72 },
          { codigo: 'A090110', descripcion: 'Ceramica europea economica', unidad: 'M2', precio: 2427.74 },
          { codigo: 'A090120', descripcion: 'Ceramica europea buena calidad', unidad: 'M2', precio: 2823.74 },
        ]},
        // A11 Techos
        { codigo: 'A1101#', nombre: 'FINOS DE TECHO', items: [
          { codigo: 'A110100', descripcion: 'Fino de techo mezcla cemento', unidad: 'M2', precio: 320 },
        ]},
        { codigo: 'A1103#', nombre: 'IMPERMEABILIZANTE DE TECHO', items: [
          { codigo: 'A110300', descripcion: 'Impermeabilizante asfaltico techo', unidad: 'M2', precio: 480 },
        ]},
        // A15 Instalaciones Sanitarias
        { codigo: 'A1501#', nombre: 'SALIDAS AGUA POTABLE - AGUAS NEGRAS', items: [
          { codigo: 'A150100', descripcion: 'Salida agua pot. 1/2" - polietileno 18mm', unidad: 'UND', precio: 2371.94 },
          { codigo: 'A150110', descripcion: 'Salida sanitaria A.N. PVC 4" - aerea', unidad: 'UND', precio: 3124.21 },
          { codigo: 'A150111', descripcion: 'Salida sanitaria A.N. PVC 4" - tierra', unidad: 'UND', precio: 3258.76 },
        ]},
        // A17 Electricas
        { codigo: 'A1701#', nombre: 'INSTALACIONES ELECTRICAS POR SALIDA', items: [
          { codigo: 'A170100', descripcion: 'Luz cenital', unidad: 'UND', precio: 2458.69 },
          { codigo: 'A170101', descripcion: 'Luz de pared', unidad: 'UND', precio: 2552.41 },
          { codigo: 'A170110', descripcion: 'Interruptor sencillo', unidad: 'UND', precio: 2135.89 },
        ]},
        // A19 Pinturas
        { codigo: 'A1901#', nombre: 'PINTURAS', items: [
          { codigo: 'A190100', descripcion: 'Pintura economica int/ext', unidad: 'M2', precio: 202.55 },
          { codigo: 'A190110', descripcion: 'Primer acrilico contractor Tropical', unidad: 'M2', precio: 160.91 },
        ]},
        // A21 Parqueos
        { codigo: 'A2101#', nombre: 'PARQUEOS Y VIAS', items: [
          { codigo: 'A210100', descripcion: 'Contenes hormigon prefabricado tipo A', unidad: 'ML', precio: 1850 },
          { codigo: 'A210200', descripcion: 'Badenes hormigon simple', unidad: 'ML', precio: 2200 },
        ]},
      ]
    },

    // ─── E# EQUIPOS Y MAQUINARIAS ───
    {
      codigo: 'E#', nombre: 'EQUIPOS Y MAQUINARIAS', children: [
        { codigo: 'E0101#', nombre: 'ALQUILER EQUIPOS PESADOS', items: [
          { codigo: 'E010100', descripcion: 'Retroexcavadora', unidad: 'HR', precio: 4500 },
          { codigo: 'E010101', descripcion: 'Excavadora de oruga CAT 320', unidad: 'HR', precio: 6500 },
          { codigo: 'E010200', descripcion: 'Camion volteo 10 M3', unidad: 'VIAJE', precio: 3500 },
        ]},
        { codigo: 'E0201#', nombre: 'ALQUILER EQUIPOS MANUALES', items: [
          { codigo: 'E020100', descripcion: 'Mezcladora de hormigon 2 sacos', unidad: 'DIA', precio: 2500 },
          { codigo: 'E020200', descripcion: 'Compactadora vibratoria manual', unidad: 'DIA', precio: 1800 },
        ]},
      ]
    },

    // ─── H# MANO DE OBRA Y JORNALES ───
    {
      codigo: 'H#', nombre: 'MANO DE OBRA Y JORNALES', children: [
        { codigo: 'H0101#', nombre: 'JORNALES', items: [
          { codigo: 'H010100', descripcion: 'Maestro albanil', unidad: 'DIA', precio: 1800 },
          { codigo: 'H010101', descripcion: 'Albanil primera', unidad: 'DIA', precio: 1200 },
          { codigo: 'H010200', descripcion: 'Ayudante albanil', unidad: 'DIA', precio: 700 },
          { codigo: 'H010300', descripcion: 'Peon', unidad: 'DIA', precio: 600 },
        ]},
        { codigo: 'H0601#', nombre: 'MO ALBANILERIA - COLOCACION BLOQUES', items: [
          { codigo: 'H060100', descripcion: 'Colocacion bloques 4"', unidad: 'M2', precio: 280 },
          { codigo: 'H060110', descripcion: 'Colocacion bloques 6"', unidad: 'M2', precio: 320 },
        ]},
        { codigo: 'H1501#', nombre: 'INSTALACIONES ELECTRICAS POR SALIDA', items: [
          { codigo: 'H150100', descripcion: 'MO instalacion electrica por salida', unidad: 'UND', precio: 450 },
        ]},
        { codigo: 'H1601#', nombre: 'MANO DE OBRA PINTURA', items: [
          { codigo: 'H160100', descripcion: 'MO pintura economica int/ext', unidad: 'M2', precio: 85 },
        ]},
      ]
    },

    // ─── M# MATERIALES E INSUMOS ───
    {
      codigo: 'M#', nombre: 'MATERIALES E INSUMOS', children: [
        { codigo: 'M0101#', nombre: 'CEMENTOS', items: [
          { codigo: 'M010101', descripcion: 'Cemento gris Portland tipo I', unidad: 'SACO', precio: 450 },
          { codigo: 'M010102', descripcion: 'Cemento blanco', unidad: 'SACO', precio: 680 },
        ]},
        { codigo: 'M0201#', nombre: 'ARENAS', items: [
          { codigo: 'M020101', descripcion: 'Arena lavada', unidad: 'M3', precio: 1200 },
        ]},
        { codigo: 'M0202#', nombre: 'GRAVAS', items: [
          { codigo: 'M020201', descripcion: 'Grava 3/4"', unidad: 'M3', precio: 1800 },
        ]},
        { codigo: 'M0301#', nombre: 'VARILLAS DE ACERO CORRUGADAS', items: [
          { codigo: 'M030101', descripcion: 'Varilla 3/8" corrugada grado 60', unidad: 'QQ', precio: 3200 },
          { codigo: 'M030102', descripcion: 'Varilla 1/2" corrugada grado 60', unidad: 'QQ', precio: 3400 },
        ]},
        { codigo: 'M0501#', nombre: 'BLOQUES DE HORMIGON INDUSTRIALES', items: [
          { codigo: 'M050101', descripcion: 'Bloque 4" hormigon industrial', unidad: 'UND', precio: 32 },
          { codigo: 'M050102', descripcion: 'Bloque 6" hormigon industrial', unidad: 'UND', precio: 42 },
          { codigo: 'M050103', descripcion: 'Bloque 8" hormigon industrial', unidad: 'UND', precio: 55 },
        ]},
      ]
    },

    // ─── S# SUBCONTRATOS ───
    {
      codigo: 'S#', nombre: 'SUBCONTRATOS', children: [
        { codigo: 'S0901#', nombre: 'SHEETROCK', items: [
          { codigo: 'S090100', descripcion: 'Pared sheetrock sencilla todo costo', unidad: 'M2', precio: 1850 },
        ]},
        { codigo: 'S3201#', nombre: 'ASCENSORES RESIDENCIALES', items: [
          { codigo: 'S320100', descripcion: 'Ascensor 6 paradas todo costo', unidad: 'UND', precio: 2500000 },
        ]},
        { codigo: 'S3601#', nombre: 'BRIGADA TOPOGRAFICA', items: [
          { codigo: 'S360100', descripcion: 'Brigada topografica todo costo', unidad: 'MES', precio: 65000 },
        ]},
      ]
    },
  ]
};
