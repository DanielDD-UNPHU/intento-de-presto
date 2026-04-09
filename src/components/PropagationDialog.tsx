import type { ConceptoPresupuesto, OverridableField, ComponentSource } from '../types';
import { GitBranch, ArrowRightLeft, ShieldOff, X } from 'lucide-react';

interface Props {
  sourceId: string;
  changedFields: OverridableField[];
  conceptos: Record<string, ConceptoPresupuesto>;
  componentSources: Record<string, ComponentSource>;
  onPropagate: (sourceId: string, changedFields: OverridableField[], mode: 'all' | 'non-overridden' | 'skip') => void;
  onClose: () => void;
}

export function PropagationDialog({
  sourceId, changedFields, conceptos, componentSources, onPropagate, onClose,
}: Props) {
  const source = conceptos[sourceId];
  const compSource = componentSources[sourceId];
  const instanceCount = compSource?.instanceIds.size ?? 0;

  if (!source || instanceCount === 0) {
    onClose();
    return null;
  }

  // Count overridden instances
  let overriddenCount = 0;
  if (compSource) {
    for (const instId of compSource.instanceIds) {
      const inst = conceptos[instId];
      if (inst && changedFields.some(f => inst.overrides?.[f] !== undefined)) {
        overriddenCount++;
      }
    }
  }

  const fieldLabels: Record<OverridableField, string> = {
    precioInterno: 'Precio Interno',
    precioCliente: 'Precio Cliente',
    cantidad: 'Cantidad',
    descripcion: 'Descripcion',
    unidad: 'Unidad',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[440px] overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <GitBranch size={18} className="text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Propagar cambios</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Componente: <span className="font-semibold text-slate-700">{source.descripcion}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 text-[11px]">
            <div className="px-2 py-1 rounded-md bg-violet-50 text-violet-700 font-semibold">
              {instanceCount} instancia{instanceCount > 1 ? 's' : ''}
            </div>
            {overriddenCount > 0 && (
              <div className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold">
                {overriddenCount} con override
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {changedFields.map(f => (
              <span key={f} className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-medium">
                {fieldLabels[f]}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-2">
          <button
            onClick={() => onPropagate(sourceId, changedFields, 'all')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors text-left"
          >
            <ArrowRightLeft size={16} className="shrink-0" />
            <div>
              <div className="text-[12px] font-semibold">Aplicar a todas</div>
              <div className="text-[10px] text-violet-200 mt-0.5">Sobreescribe incluyendo las que tienen override</div>
            </div>
          </button>

          {overriddenCount > 0 && (
            <button
              onClick={() => onPropagate(sourceId, changedFields, 'non-overridden')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-left"
            >
              <ShieldOff size={16} className="shrink-0 text-amber-500" />
              <div>
                <div className="text-[12px] font-semibold">Solo sin override</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Preserva los {overriddenCount} campo{overriddenCount > 1 ? 's' : ''} con override manual</div>
              </div>
            </button>
          )}

          <button
            onClick={() => onPropagate(sourceId, changedFields, 'skip')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors text-left"
          >
            <X size={16} className="shrink-0" />
            <div>
              <div className="text-[12px] font-medium">No propagar</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Solo cambia el componente fuente</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
