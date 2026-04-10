import type { ConceptoPresupuesto } from '../types';

export type CapituloRole = 'nivel' | 'bloque' | 'folder' | 'bc3';

export function getCapituloRole(
  c: ConceptoPresupuesto,
  conceptos: Record<string, ConceptoPresupuesto>
): CapituloRole | null {
  if (c.tipo !== 'Capitulo') return null;
  if (c.codigo.endsWith('#')) return 'bc3';
  if (!c.parentId) return 'nivel';
  const parent = conceptos[c.parentId];
  if (parent && !parent.parentId && parent.tipo === 'Capitulo' && !parent.codigo.endsWith('#')) {
    return 'bloque';
  }
  return 'folder';
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
