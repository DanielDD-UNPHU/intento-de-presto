import type { ConceptoPresupuesto } from '../types';
import { ChevronRight, Layers } from 'lucide-react';

interface Props {
  breadcrumb: string[];
  conceptos: Record<string, ConceptoPresupuesto>;
  onNavigate: (id: string | null) => void;
}

export function BreadcrumbNav({ breadcrumb, conceptos, onNavigate }: Props) {
  return (
    <nav className="flex items-center gap-0.5 text-xs">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-150"
      >
        <Layers size={12} strokeWidth={2.5} />
        <span className="font-semibold tracking-tight">Raiz</span>
      </button>

      {breadcrumb.map((id, i) => {
        const c = conceptos[id];
        if (!c) return null;
        const isLast = i === breadcrumb.length - 1;
        return (
          <div key={id} className="flex items-center gap-0.5">
            <ChevronRight size={11} className="text-slate-300" strokeWidth={2.5} />
            <button
              onClick={() => onNavigate(id)}
              className={`px-2 py-1 rounded-md font-semibold tracking-tight truncate max-w-[180px] transition-all duration-150 ${
                isLast
                  ? 'text-blue-700 bg-blue-50/60'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/80'
              }`}
            >
              {c.descripcion}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
