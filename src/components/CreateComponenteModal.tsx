import { useEffect, useRef, useState } from 'react';
import { X, Layers } from 'lucide-react';

interface Props {
  open: boolean;
  selectedCount: number;
  onConfirm: (nombre: string) => void;
  onClose: () => void;
}

export function CreateComponenteModal({ open, selectedCount, onConfirm, onClose }: Props) {
  const [nombre, setNombre] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNombre('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (!nombre.trim()) return;
    onConfirm(nombre.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[92vw] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Layers size={16} className="text-sky-600" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-slate-800">Crear componente</h3>
              <p className="text-[11px] text-slate-500">{selectedCount} {selectedCount === 1 ? 'item seleccionado' : 'items seleccionados'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4">
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Nombre del componente
          </label>
          <input
            ref={inputRef}
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
              if (e.key === 'Escape') onClose();
            }}
            placeholder="ej: Apartamento Tipo B"
            className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          />
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Todos los items seleccionados quedarán linkeados. Editar uno propagará el cambio a los demás.
          </p>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!nombre.trim()}
            className="px-3.5 py-1.5 text-[12px] font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
