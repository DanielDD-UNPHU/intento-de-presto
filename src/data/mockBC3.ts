import type { BC3Data } from '../types';

export const mockBC3: BC3Data = {
  categories: [
    // ─── A# PARTIDAS EDIFICACIONES ───
    {
      codigo: 'A#', nombre: 'PARTIDAS EDIFICACIONES', children: [
        { codigo: 'A01#', nombre: 'TRABAJOS PRELIMINARES', items: [
          { codigo: 'A010000', descripcion: 'Letrero de obra', unidad: 'UND', precio: 105000.00 },
          { codigo: 'A010100', descripcion: 'Verja perimetral madera y aluzinc', unidad: 'ML', precio: 3457.17 },
          { codigo: 'A010200', descripcion: 'Caseta de obra madera y aluzinc', unidad: 'M2', precio: 4850.00 },
          { codigo: 'A010300', descripcion: 'Limpieza y desbroce del terreno', unidad: 'M2', precio: 85.50 },
        ]},
        { codigo: 'A02#', nombre: 'REPLANTEO Y NIVELACION', items: [
          { codigo: 'A020000', descripcion: 'Replanteo topografico edificacion', unidad: 'M2', precio: 45.00 },
          { codigo: 'A020100', descripcion: 'Niveletas de madera', unidad: 'UND', precio: 350.00 },
          { codigo: 'A020200', descripcion: 'Control topografico durante obra', unidad: 'MES', precio: 65000.00 },
        ]},
        { codigo: 'A03#', nombre: 'MOVIMIENTOS DE TIERRA', items: [
          { codigo: 'A030000', descripcion: 'Excavacion manual zanjas hasta 1.50m', unidad: 'M3', precio: 850.00 },
          { codigo: 'A030100', descripcion: 'Excavacion a maquina', unidad: 'M3', precio: 450.00 },
          { codigo: 'A030200', descripcion: 'Relleno compactado material selecto', unidad: 'M3', precio: 1650.00 },
          { codigo: 'A030300', descripcion: 'Bote de material con camion', unidad: 'M3', precio: 1200.00 },
        ]},
        { codigo: 'A04#', nombre: 'HORMIGON ARMADO', items: [
          { codigo: 'A040000', descripcion: 'Hormigon armado zapatas 210 kg/cm2', unidad: 'M3', precio: 12500.00 },
          { codigo: 'A040100', descripcion: 'Hormigon armado columnas 210 kg/cm2', unidad: 'M3', precio: 14200.00 },
          { codigo: 'A040200', descripcion: 'Hormigon armado vigas 210 kg/cm2', unidad: 'M3', precio: 15000.00 },
          { codigo: 'A040300', descripcion: 'Hormigon armado losa 210 kg/cm2', unidad: 'M3', precio: 13800.00 },
        ]},
        { codigo: 'A06#', nombre: 'MAMPOSTERIA', items: [
          { codigo: 'A060000', descripcion: 'Muro bloque 6" con fino ambas caras', unidad: 'M2', precio: 2800.00 },
          { codigo: 'A060100', descripcion: 'Muro bloque 8" con fino ambas caras', unidad: 'M2', precio: 3200.00 },
          { codigo: 'A060200', descripcion: 'Muro bloque 6" sin fino', unidad: 'M2', precio: 1950.00 },
        ]},
      ]
    },

    // ─── C# PARTIDAS CARRETERAS Y MOV. TIERRAS ───
    {
      codigo: 'C#', nombre: 'PARTIDAS CARRETERAS Y MOV. TIERRAS', children: [
        { codigo: 'C01#', nombre: 'MOVIMIENTO DE TIERRAS CARRETERAS', items: [
          { codigo: 'C010000', descripcion: 'Corte en tierra con equipo pesado', unidad: 'M3', precio: 280.00 },
          { codigo: 'C010100', descripcion: 'Corte en roca con voladura', unidad: 'M3', precio: 950.00 },
          { codigo: 'C010200', descripcion: 'Terraplen compactado', unidad: 'M3', precio: 385.00 },
        ]},
        { codigo: 'C02#', nombre: 'SUB-BASE Y BASE', items: [
          { codigo: 'C020000', descripcion: 'Sub-base granular e=0.20m', unidad: 'M2', precio: 520.00 },
          { codigo: 'C020100', descripcion: 'Base granular e=0.15m', unidad: 'M2', precio: 680.00 },
          { codigo: 'C020200', descripcion: 'Imprimacion asfaltica MC-30', unidad: 'M2', precio: 125.00 },
        ]},
        { codigo: 'C03#', nombre: 'PAVIMENTOS', items: [
          { codigo: 'C030000', descripcion: 'Carpeta asfaltica e=2"', unidad: 'M2', precio: 1450.00 },
          { codigo: 'C030100', descripcion: 'Losa de hormigon rigido e=0.20m', unidad: 'M2', precio: 3200.00 },
          { codigo: 'C030200', descripcion: 'Adoquinado vehicular', unidad: 'M2', precio: 1850.00 },
        ]},
        { codigo: 'C04#', nombre: 'DRENAJE VIAL', items: [
          { codigo: 'C040000', descripcion: 'Cuneta de hormigon', unidad: 'ML', precio: 2800.00 },
          { codigo: 'C040100', descripcion: 'Alcantarilla tubo 36"', unidad: 'ML', precio: 12500.00 },
        ]},
      ]
    },

    // ─── E# EQUIPOS Y MAQUINARIAS ───
    {
      codigo: 'E#', nombre: 'EQUIPOS Y MAQUINARIAS', children: [
        { codigo: 'E01#', nombre: 'EQUIPOS PESADOS', items: [
          { codigo: 'E010100', descripcion: 'Retroexcavadora', unidad: 'HR', precio: 4500.00 },
          { codigo: 'E010101', descripcion: 'Excavadora de oruga CAT 320', unidad: 'HR', precio: 6500.00 },
          { codigo: 'E010200', descripcion: 'Camion volteo 10 M3', unidad: 'VIAJE', precio: 3500.00 },
          { codigo: 'E010300', descripcion: 'Pala mecanica cargadora', unidad: 'HR', precio: 4800.00 },
        ]},
        { codigo: 'E02#', nombre: 'EQUIPOS MEDIANOS', items: [
          { codigo: 'E020000', descripcion: 'Mezcladora de hormigon 2 sacos', unidad: 'DIA', precio: 2500.00 },
          { codigo: 'E020100', descripcion: 'Compactadora vibratoria manual', unidad: 'DIA', precio: 1800.00 },
          { codigo: 'E020200', descripcion: 'Cortadora de bloques', unidad: 'DIA', precio: 1200.00 },
        ]},
        { codigo: 'E03#', nombre: 'EQUIPOS MENORES Y HERRAMIENTAS', items: [
          { codigo: 'E030000', descripcion: 'Vibrador de hormigon electrico', unidad: 'DIA', precio: 800.00 },
          { codigo: 'E030100', descripcion: 'Bomba de achique 3"', unidad: 'DIA', precio: 1500.00 },
          { codigo: 'E030200', descripcion: 'Andamio metalico seccion', unidad: 'DIA', precio: 350.00 },
        ]},
      ]
    },

    // ─── H# MANO DE OBRA Y JORNALES ───
    {
      codigo: 'H#', nombre: 'MANO DE OBRA Y JORNALES', children: [
        { codigo: 'H01#', nombre: 'ALBANILERIA', items: [
          { codigo: 'H010100', descripcion: 'Maestro albanil', unidad: 'DIA', precio: 1800.00 },
          { codigo: 'H010101', descripcion: 'Albanil primera', unidad: 'DIA', precio: 1200.00 },
          { codigo: 'H010200', descripcion: 'Albanil segunda', unidad: 'DIA', precio: 900.00 },
          { codigo: 'H010300', descripcion: 'Ayudante albanil', unidad: 'DIA', precio: 700.00 },
          { codigo: 'H010400', descripcion: 'Peon', unidad: 'DIA', precio: 600.00 },
        ]},
        { codigo: 'H02#', nombre: 'PLOMERIA', items: [
          { codigo: 'H020100', descripcion: 'Plomero primera', unidad: 'DIA', precio: 1500.00 },
          { codigo: 'H020200', descripcion: 'Plomero segunda', unidad: 'DIA', precio: 1100.00 },
          { codigo: 'H020300', descripcion: 'Ayudante plomero', unidad: 'DIA', precio: 800.00 },
        ]},
        { codigo: 'H03#', nombre: 'ELECTRICIDAD', items: [
          { codigo: 'H030100', descripcion: 'Electricista primera', unidad: 'DIA', precio: 1500.00 },
          { codigo: 'H030200', descripcion: 'Electricista segunda', unidad: 'DIA', precio: 1100.00 },
          { codigo: 'H030300', descripcion: 'Ayudante electricista', unidad: 'DIA', precio: 800.00 },
        ]},
        { codigo: 'H04#', nombre: 'CARPINTERIA', items: [
          { codigo: 'H040100', descripcion: 'Carpintero primera', unidad: 'DIA', precio: 1400.00 },
          { codigo: 'H040200', descripcion: 'Carpintero segunda', unidad: 'DIA', precio: 1000.00 },
          { codigo: 'H040300', descripcion: 'Ayudante carpintero', unidad: 'DIA', precio: 750.00 },
        ]},
        { codigo: 'H05#', nombre: 'PINTURA', items: [
          { codigo: 'H050100', descripcion: 'Pintor primera', unidad: 'DIA', precio: 1300.00 },
          { codigo: 'H050200', descripcion: 'Pintor segunda', unidad: 'DIA', precio: 950.00 },
          { codigo: 'H050300', descripcion: 'Ayudante pintor', unidad: 'DIA', precio: 700.00 },
        ]},
      ]
    },

    // ─── M# MATERIALES E INSUMOS ───
    {
      codigo: 'M#', nombre: 'MATERIALES E INSUMOS', children: [
        { codigo: 'M01#', nombre: 'CEMENTOS Y AGREGADOS', items: [
          { codigo: 'M010101', descripcion: 'Cemento gris Portland tipo I', unidad: 'SACO', precio: 450.00 },
          { codigo: 'M010200', descripcion: 'Cemento blanco', unidad: 'SACO', precio: 680.00 },
          { codigo: 'M010300', descripcion: 'Arena lavada de rio', unidad: 'M3', precio: 1200.00 },
          { codigo: 'M010400', descripcion: 'Grava 3/4"', unidad: 'M3', precio: 1800.00 },
          { codigo: 'M010500', descripcion: 'Arena gruesa', unidad: 'M3', precio: 950.00 },
        ]},
        { codigo: 'M02#', nombre: 'ACEROS Y METALES', items: [
          { codigo: 'M020100', descripcion: 'Varilla 3/8" corrugada grado 60', unidad: 'QQ', precio: 3200.00 },
          { codigo: 'M020200', descripcion: 'Varilla 1/2" corrugada grado 60', unidad: 'QQ', precio: 3400.00 },
          { codigo: 'M020300', descripcion: 'Varilla 5/8" corrugada grado 60', unidad: 'QQ', precio: 3600.00 },
          { codigo: 'M020400', descripcion: 'Alambre dulce #18', unidad: 'LB', precio: 45.00 },
          { codigo: 'M020500', descripcion: 'Malla electrosoldada 6x6', unidad: 'UND', precio: 2800.00 },
        ]},
        { codigo: 'M03#', nombre: 'BLOQUES Y LADRILLOS', items: [
          { codigo: 'M030100', descripcion: 'Bloque 4" hormigon', unidad: 'UND', precio: 32.00 },
          { codigo: 'M030200', descripcion: 'Bloque 6" hormigon', unidad: 'UND', precio: 42.00 },
          { codigo: 'M030300', descripcion: 'Bloque 8" hormigon', unidad: 'UND', precio: 55.00 },
          { codigo: 'M030400', descripcion: 'Ladrillo de barro cocido', unidad: 'UND', precio: 18.00 },
        ]},
        { codigo: 'M04#', nombre: 'MADERAS', items: [
          { codigo: 'M040100', descripcion: 'Madera pino bruto 1"x12"', unidad: 'PL', precio: 85.00 },
          { codigo: 'M040200', descripcion: 'Madera pino cepillada 1"x12"', unidad: 'PL', precio: 110.00 },
          { codigo: 'M040300', descripcion: 'Plywood 4x8 1/2"', unidad: 'UND', precio: 2200.00 },
        ]},
        { codigo: 'M05#', nombre: 'TUBERIAS PVC', items: [
          { codigo: 'M050100', descripcion: 'Tubo PVC 1/2" agua fria SDR-13.5', unidad: 'UND', precio: 185.00 },
          { codigo: 'M050200', descripcion: 'Tubo PVC 3/4" agua fria SDR-13.5', unidad: 'UND', precio: 245.00 },
          { codigo: 'M050300', descripcion: 'Tubo PVC 2" drenaje SDR-41', unidad: 'UND', precio: 320.00 },
          { codigo: 'M050400', descripcion: 'Tubo PVC 4" drenaje SDR-41', unidad: 'UND', precio: 580.00 },
        ]},
      ]
    },

    // ─── S# SUBCONTRATOS ───
    {
      codigo: 'S#', nombre: 'SUBCONTRATOS', children: [
        { codigo: 'S01#', nombre: 'INSTALACIONES MECANICAS', items: [
          { codigo: 'S010100', descripcion: 'Instalacion ascensor 6 paradas', unidad: 'UND', precio: 2500000.00 },
          { codigo: 'S010200', descripcion: 'Sistema aire acondicionado central', unidad: 'TON', precio: 185000.00 },
          { codigo: 'S010300', descripcion: 'Bomba de agua sumergible 3HP', unidad: 'UND', precio: 95000.00 },
        ]},
        { codigo: 'S02#', nombre: 'SISTEMAS ESPECIALES', items: [
          { codigo: 'S020100', descripcion: 'Sistema contra incendios completo', unidad: 'GLB', precio: 850000.00 },
          { codigo: 'S020200', descripcion: 'Sistema CCTV 16 camaras', unidad: 'GLB', precio: 320000.00 },
          { codigo: 'S020300', descripcion: 'Sistema control de acceso', unidad: 'GLB', precio: 275000.00 },
        ]},
        { codigo: 'S03#', nombre: 'ACABADOS ESPECIALIZADOS', items: [
          { codigo: 'S030100', descripcion: 'Impermeabilizacion manto asfaltico', unidad: 'M2', precio: 1250.00 },
          { codigo: 'S030200', descripcion: 'Piso epóxico industrial', unidad: 'M2', precio: 2800.00 },
          { codigo: 'S030300', descripcion: 'Fachada muro cortina aluminio/vidrio', unidad: 'M2', precio: 8500.00 },
        ]},
        { codigo: 'S04#', nombre: 'ESTUDIOS Y ENSAYOS', items: [
          { codigo: 'S040100', descripcion: 'Estudio de suelos', unidad: 'GLB', precio: 120000.00 },
          { codigo: 'S040200', descripcion: 'Ensayo rotura cilindros hormigon', unidad: 'UND', precio: 1500.00 },
          { codigo: 'S040300', descripcion: 'Levantamiento topografico', unidad: 'M2', precio: 25.00 },
        ]},
      ]
    },
  ]
};
