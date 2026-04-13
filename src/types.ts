export type NaturalezaConcepto =
  | 'Capitulo'
  | 'Partida'
  | 'Material'
  | 'ManoObra'
  | 'Maquinaria'
  | 'Subcontrato'
  | 'Otros';

// Override system: tracks which fields were manually changed
export type OverridableField = 'precioInterno' | 'precioCliente' | 'cantidad' | 'descripcion' | 'unidad';
export type FieldOverrides = Partial<Record<OverridableField, number | string>>;

export interface ConceptoPresupuesto {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: NaturalezaConcepto;
  unidad: string;
  cantidad: number;
  precioRef: number;
  precioInterno: number;
  precioCliente: number;
  parentId: string | null;
  childrenIds: string[];
  nivel: number;
  orden: number;
  codigoBC3?: string;

  // Block/Level assignment — root chapters belong to a bloque+nivel
  bloqueId?: string;
  nivelId?: string;

  // True if this Capitulo represents a real construction block linked to the
  // factibilidad module (e.g. BLOQUE A, BLOQUE B). False/undefined means it's
  // a custom organizational folder created by the user (e.g. AREAS COMUNES).
  esBloque?: boolean;

  // Override tracking — stores ORIGINAL values. Current value on concept IS the override.
  overrides?: FieldOverrides;

  // Component system (legacy — a deprecar cuando el nuevo sistema esté verificado)
  componentSourceId?: string;   // This concept is an instance of that source
  isComponentSource?: boolean;  // This concept is a reusable template

  // Nuevo sistema de componentes (tag-based)
  componenteId?: string;        // A qué componente pertenezco
  componenteSlotId?: string;    // Qué papel cumplo dentro del componente (para sincronizar ediciones)
}

export interface ComponenteInfo {
  id: string;           // "comp-7a9f"
  nombre: string;       // "Apartamento Tipo Bloque B"
  color: string;        // hex, asignado automáticamente de la paleta
  createdAt: string;    // ISO timestamp
}

export interface BC3Item {
  codigo: string;
  descripcion: string;
  unidad: string;
  precio: number;
  isCustom?: boolean; // Created by the company user, not from superadmin catalog
}

export interface BC3SubSubCategoria {
  codigo: string;
  nombre: string;
  items: BC3Item[];
}

export interface BC3SubCategoria {
  codigo: string;
  nombre: string;
  children: BC3SubSubCategoria[];
}

export interface BC3Categoria {
  codigo: string;
  nombre: string;
  children: BC3SubCategoria[];
}

export interface BC3Data {
  categories: BC3Categoria[];
}

export interface BC3DragPayload {
  item: BC3Item;
  categoryCode: string;     // A#
  categoryName: string;
  subCategoryCode: string;  // A04#
  subCategoryName: string;
  subSubCategoryCode: string; // A0402#
  subSubCategoryName: string;
}

export interface ComponentSource {
  sourceId: string;
  instanceIds: Set<string>;
}

export interface PendingPropagation {
  sourceId: string;
  changedFields: OverridableField[];
}

// Project structure: Blocks and Levels
export interface Bloque {
  id: string;
  nombre: string;       // "Torre A", "Bloque B"
  codigo: string;       // "A", "B"
  niveles: Nivel[];
}

export interface Nivel {
  id: string;
  bloqueId: string;
  numero: number;       // -1 (sótano), 0 (PB), 1, 2, ... 20
  nombre: string;       // "Sótano 1", "Nivel 1", "Nivel 2", "Azotea"
}
