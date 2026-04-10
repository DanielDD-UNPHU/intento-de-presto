import type { Bloque } from '../types';

export const mockBloques: Bloque[] = [
  {
    id: 'bloque-a',
    nombre: 'Torre A — Residencial',
    codigo: 'A',
    niveles: [
      { id: 'a-s1', bloqueId: 'bloque-a', numero: -1, nombre: 'Sotano 1' },
      { id: 'a-pb', bloqueId: 'bloque-a', numero: 0, nombre: 'Planta Baja' },
      { id: 'a-n1', bloqueId: 'bloque-a', numero: 1, nombre: 'Nivel 1' },
      { id: 'a-n2', bloqueId: 'bloque-a', numero: 2, nombre: 'Nivel 2' },
      { id: 'a-n3', bloqueId: 'bloque-a', numero: 3, nombre: 'Nivel 3' },
      { id: 'a-n4', bloqueId: 'bloque-a', numero: 4, nombre: 'Nivel 4' },
      { id: 'a-n5', bloqueId: 'bloque-a', numero: 5, nombre: 'Nivel 5' },
      { id: 'a-n6', bloqueId: 'bloque-a', numero: 6, nombre: 'Nivel 6' },
      { id: 'a-n7', bloqueId: 'bloque-a', numero: 7, nombre: 'Nivel 7' },
      { id: 'a-n8', bloqueId: 'bloque-a', numero: 8, nombre: 'Nivel 8' },
      { id: 'a-az', bloqueId: 'bloque-a', numero: 9, nombre: 'Azotea' },
    ],
  },
  {
    id: 'bloque-b',
    nombre: 'Torre B — Comercial',
    codigo: 'B',
    niveles: [
      { id: 'b-s1', bloqueId: 'bloque-b', numero: -1, nombre: 'Sotano 1' },
      { id: 'b-pb', bloqueId: 'bloque-b', numero: 0, nombre: 'Planta Baja' },
      { id: 'b-n1', bloqueId: 'bloque-b', numero: 1, nombre: 'Nivel 1' },
      { id: 'b-n2', bloqueId: 'bloque-b', numero: 2, nombre: 'Nivel 2' },
      { id: 'b-n3', bloqueId: 'bloque-b', numero: 3, nombre: 'Nivel 3' },
      { id: 'b-n4', bloqueId: 'bloque-b', numero: 4, nombre: 'Nivel 4' },
      { id: 'b-az', bloqueId: 'bloque-b', numero: 5, nombre: 'Azotea' },
    ],
  },
  {
    id: 'bloque-c',
    nombre: 'Areas Comunes',
    codigo: 'C',
    niveles: [
      { id: 'c-ext', bloqueId: 'bloque-c', numero: 0, nombre: 'Exterior' },
      { id: 'c-pb', bloqueId: 'bloque-c', numero: 1, nombre: 'Lobby y Amenidades' },
    ],
  },
];
