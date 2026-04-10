import type { BC3Data, BC3Categoria, BC3SubCategoria, BC3Item } from '../types';

interface RawConcept {
  code: string;
  unit: string;
  description: string;
  price: number;
  type: number;
}

interface RawDecomposition {
  parentCode: string;
  children: { code: string; factor: number; yield: number }[];
}

/**
 * Parses a FIEBDC-3 (.bc3) file into our BC3Data structure.
 *
 * BC3 hierarchy (4 levels):
 *   Level 0: A#, M#, H#, E#, S#, C#         → BC3Categoria
 *   Level 1: A01#, A04#, M01#                → BC3Categoria (nested under level 0)
 *   Level 2: A0400#, A0401#, M0101#          → BC3SubCategoria
 *   Level 3: A040000, A040100, M010101       → BC3Item
 *
 * Level 0 categories contain level 1 sub-categories.
 * Level 1 sub-categories contain level 2 sub-sub-categories as BC3SubCategoria.
 * Level 2 sub-sub-categories contain level 3 items as BC3Item.
 * If level 2 has no children but has a price, it becomes an item itself.
 */
export function parseBC3File(content: string): BC3Data {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const records = splitRecords(normalized);

  const concepts = new Map<string, RawConcept>();
  const decompositions: RawDecomposition[] = [];

  for (const record of records) {
    const type = record.charAt(1);
    if (type === 'C') parseConcept(record, concepts);
    else if (type === 'D') parseDecomposition(record, decompositions);
  }

  // Build parent→children map
  const childrenMap = new Map<string, string[]>();
  for (const d of decompositions) {
    childrenMap.set(normalizeCode(d.parentCode), d.children.map(c => normalizeCode(c.code)));
  }

  // Recursively collect all leaf items under a code
  function collectItems(code: string): BC3Item[] {
    const items: BC3Item[] = [];
    const children = childrenMap.get(code) ?? [];

    for (const childCode of children) {
      const child = concepts.get(childCode);
      if (!child) continue;

      const grandchildren = childrenMap.get(childCode) ?? [];

      if (grandchildren.length > 0) {
        // This child has its own children — recurse
        items.push(...collectItems(childCode));
      } else if (child.price > 0 || child.unit) {
        // Leaf item
        items.push({
          codigo: child.code,
          descripcion: cleanDescription(child.description),
          unidad: child.unit,
          precio: child.price,
        });
      }
    }
    return items;
  }

  const topCategories: BC3Categoria[] = [];
  const topCodes = findTopCategories(concepts, childrenMap);

  for (const topCode of topCodes) {
    const topConcept = concepts.get(topCode);
    if (!topConcept) continue;

    const categoria: BC3Categoria = {
      codigo: topConcept.code,
      nombre: cleanDescription(topConcept.description),
      children: [],
    };

    // Level 1 children (e.g. A01#, A04#)
    const level1Codes = childrenMap.get(topCode) ?? [];

    for (const l1Code of level1Codes) {
      const l1Concept = concepts.get(l1Code);
      if (!l1Concept) continue;

      // Level 2 children (e.g. A0400#, A0401#)
      const level2Codes = childrenMap.get(l1Code) ?? [];

      if (level2Codes.length === 0) {
        // Level 1 has no sub-subcategories — treat its items directly
        const items = collectItems(l1Code);
        if (items.length > 0) {
          categoria.children.push({
            codigo: l1Concept.code,
            nombre: cleanDescription(l1Concept.description),
            items,
          });
        }
        continue;
      }

      // Level 1 has level 2 children — each becomes a SubCategoria
      for (const l2Code of level2Codes) {
        const l2Concept = concepts.get(l2Code);
        if (!l2Concept) continue;

        const items = collectItems(l2Code);

        // If no children items but has a price, it's a leaf
        if (items.length === 0 && l2Concept.price > 0) {
          items.push({
            codigo: l2Concept.code,
            descripcion: cleanDescription(l2Concept.description),
            unidad: l2Concept.unit,
            precio: l2Concept.price,
          });
        }

        if (items.length > 0) {
          categoria.children.push({
            codigo: l2Concept.code,
            nombre: cleanDescription(l2Concept.description),
            items,
          });
        }
      }
    }

    if (categoria.children.length > 0) {
      topCategories.push(categoria);
    }
  }

  return { categories: topCategories };
}

