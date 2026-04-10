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
 *   Level 1: A01#, M01#, H01#                → BC3SubCategoria
 *   Level 2: A0100#, M0101#                  → grouped into SubCategoria items
 *   Level 3: A010000, M010101                → BC3Item
 *
 * Levels 2+3 are flattened into SubCategoria.items.
 */
export function parseBC3File(content: string): BC3Data {
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Parse all records — BC3 records start with ~ and can span multiple lines
  const records = splitRecords(normalized);

  const concepts = new Map<string, RawConcept>();
  const decompositions: RawDecomposition[] = [];

  for (const record of records) {
    const type = record.charAt(1); // character after ~

    if (type === 'C') {
      parseConcept(record, concepts);
    } else if (type === 'D') {
      parseDecomposition(record, decompositions);
    }
    // ~V, ~K, ~T, ~X, ~L — skipped
  }

  // Build parent→children map from decompositions
  const childrenMap = new Map<string, string[]>();
  for (const d of decompositions) {
    const parentKey = normalizeCode(d.parentCode);
    const childCodes = d.children.map(c => normalizeCode(c.code));
    childrenMap.set(parentKey, childCodes);
  }

  // Identify hierarchy levels by code pattern
  // Level 0 (top categories): single letter + # (e.g. "A#", "M#")
  // Level 1 (subcategories): letter + 2 digits + # (e.g. "A01#")
  // Level 2 (sub-sub): letter + 4 digits + # (e.g. "A0100#")
  // Level 3 (items): letter + 6 digits (e.g. "A010000")

  const topCategories: BC3Categoria[] = [];

  // Find root-level decomposition (the root concept that decomposes into top categories)
  // Or find top categories by pattern matching
  const topCodes = findTopCategories(concepts, childrenMap);

  for (const topCode of topCodes) {
    const topConcept = concepts.get(topCode);
    if (!topConcept) continue;

    const categoria: BC3Categoria = {
      codigo: topConcept.code,
      nombre: cleanDescription(topConcept.description),
      children: [],
    };

    // Get level-1 children of this top category
    const level1Codes = childrenMap.get(topCode) ?? [];

    for (const l1Code of level1Codes) {
      const l1Concept = concepts.get(l1Code);
      if (!l1Concept) continue;

      const subCategoria: BC3SubCategoria = {
        codigo: l1Concept.code,
        nombre: cleanDescription(l1Concept.description),
        items: [],
      };

      // Get level-2 children (sub-subcategories)
      const level2Codes = childrenMap.get(l1Code) ?? [];

      for (const l2Code of level2Codes) {
        const l2Concept = concepts.get(l2Code);

        // Get level-3 items under this sub-subcategory
        const level3Codes = childrenMap.get(l2Code) ?? [];

        for (const l3Code of level3Codes) {
          const l3Concept = concepts.get(l3Code);
          if (!l3Concept) continue;

          subCategoria.items.push({
            codigo: l3Concept.code,
            descripcion: cleanDescription(l3Concept.description),
            unidad: l3Concept.unit || (l2Concept?.unit ?? ''),
            precio: l3Concept.price,
          });
        }

        // If level 2 has no children, it might itself be a leaf item
        if (level3Codes.length === 0 && l2Concept && l2Concept.price > 0) {
          subCategoria.items.push({
            codigo: l2Concept.code,
            descripcion: cleanDescription(l2Concept.description),
            unidad: l2Concept.unit,
            precio: l2Concept.price,
          });
        }
      }

      // If level 1 has direct leaf children (no level-2 intermediary)
      if (level2Codes.length === 0) {
        // The l1 children might be direct items — check childrenMap
        // This handles cases where the hierarchy is only 2 levels deep
      }

      if (subCategoria.items.length > 0) {
        categoria.children.push(subCategoria);
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
