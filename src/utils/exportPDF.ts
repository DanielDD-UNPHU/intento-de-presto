import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ConceptoPresupuesto } from '../types';

interface ExportPDFArgs {
  conceptos: Record<string, ConceptoPresupuesto>;
  rootIds: string[];
  projectName?: string;
  companyName?: string;
}

function formatMoney(n: number): string {
  return n.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function computeTotal(conceptos: Record<string, ConceptoPresupuesto>, id: string, key: 'precioInterno' | 'precioCliente'): number {
  const c = conceptos[id];
  if (!c) return 0;
  if (c.childrenIds.length > 0) {
    return c.childrenIds.reduce((s, cid) => s + computeTotal(conceptos, cid, key), 0);
  }
  return c.cantidad * c[key];
}

interface PDFRow {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: string;
  precio: string;
  total: string;
  isCapitulo: boolean;
  depth: number;
}

function buildRows(conceptos: Record<string, ConceptoPresupuesto>, rootIds: string[]): PDFRow[] {
  const rows: PDFRow[] = [];
  function walk(ids: string[], depth: number) {
    for (const id of ids) {
      const c = conceptos[id];
      if (!c) continue;
      const isCap = c.childrenIds.length > 0;
      const totalC = computeTotal(conceptos, id, 'precioCliente');
      rows.push({
        codigo: c.codigo || '',
        descripcion: '  '.repeat(depth) + (c.descripcion || ''),
        unidad: c.unidad || '',
        cantidad: isCap ? '' : formatMoney(c.cantidad),
        precio: isCap ? '' : formatMoney(c.precioCliente),
        total: formatMoney(totalC),
        isCapitulo: isCap,
        depth,
      });
      if (isCap) walk(c.childrenIds, depth + 1);
    }
  }
  walk(rootIds, 0);
  return rows;
}

export function exportToPDF({
  conceptos, rootIds,
  projectName = 'Presupuesto de Obra',
  companyName = 'LOREGO BOSQUILLA SRL',
}: ExportPDFArgs) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(projectName, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(companyName, 40, 56);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-DO')}`, pageW - 40, 56, { align: 'right' });
  doc.setTextColor(0);

  const rows = buildRows(conceptos, rootIds);
  const body = rows.map(r => [r.codigo, r.descripcion, r.unidad, r.cantidad, r.precio, r.total]);

  autoTable(doc, {
    startY: 72,
    head: [['Código', 'Descripción', 'Unidad', 'Cantidad', 'P. Venta', 'Total']],
    body,
    theme: 'grid',
    headStyles: { fillColor: [3, 28, 139], textColor: 255, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 60, halign: 'right' },
      4: { cellWidth: 70, halign: 'right' },
      5: { cellWidth: 85, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const row = rows[data.row.index];
        if (row?.isCapitulo) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [241, 245, 249];
        }
      }
    },
    margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
      const str = `Página ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(str, pageW - 40, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
      doc.setTextColor(0);
      data.settings.margin.top = 30;
    },
  });

  const grandInterno = rootIds.reduce((s, id) => s + computeTotal(conceptos, id, 'precioInterno'), 0);
  const grandCliente = rootIds.reduce((s, id) => s + computeTotal(conceptos, id, 'precioCliente'), 0);
  const margin = grandCliente > 0 ? ((grandCliente - grandInterno) / grandCliente) * 100 : 0;

  // Totals block
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? 72;
  const ty = finalY + 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Costo total:', pageW - 260, ty);
  doc.text(`RD$ ${formatMoney(grandInterno)}`, pageW - 40, ty, { align: 'right' });
  doc.text('Venta total:', pageW - 260, ty + 14);
  doc.text(`RD$ ${formatMoney(grandCliente)}`, pageW - 40, ty + 14, { align: 'right' });
  doc.text('Margen:', pageW - 260, ty + 28);
  doc.text(`${margin.toFixed(1)}%`, pageW - 40, ty + 28, { align: 'right' });

  const safeName = projectName.replace(/[^a-zA-Z0-9-_ ]/g, '_');
  doc.save(`${safeName}.pdf`);
}
