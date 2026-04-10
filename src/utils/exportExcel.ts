import * as XLSX from 'xlsx';
import type { ConceptoPresupuesto } from '../types';
import { downloadBlob } from './exportBC3';

interface ExportExcelArgs {
  conceptos: Record<string, ConceptoPresupuesto>;
  rootIds: string[];
  projectName?: string;
}

interface Row {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number | '';
  precioInterno: number | '';
  precioCliente: number | '';
  totalInterno: number | '';
  totalCliente: number | '';
  isCapitulo: boolean;
  depth: number;
}

function buildRows(
  conceptos: Record<string, ConceptoPresupuesto>,
  rootIds: string[],
): Row[] {
  const rows: Row[] = [];

  function totalInterno(id: string): number {
    const c = conceptos[id];
    if (!c) return 0;
    if (c.childrenIds.length > 0) {
      return c.childrenIds.reduce((s, cid) => s + totalInterno(cid), 0);
    }
    return c.cantidad * c.precioInterno;
  }
  function totalCliente(id: string): number {
    const c = conceptos[id];
    if (!c) return 0;
    if (c.childrenIds.length > 0) {
      return c.childrenIds.reduce((s, cid) => s + totalCliente(cid), 0);
    }
    return c.cantidad * c.precioCliente;
  }

  function walk(ids: string[], depth: number) {
    for (const id of ids) {
      const c = conceptos[id];
      if (!c) continue;
      const isCap = c.childrenIds.length > 0;
      rows.push({
        codigo: c.codigo || '',
        descripcion: '  '.repeat(depth) + (c.descripcion || ''),
        unidad: c.unidad || '',
        cantidad: isCap ? '' : c.cantidad,
        precioInterno: isCap ? '' : c.precioInterno,
        precioCliente: isCap ? '' : c.precioCliente,
        totalInterno: totalInterno(id),
        totalCliente: totalCliente(id),
        isCapitulo: isCap,
        depth,
      });
      if (isCap) walk(c.childrenIds, depth + 1);
    }
  }
  walk(rootIds, 0);
  return rows;
}

function computeTotal(conceptos: Record<string, ConceptoPresupuesto>, id: string, key: 'precioInterno' | 'precioCliente'): number {
  const c = conceptos[id];
  if (!c) return 0;
  if (c.childrenIds.length > 0) {
    return c.childrenIds.reduce((s, cid) => s + computeTotal(conceptos, cid, key), 0);
  }
  return c.cantidad * c[key];
}

export function exportToExcel({ conceptos, rootIds, projectName = 'Presupuesto' }: ExportExcelArgs) {
  const rows = buildRows(conceptos, rootIds);

  const header = [
    'Código', 'Descripción', 'Unidad', 'Cantidad',
    'P. Costo', 'P. Venta', 'Total Costo', 'Total Venta',
  ];

  const data: (string | number)[][] = [header];
  for (const r of rows) {
    data.push([
      r.codigo,
      r.descripcion,
      r.unidad,
      r.cantidad,
      r.precioInterno,
      r.precioCliente,
      r.totalInterno,
      r.totalCliente,
    ]);
  }

  const grandInterno = rootIds.reduce((s, id) => s + computeTotal(conceptos, id, 'precioInterno'), 0);
  const grandCliente = rootIds.reduce((s, id) => s + computeTotal(conceptos, id, 'precioCliente'), 0);

  data.push([]);
  data.push(['', 'TOTAL GENERAL', '', '', '', '', grandInterno, grandCliente]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Column widths
  ws['!cols'] = [
    { wch: 14 }, { wch: 60 }, { wch: 8 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 },
  ];

  // Bold header
  const range = XLSX.utils.decode_range(ws['!ref']!);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: col });
    if (ws[addr]) {
      ws[addr].s = { font: { bold: true }, fill: { fgColor: { rgb: 'E2E8F0' } } };
    }
  }

  // Number format for numeric columns
  for (let r = 1; r <= range.e.r; r++) {
    for (const col of [3, 4, 5, 6, 7]) {
      const addr = XLSX.utils.encode_cell({ r, c: col });
      if (ws[addr] && typeof ws[addr].v === 'number') {
        ws[addr].z = '#,##0.00';
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Presupuesto');

  const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const safeName = projectName.replace(/[^a-zA-Z0-9-_ ]/g, '_');
  downloadBlob(blob, `${safeName}.xlsx`);
}
