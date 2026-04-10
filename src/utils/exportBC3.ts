import type { ConceptoPresupuesto } from '../types';

/**
 * Exports the current presupuesto tree to FIEBDC-3 (.bc3) format.
 *
 * Strategy:
 *  - One ~C record per concepto, with a globally unique code.
 *  - One ~D record per non-leaf parent, listing its children.
 *  - A synthetic root concept "##" whose decomposition holds all rootIds.
 *  - The file is encoded as Latin-1 (ANSI) to match the FIEBDC spec.
 */

interface ExportBC3Args {
  conceptos: Record<string, ConceptoPresupuesto>;
  rootIds: string[];
  projectName?: string;
}

export function exportToBC3({ conceptos, rootIds, projectName = 'Presupuesto' }: ExportBC3Args): Blob {
  // id → unique code map (some conceptos share codes, e.g. two "BLQ-A")
  const codeById = new Map<string, string>();
  const usedCodes = new Set<string>();

  function uniqueCode(base: string, id: string): string {
    const cleaned = (base || '').replace(/[|\\~]/g, '').trim();
    const fallback = `N_${id.slice(0, 8)}`;
    let candidate = cleaned || fallback;
    if (!usedCodes.has(candidate)) {
      usedCodes.add(candidate);
      return candidate;
    }
    candidate = `${cleaned || 'N'}_${id.slice(0, 6)}`;
    let n = 1;
    while (usedCodes.has(candidate)) {
      candidate = `${cleaned || 'N'}_${id.slice(0, 6)}_${n++}`;
    }
    usedCodes.add(candidate);
    return candidate;
  }

  const ids = Object.keys(conceptos);
  for (const id of ids) {
    const c = conceptos[id];
    codeById.set(id, uniqueCode(c.codigoBC3 || c.codigo, id));
  }

  const lines: string[] = [];
  const today = formatFiebdcDate(new Date());

  // ── Header ──
  lines.push(`~V|BIMCORD|FIEBDC-3/2020\\${today}|IntentoDePresto 1.0|${escapeField(projectName)}|ANSI||2||||`);
  lines.push(`~K|\\2\\2\\4\\2\\2\\2\\2\\DOP\\|0\\0\\0\\0\\0|3\\2\\\\3\\4\\\\2\\2\\2\\2\\2\\2\\2\\2\\DOP\\|`);

  // ── Root concept ──
  const ROOT_CODE = '##';
  usedCodes.add(ROOT_CODE);
  lines.push(`~C|${ROOT_CODE}||${escapeField(projectName)}|0\\0\\0\\0|${today}|0|`);

  // ── Concept records (~C) ──
  for (const id of ids) {
    const c = conceptos[id];
    const code = codeById.get(id)!;
    const unit = escapeField(c.unidad || '');
    const description = escapeField(c.descripcion || code);
    const price = Number.isFinite(c.precioCliente) ? c.precioCliente : 0;
    const priceField = `${price}\\${price}\\${price}\\${price}`;
    const type = c.childrenIds.length > 0 ? 0 : 1;
    lines.push(`~C|${code}|${unit}|${description}|${priceField}|${today}|${type}|`);
  }

  // ── Decomposition records (~D) ──
  // Root decomposition
  if (rootIds.length > 0) {
    const childParts: string[] = [];
    for (const childId of rootIds) {
      const childCode = codeById.get(childId);
      if (!childCode) continue;
      childParts.push(`${childCode}\\1\\1`);
    }
    lines.push(`~D|${ROOT_CODE}|${childParts.join('\\')}\\|`);
  }

  // Parent decompositions
  for (const id of ids) {
    const c = conceptos[id];
    if (c.childrenIds.length === 0) continue;

    const parentCode = codeById.get(id)!;
    const parts: string[] = [];
    for (const childId of c.childrenIds) {
      const child = conceptos[childId];
      if (!child) continue;
      const childCode = codeById.get(childId);
      if (!childCode) continue;
      // yield = cantidad for items, 1 for sub-capítulos
      const yieldVal = child.childrenIds.length === 0 && child.cantidad > 0 ? child.cantidad : 1;
      parts.push(`${childCode}\\1\\${yieldVal}`);
    }
    lines.push(`~D|${parentCode}|${parts.join('\\')}\\|`);
  }

  // ── Encode as Latin-1 (ANSI) ──
  const text = lines.join('\r\n') + '\r\n';
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    bytes[i] = ch > 0xff ? 0x3f : ch; // non-Latin-1 chars → '?'
  }
  return new Blob([bytes], { type: 'application/octet-stream' });
}

function formatFiebdcDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

function escapeField(s: string): string {
  // Pipes and backslashes are record separators in FIEBDC — strip them.
  return s.replace(/[|\\~\r\n]/g, ' ').trim();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