/** Split the raw file content into individual ~ records */
function splitRecords(content: string): string[] {
  const records: string[] = [];
  const lines = content.split('\n');
  let current = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('~')) {
      if (current) {
        records.push(current);
      }
      current = trimmed;
    } else if (current && trimmed) {
      // Continuation of previous record
      current += trimmed;
    }
  }
  if (current) {
    records.push(current);
  }

  return records;
}

/** Parse a ~C record into a concept */
function parseConcept(record: string, concepts: Map<string, RawConcept>): void {
  // Format: ~C|CODE|UNIT|DESCRIPTION|PRICE1\PRICE2\...|DATE|TYPE|
  const fields = splitFields(record);
  if (fields.length < 2) return;

  const code = fields[1]?.trim() ?? '';
  if (!code) return;

  const unit = fields[2]?.trim() ?? '';
  const description = fields[3]?.trim() ?? '';

  // Price field: PRICE1\PRICE2\PRICE3\PRICE4 — take first
  const priceField = fields[4] ?? '';
  const prices = priceField.split('\\');
  const price = parseFloat(prices[0] ?? '0') || 0;

  // Type field (index 6)
  const typeVal = parseInt(fields[6] ?? '0', 10) || 0;

  const normalizedCode = normalizeCode(code);
  concepts.set(normalizedCode, {
    code,
    unit,
    description,
    price,
    type: typeVal,
  });
}

/** Parse a ~D record into a decomposition */
function parseDecomposition(record: string, decompositions: RawDecomposition[]): void {
  // Format: ~D|PARENT_CODE|CHILD1\factor\yield\CHILD2\factor\yield\...|
  const fields = splitFields(record);
  if (fields.length < 3) return;

  const parentCode = normalizeCode(fields[1]?.trim() ?? '');
  if (!parentCode) return;

  const childField = fields[2] ?? '';
  const parts = childField.split('\\');

  const children: { code: string; factor: number; yield: number }[] = [];

  // Every 3 values: code, factor, yield
  for (let i = 0; i < parts.length; i += 3) {
    const childCode = parts[i]?.trim();
    if (!childCode) continue;
    const factor = parseFloat(parts[i + 1] ?? '1') || 1;
    const yieldVal = parseFloat(parts[i + 2] ?? '1') || 1;
    children.push({ code: normalizeCode(childCode), factor, yield: yieldVal });
  }

  if (children.length > 0) {
    decompositions.push({ parentCode, children });
  }
}

/** Split a record by | separator, handling the leading ~X prefix */
function splitFields(record: string): string[] {
  // Remove trailing | if present and split
  const cleaned = record.endsWith('|') ? record.slice(0, -1) : record;
  return cleaned.split('|');
}

/** Normalize a code for map lookups (trim whitespace, keep case) */
function normalizeCode(code: string): string {
  return code.trim();
}

/** Find top-level category codes (A#, M#, H#, E#, S#, C#) */
function findTopCategories(
  concepts: Map<string, RawConcept>,
  childrenMap: Map<string, string[]>,
): string[] {
  const topPattern = /^[A-Z]#$/;
  const topCodes: string[] = [];

  // First try: look for codes matching the pattern in concepts
  for (const code of concepts.keys()) {
    if (topPattern.test(code)) {
      topCodes.push(code);
    }
  }

  if (topCodes.length > 0) {
    return topCodes.sort();
  }

  // Fallback: find codes that appear as parents in decompositions
  // but never as children, and look like category codes
  const allChildren = new Set<string>();
  for (const codes of childrenMap.values()) {
    for (const c of codes) {
      allChildren.add(c);
    }
  }

  for (const code of childrenMap.keys()) {
    if (!allChildren.has(code) || topPattern.test(code)) {
      const concept = concepts.get(code);
      if (concept && code.endsWith('#') && code.length <= 3) {
        topCodes.push(code);
      }
    }
  }

  return topCodes.sort();
}

/** Clean up description text (handle encoding artifacts) */
function cleanDescription(desc: string): string {
  // Common Latin-1 → UTF-8 mojibake fixes
  return desc
    .replace(/Ã¡/g, 'a').replace(/Ã©/g, 'e').replace(/Ã­/g, 'i')
    .replace(/Ã³/g, 'o').replace(/Ãº/g, 'u').replace(/Ã±/g, 'n')
    .replace(/Ã\u0081/g, 'A').replace(/Ã‰/g, 'E').replace(/Ã\u008D/g, 'I')
    .replace(/Ã"/g, 'O').replace(/Ãš/g, 'U').replace(/Ã'/g, 'N')
    .trim();
}
