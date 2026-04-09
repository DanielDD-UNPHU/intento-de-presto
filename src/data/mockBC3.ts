import type { BC3Data } from '../types';

export const mockBC3: BC3Data = {
  categories: [
    {
      codigo: 'M#', nombre: 'MATERIALES E INSUMOS', children: [
        { codigo: 'M01#', nombre: 'CEMENTOS Y AGREGADOS', items: [
          { codigo: 'M01001', descripcion: 'Cemento Portland tipo I', unidad: 'SACO', precio: 450 },
          { codigo: 'M01002', descripcion: 'Arena lavada', unidad: 'M3', precio: 1200 },
          { codigo: 'M01003', descripcion: 'Grava 3/4', unidad: 'M3', precio: 1800 },
        ]},
        { codigo: 'M02#', nombre: 'ACEROS', items: [
          { codigo: 'M02001', descripcion: 'Varilla 3/8 corrugada grado 60', unidad: 'QQ', precio: 3200 },
          { codigo: 'M02002', descripcion: 'Varilla 1/2 corrugada grado 60', unidad: 'QQ', precio: 3400 },
          { codigo: 'M02003', descripcion: 'Alambre dulce #18', unidad: 'LB', precio: 45 },
        ]},
        { codigo: 'M03#', nombre: 'BLOQUES Y LADRILLOS', items: [
          { codigo: 'M03001', descripcion: 'Bloque 6" hormigon', unidad: 'UND', precio: 42 },
          { codigo: 'M03002', descripcion: 'Bloque 8" hormigon', unidad: 'UND', precio: 55 },
        ]},
      ]
    },
    {
      codigo: 'H#', nombre: 'MANO DE OBRA Y JORNALES', children: [
        { codigo: 'H01#', nombre: 'ALBAÑILERIA', items: [
          { codigo: 'H01001', descripcion: 'Albañil primera', unidad: 'DIA', precio: 1200 },
          { codigo: 'H01002', descripcion: 'Ayudante albañil', unidad: 'DIA', precio: 800 },
          { codigo: 'H01003', descripcion: 'Peon', unidad: 'DIA', precio: 600 },
        ]},
        { codigo: 'H02#', nombre: 'PLOMERIA', items: [
          { codigo: 'H02001', descripcion: 'Plomero primera', unidad: 'DIA', precio: 1500 },
          { codigo: 'H02002', descripcion: 'Ayudante plomero', unidad: 'DIA', precio: 900 },
        ]},
      ]
    },
    {
      codigo: 'E#', nombre: 'EQUIPOS Y MAQUINARIAS', children: [
        { codigo: 'E01#', nombre: 'EQUIPOS PESADOS', items: [
          { codigo: 'E01001', descripcion: 'Retroexcavadora CAT 420', unidad: 'HR', precio: 4500 },
          { codigo: 'E01002', descripcion: 'Camion volteo 10 M3', unidad: 'VIAJE', precio: 3500 },
        ]},
      ]
    },
    {
      codigo: 'A#', nombre: 'PARTIDAS EDIFICACIONES', children: [
        { codigo: 'A01#', nombre: 'TRABAJOS PRELIMINARES', items: [
          { codigo: 'A010100', descripcion: 'Verja perimetral madera y aluzinc', unidad: 'ML', precio: 4148 },
          { codigo: 'A010200', descripcion: 'Letrero de obra', unidad: 'UND', precio: 126000 },
        ]},
        { codigo: 'A03#', nombre: 'MOVIMIENTOS DE TIERRA', items: [
          { codigo: 'A030001', descripcion: 'Excavacion manual zanjas', unidad: 'M3', precio: 850 },
          { codigo: 'A030100', descripcion: 'Excavacion a maquina', unidad: 'M3', precio: 450 },
          { codigo: 'A030201', descripcion: 'Relleno compactado', unidad: 'M3', precio: 650 },
          { codigo: 'A030300', descripcion: 'Bote de material', unidad: 'M3', precio: 1200 },
        ]},
        { codigo: 'A04#', nombre: 'HORMIGON', items: [
          { codigo: 'A040001', descripcion: 'Hormigon armado zapatas 210kg/cm2', unidad: 'M3', precio: 12500 },
          { codigo: 'A040100', descripcion: 'Hormigon armado columnas 210kg/cm2', unidad: 'M3', precio: 14200 },
          { codigo: 'A040200', descripcion: 'Hormigon armado vigas 210kg/cm2', unidad: 'M3', precio: 15000 },
          { codigo: 'A040300', descripcion: 'Hormigon armado losa 210kg/cm2', unidad: 'M3', precio: 13800 },
        ]},
        { codigo: 'A06#', nombre: 'MAMPOSTERIA', items: [
          { codigo: 'A060001', descripcion: 'Muro bloque 6" con fino', unidad: 'M2', precio: 2800 },
          { codigo: 'A060100', descripcion: 'Muro bloque 8" con fino', unidad: 'M2', precio: 3200 },
        ]},
        { codigo: 'A15#', nombre: 'PLOMERIA', items: [
          { codigo: 'A150001', descripcion: 'Punto agua fria PVC 1/2"', unidad: 'UND', precio: 2500 },
          { codigo: 'A150100', descripcion: 'Punto desague PVC 2"', unidad: 'UND', precio: 1800 },
          { codigo: 'A150200', descripcion: 'Punto desague PVC 4"', unidad: 'UND', precio: 2200 },
        ]},
        { codigo: 'A16#', nombre: 'ELECTRICIDAD', items: [
          { codigo: 'A160001', descripcion: 'Punto de luz sencillo', unidad: 'UND', precio: 3500 },
          { codigo: 'A160100', descripcion: 'Punto tomacorriente doble', unidad: 'UND', precio: 2800 },
          { codigo: 'A160200', descripcion: 'Punto interruptor sencillo', unidad: 'UND', precio: 1500 },
        ]},
      ]
    },
    {
      codigo: 'S#', nombre: 'SUBCONTRATOS', children: [
        { codigo: 'S01#', nombre: 'SUBCONTRATOS GENERALES', items: [
          { codigo: 'S010001', descripcion: 'Instalacion ascensor', unidad: 'UND', precio: 2500000 },
          { codigo: 'S010002', descripcion: 'Sistema contra incendios', unidad: 'GLB', precio: 850000 },
        ]},
      ]
    },
  ]
};
