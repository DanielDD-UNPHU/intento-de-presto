import type { ConceptoPresupuesto } from '../types';

export type CapituloRole = 'nivel' | 'bloque' | 'folder' | 'bc3';

export function getCapituloRole(c: ConceptoPresupuesto): CapituloRole | null {
  if (c.tipo !== 'Capitulo') return null;
  if (c.codigo.endsWith('#')) return 'bc3';
  if (!c.parentId) return 'nivel';
  if (c.esBloque) return 'bloque';
  return 'folder';
}

/**
 * Deriva el nivel BC3 a partir del código FIEBDC-3:
 *   A#      → 0 (categoría raíz, "abuelo")
 *   A04#    → 1 (subcategoría, "padre")
 *   A0402#  → 2 (subsubcategoría, "hijo")
 *   otro    → null
 */
export function computeBC3LevelFromCodigo(codigo: string): 0 | 1 | 2 | null {
  if (!codigo.endsWith('#')) return null;
  const core = codigo.slice(0, -1);
  if (core.length === 1) return 0;
  if (core.length === 3) return 1;
  if (core.length === 5) return 2;
  return null;
}

/**
 * Lee el nivel BC3 de un concepto. Prefiere el field explícito `bc3Level`
 * guardado en el dato; si no existe (datos viejos), cae a la derivación por
 * longitud del código.
 *
 * Dos caps con el mismo nivel son HERMANOS y no pueden anidarse entre sí.
 */
export function getBC3Level(c: ConceptoPresupuesto): 0 | 1 | 2 | null {
  if (c.tipo !== 'Capitulo') return null;
  if (c.bc3Level !== undefined) return c.bc3Level;
  return computeBC3LevelFromCodigo(c.codigo);
}

/**
 * True si `target` es un ancestro BC3 legítimo de `drag` — o sea, si el código
 * del target (sin el #) es un prefijo ESTRICTO del código del drag (sin el #).
 *
 * Ejemplos válidos:
 *   target A#     (A)     es ancestro de drag A04#  (A04)   → sí, "A" es prefijo de "A04"
 *   target A04#   (A04)   es ancestro de drag A0402# (A0402)→ sí, "A04" es prefijo de "A0402"
 *
 * Ejemplos NO válidos:
 *   target A05#   (A05)   vs drag A0402# (A0402) → "A05" NO es prefijo de "A0402"
 *   target A05#   (A05)   vs drag A04#   (A04)   → "A05" NO es prefijo de "A04" + mismo nivel
 *   target M#     (M)     vs drag A04#   (A04)   → "M" NO es prefijo de "A04" (otra familia)
 *
 * Esto asegura que un BC3 cap solo se anide dentro de su propio linaje (su
 * "abuelo/padre" directo), nunca dentro de un hermano u otra familia.
 */
export function isBC3Ancestor(target: ConceptoPresupuesto, drag: ConceptoPresupuesto): boolean {
  if (!target.codigo.endsWith('#') || !drag.codigo.endsWith('#')) return false;
  const targetCode = target.codigo.slice(0, -1);
  const dragCode = drag.codigo.slice(0, -1);
  if (targetCode.length >= dragCode.length) return false;
  return dragCode.startsWith(targetCode);
}

interface RoleConfig {
  label: string;
  short: string;
  color: string;
  colorLight: string;
  rowBg: string;
  rowBorder: string;
  rowHover: string;
  rowNumberBg: string;
  rowNumberText: string;
}

export const ROLE_CONFIG: Record<CapituloRole, RoleConfig> = {
  nivel: {
    label: 'Nivel',
    short: 'NIV',
    color: '#1d4ed8',
    colorLight: '#dbeafe',
    rowBg: 'bg-blue-100/70',
    rowBorder: 'border-l-4 border-l-blue-600',
    rowHover: 'hover:bg-blue-100',
    rowNumberBg: 'bg-blue-200',
    rowNumberText: 'text-blue-800',
  },
  bloque: {
    label: 'Bloque',
    short: 'BLQ',
    color: '#b45309',
    colorLight: '#fef3c7',
    rowBg: 'bg-amber-50/80',
    rowBorder: 'border-l-4 border-l-amber-500',
    rowHover: 'hover:bg-amber-100/70',
    rowNumberBg: 'bg-amber-200',
    rowNumberText: 'text-amber-800',
  },
  folder: {
    label: 'Carpeta',
    short: 'FLD',
    color: '#6d28d9',
    colorLight: '#ede9fe',
    rowBg: 'bg-violet-50/70',
    rowBorder: 'border-l-4 border-l-violet-500',
    rowHover: 'hover:bg-violet-100/60',
    rowNumberBg: 'bg-violet-200',
    rowNumberText: 'text-violet-800',
  },
  bc3: {
    label: 'Categoría BC3',
    short: 'BC3',
    color: '#475569',
    colorLight: '#f1f5f9',
    rowBg: 'bg-slate-50/60',
    rowBorder: 'border-l-4 border-l-slate-300',
    rowHover: 'hover:bg-slate-100/60',
    rowNumberBg: 'bg-slate-200',
    rowNumberText: 'text-slate-700',
  },
};
