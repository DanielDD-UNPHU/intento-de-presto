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
          { codigo: 'A040200', descripcion: 'Columna de amarre 15x15 4 3/8 tapa y tapa 1:2:4 ligado a mano', unidad: 'M3', precio: 91367.08 },
        ]},
        { codigo: 'A0404#', nombre: 'HORMIGON ARMADO EN VIGAS', items: [
          { codigo: 'A040400', descripcion: 'Viga de amarre 15x20 4 3/8" hormigon 1:2:4 con ligadora', unidad: 'M3', precio: 47682.88 },
          { codigo: 'A040402', descripcion: 'Viga de amarre 20x20 4 3/8 - 3/8@0.20m 1:2:4 ligado a mano', unidad: 'M3', precio: 39205.13 },
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
          { codigo: 'A060230', descripcion: 'Bloques hormigon de 8" - 3/8" @ 0.80m', unidad: 'M2', precio: 1977.40 },
        ]},
        // A07 Terminaciones
        { codigo: 'A0701#', nombre: 'PANETES DE MEZCLA DE CEMENTO', items: [
          { codigo: 'A070110', descripcion: 'Fraguache con llana', unidad: 'M2', precio: 107.10 },
          { codigo: 'A070111', descripcion: 'Panete maestreado - interior', unidad: 'M2', precio: 539.44 },
        ]},
        // A09 Pisos
        { codigo: 'A0901#', nombre: 'PISOS', items: [
          { codigo: 'A090100', descripcion: 'Adoquin barahona gris', unidad: 'M2', precio: 1951.72 },
          { codigo: 'A090110', descripcion: 'Ceramica europea economica', unidad: 'M2', precio: 2427.74 },
          { codigo: 'A090120', descripcion: 'Ceramica europea buena calidad', unidad: 'M2', precio: 2823.74 },
        ]},
        // A11 Techos
        { codigo: 'A1101#', nombre: 'FINOS DE TECHO', items: [
          { codigo: 'A110100', descripcion: 'Fino techo plano', unidad: 'M2', precio: 869.44 },
        ]},
        { codigo: 'A1103#', nombre: 'IMPERMEABILIZANTE DE TECHO', items: [
          { codigo: 'A110300', descripcion: 'Impermeabilizante de techo tela asfaltica 3mm - todo costo', unidad: 'M2', precio: 1100.90 },
        ]},
        // A15 Instalaciones Sanitarias
        { codigo: 'A1501#', nombre: 'SALIDAS AGUA POTABLE - AGUAS NEGRAS', items: [
          { codigo: 'A150100', descripcion: 'Salida agua pot. 1/2" - polietileno 18mm', unidad: 'UND', precio: 2371.94 },
          { codigo: 'A150110', descripcion: 'Salida sanitaria A.N. PVC 4" - aerea', unidad: 'UND', precio: 3124.21 },
          { codigo: 'A150111', descripcion: 'Salida sanitaria A.N. PVC 4" - tierra', unidad: 'UND', precio: 3258.76 },
        ]},
        // A17 Electricas
        { codigo: 'A1701#', nombre: 'LUCES E INTERRUPTORES', items: [
          { codigo: 'A170100', descripcion: 'Luz cenital', unidad: 'UND', precio: 2458.69 },
          { codigo: 'A170101', descripcion: 'Luz de pared', unidad: 'UND', precio: 2552.41 },
          { codigo: 'A170110', descripcion: 'Interruptor sencillo', unidad: 'UND', precio: 2135.89 },
        ]},
        // A19 Pinturas
        { codigo: 'A1901#', nombre: 'PRIMERS Y PINTURA ECONOMICA', items: [
          { codigo: 'A190100', descripcion: 'Pintura economica int/ext', unidad: 'M2', precio: 202.55 },
          { codigo: 'A190110', descripcion: 'Primer acrilico contractor Tropical', unidad: 'M2', precio: 160.91 },
        ]},
        // A21 Parqueos
        { codigo: 'A2101#', nombre: 'ACERAS Y CONTENES', items: [
          { codigo: 'A210131', descripcion: 'Conten pulido h=0.40m hormigon 1:2:4 con ligadora', unidad: 'ML', precio: 2335.70 },
          { codigo: 'A210110', descripcion: 'Acera hormigon violinada e=0.10m con ligadora', unidad: 'M2', precio: 2950 },
        ]},
      ]
    },

    // ─── E# EQUIPOS Y MAQUINARIAS ───
    {
      codigo: 'E#', nombre: 'EQUIPOS Y MAQUINARIAS', children: [
        { codigo: 'E0101#', nombre: 'ALQUILER EQUIPOS PESADOS', items: [
          { codigo: 'E010103', descripcion: 'Retropala CAT416E o similar', unidad: 'HR', precio: 2300 },
          { codigo: 'E010104', descripcion: 'Excavadora de oruga CAT320 o similar', unidad: 'HR', precio: 3000 },
          { codigo: 'E010105', descripcion: 'Camion volteo 10 M3', unidad: 'VIAJE', precio: 3500 },
        ]},
        { codigo: 'E0201#', nombre: 'ALQUILER EQUIPOS MANUALES', items: [
          { codigo: 'E020101', descripcion: 'Ligadora de hormigon 2 fundas 2.0Hp - alquiler', unidad: 'DIA', precio: 3000 },
          { codigo: 'E020102', descripcion: 'Compactadora vibratoria manual - alquiler', unidad: 'DIA', precio: 1800 },
        ]},
      ]
    },

    // ─── H# MANO DE OBRA Y JORNALES ───
    {
      codigo: 'H#', nombre: 'MANO DE OBRA Y JORNALES', children: [
        { codigo: 'H0101#', nombre: 'JORNALES', items: [
          { codigo: 'H010101', descripcion: 'Maestro (MA)', unidad: 'DIA', precio: 2941.78 },
          { codigo: 'H010102', descripcion: 'Trabajador de 1ra Categoria (T1)', unidad: 'DIA', precio: 2334.67 },
          { codigo: 'H010105', descripcion: 'Ayudante (AY)', unidad: 'DIA', precio: 1260.34 },
          { codigo: 'H010107', descripcion: 'Peon o Trabajador No Calificado (PE)', unidad: 'DIA', precio: 980.59 },
        ]},
        { codigo: 'H0601#', nombre: 'MO ALBANILERIA - COLOCACION BLOQUES', items: [
          { codigo: 'H060101', descripcion: 'MO colocacion bloques 4 pulgadas', unidad: 'M2', precio: 280 },
          { codigo: 'H060102', descripcion: 'MO colocacion bloques 6 pulgadas', unidad: 'M2', precio: 320 },
        ]},
        { codigo: 'H1501#', nombre: 'INSTALACIONES ELECTRICAS POR SALIDA', items: [
          { codigo: 'H150101', descripcion: 'Salida en tuberia oculta 1/2', unidad: 'UND', precio: 877.42 },
        ]},
        { codigo: 'H1601#', nombre: 'MANO DE OBRA PINTURA', items: [
          { codigo: 'H160103', descripcion: 'Preparacion superficie y aplicacion 2 manos acrilica', unidad: 'M2', precio: 80.73 },
        ]},
      ]
    },

    // ─── M# MATERIALES E INSUMOS ───
    {
      codigo: 'M#', nombre: 'MATERIALES E INSUMOS', children: [
        { codigo: 'M0101#', nombre: 'CEMENTOS', items: [
          { codigo: 'M010101', descripcion: 'Cemento Gris 94 lbs. Tipo Portland', unidad: 'FDA', precio: 550 },
          { codigo: 'M010102', descripcion: 'Cemento Blanco Titan 40 kilos', unidad: 'FDA', precio: 1335 },
        ]},
        { codigo: 'M0201#', nombre: 'ARENAS', items: [
          { codigo: 'M020101', descripcion: 'Arena gruesa Itabo lavada', unidad: 'M3', precio: 1700 },
        ]},
        { codigo: 'M0202#', nombre: 'GRAVAS', items: [
          { codigo: 'M020201', descripcion: 'Grava de 3/4', unidad: 'M3', precio: 1650 },
        ]},
        { codigo: 'M0301#', nombre: 'VARILLAS DE ACERO CORRUGADAS', items: [
          { codigo: 'M030101', descripcion: 'Acero varilla Grado 40-60 3/8 a 1 x 20 a 30 pies', unidad: 'QQ', precio: 3400 },
        ]},
        { codigo: 'M0501#', nombre: 'BLOQUES DE HORMIGON INDUSTRIALES', items: [
          { codigo: 'M050101', descripcion: 'Bloques industrial de 4 x 8 x 16', unidad: 'UND', precio: 45 },
          { codigo: 'M050102', descripcion: 'Bloques industrial de 5 x 8 x 16', unidad: 'UND', precio: 49 },
          { codigo: 'M050104', descripcion: 'Bloques industrial de 8 x 8 x 16', unidad: 'UND', precio: 64 },
        ]},
      ]
    },

    // ─── S# SUBCONTRATOS ───
    {
      codigo: 'S#', nombre: 'SUBCONTRATOS', children: [
        { codigo: 'S0901#', nombre: 'SHEETROCK', items: [
          { codigo: 'S090101', descripcion: 'Muros de sheetrock dos caras 0.10m - todo costo', unidad: 'M2', precio: 900 },
        ]},
        { codigo: 'S3201#', nombre: 'ASCENSORES RESIDENCIALES', items: [
          { codigo: 'S320101', descripcion: 'Ascensor mitsubishi nexiez-gpx 6 paradas 8 personas - todo costo', unidad: 'UND', precio: 2027765.10 },
        ]},
        { codigo: 'S3601#', nombre: 'BRIGADA TOPOGRAFICA', items: [
          { codigo: 'S360102', descripcion: 'Brigada topografica con estacion total - todo costo', unidad: 'MES', precio: 185000 },
        ]},
      ]
    },
  ]
};
