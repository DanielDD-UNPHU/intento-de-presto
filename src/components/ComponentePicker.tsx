import { useMemo } from 'react';
import type { ComponenteInfo, ConceptoPresupuesto } from '../types';
import { X, FolderTree, Layers } from 'lucide-react';

export interface PickerDestination {
  id: string;
  label: string;
  depth: number;
}

interface CopyToProps {
  mode: 'copy-to';
  open: boolean;
  componenteInfo: ComponenteInfo;
  destinations: PickerDestination[];
  onPick: (destId: string) => void;
  onClose: () => void;
}

interface AddToProps {
  mode: 'add-to';
  open: boolean;
  componentes: Record<string, ComponenteInfo>;
  onPick: (componenteId: string) => void;
  onClose: () => void;
}

type Props = CopyToProps | AddToProps;

export function ComponentePicker(props: Props) {
  if (!props.open) return null;

  const title = props.mode === 'copy-to'
    ? `Copiar "${props.componenteInfo.nombre}" a...`
    : 'Agregar al componente...';
  const icon = props.mode === 'copy-to' ? FolderTree : Layers;
  const Icon = icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={props.onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[480px] max-w-[92vw] max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Icon size={16} className="text-sky-600" />
            </div>
            <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400"
          >
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 py-1">
          {props.mode === 'copy-to' ? (
            props.destinations.length === 0 ? (
              <div className="px-5 py-8 text-center text-[12px] text-slate-400">
                No hay destinos disponibles
              </div>
            ) : (
              props.destinations.map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => { props.onPick(dest.id); props.onClose(); }}
                  className="w-full flex items-center gap-2 px-5 py-2 text-left text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
                  style={{ paddingLeft: 20 + dest.depth * 14 }}
                >
                  <FolderTree size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{dest.label}</span>
                </button>
              ))
            )
          ) : (
            Object.values(props.componentes).length === 0 ? (
              <div className="px-5 py-8 text-center text-[12px] text-slate-400">
                No hay componentes todavía. Creá uno desde una selección múltiple.
              </div>
            ) : (
              Object.values(props.componentes).map((info) => (
                <button
                  key={info.id}
                  type="button"
                  onClick={() => { props.onPick(info.id); props.onClose(); }}
                  className="w-full flex items-center gap-2.5 px-5 py-2 text-left text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: info.color }}
                  />
                  <span className="truncate">{info.nombre}</span>
                </button>
              ))
            )
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={props.onClose}
            className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper: construye lista de destinos (Capitulos tipo Bloque/Nivel o Folders)
 * válidos para copiar un componente. Excluye los anchors donde ya existe el componente.
 */
export function buildCopyDestinations(
  conceptos: Record<string, ConceptoPresupuesto>,
  rootIds: string[],
  excludeAnchors: Set<string>,
): PickerDestination[] {
  const destinations: PickerDestination[] = [];

  function walk(ids: string[], depth: number) {
    for (const id of ids) {
      const c = conceptos[id];
      if (!c || c.tipo !== 'Capitulo') continue;
      // Solo mostrar capitulos "organizacionales" (no BC3 auto-generados)
      const isBC3 = c.codigo.endsWith('#');
      if (!isBC3 && !excludeAnchors.has(id)) {
        destinations.push({ id, label: c.descripcion || '(sin nombre)', depth });
      }
      if (c.childrenIds.length > 0 && !isBC3) {
        walk(c.childrenIds, depth + 1);
      }
    }
  }
  walk(rootIds, 0);
  return destinations;
}

// Re-export for convenience
export { useMemo };
