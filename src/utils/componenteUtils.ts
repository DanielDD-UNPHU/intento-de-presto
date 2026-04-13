import { v4 as uuidv4 } from 'uuid';
import type { ConceptoPresupuesto, ComponenteInfo } from '../types';

export const COMPONENTE_COLORS = [
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
  '#ef4444', // red
  '#06b6d4', // cyan
  '#a855f7', // purple
];

export function pickNextColor(existing: Record<string, ComponenteInfo>): string {
  const used = new Set(Object.values(existing).map((c) => c.color));
  const free = COMPONENTE_COLORS.find((c) => !used.has(c));
  if (free) return free;
  return COMPONENTE_COLORS[Object.keys(existing).length % COMPONENTE_COLORS.length];
}

export function newComponenteId(): string {
  return `comp-${uuidv4().slice(0, 8)}`;
}

export function newSlotId(): string {
  return `slot-${uuidv4().slice(0, 8)}`;
}

export function findInstanceIdsByComponenteId(
  conceptos: Record<string, ConceptoPresupuesto>,
  componenteId: string,
): string[] {
  return Object.values(conceptos)
    .filter((c) => c.componenteId === componenteId)
    .map((c) => c.id);
}

export function findLinkedIdsBySlot(
  conceptos: Record<string, ConceptoPresupuesto>,
  componenteId: string,
  slotId: string,
): string[] {
  return Object.values(conceptos)
    .filter((c) => c.componenteId === componenteId && c.componenteSlotId === slotId)
    .map((c) => c.id);
}

/**
 * Sube por parentId hasta encontrar el ancestro que representa una "instancia"
 * del componente (el Bloque o carpeta de nivel superior donde vive el item).
 * Dos items con el mismo anchor pertenecen a la misma instancia.
 */
export function findInstanceAnchor(
  conceptos: Record<string, ConceptoPresupuesto>,
  itemId: string,
): string | null {
  let current = conceptos[itemId];
  let anchor: string | null = null;
  while (current) {
    if (current.esBloque || current.nivel === 0) {
      anchor = current.id;
      break;
    }
    if (!current.parentId) {
      anchor = current.id;
      break;
    }
    current = conceptos[current.parentId];
  }
  return anchor;
}

/**
 * Agrupa todos los items de un componente por su instancia (anchor).
 * Devuelve Map<anchorId, itemIds[]> para poder iterar cada instancia.
 */
export function groupInstancesByAnchor(
  conceptos: Record<string, ConceptoPresupuesto>,
  componenteId: string,
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  const ids = findInstanceIdsByComponenteId(conceptos, componenteId);
  for (const id of ids) {
    const anchor = findInstanceAnchor(conceptos, id);
    if (!anchor) continue;
    if (!groups.has(anchor)) groups.set(anchor, []);
    groups.get(anchor)!.push(id);
  }
  return groups;
}

export function createComponenteInfo(nombre: string, existing: Record<string, ComponenteInfo>): ComponenteInfo {
  return {
    id: newComponenteId(),
    nombre: nombre.trim(),
    color: pickNextColor(existing),
    createdAt: new Date().toISOString(),
  };
}
