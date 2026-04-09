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

  // Override tracking — stores ORIGINAL values. Current value on concept IS the override.
  overrides?: FieldOverrides;

  // Component system
  componentSourceId?: string;   // This concept is an instance of that source
  isComponentSource?: boolean;  // This concept is a reusable template
}

export interface BC3Item {
  codigo: string;
  descripcion: string;
  unidad: string;
  precio: number;
  isCustom?: boolean; // Created by the company user, not from superadmin catalog
}

export interface BC3SubCategoria {
  codigo: string;
  nombre: string;
  items: BC3Item[];
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
  categoryCode: string;
  categoryName: string;
  subCategoryCode: string;
  subCategoryName: string;
}

export interface ComponentSource {
  sourceId: string;
  instanceIds: Set<string>;
}

export interface PendingPropagation {
  sourceId: string;
  changedFields: OverridableField[];
}
