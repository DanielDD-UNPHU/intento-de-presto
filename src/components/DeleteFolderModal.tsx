import { X, Trash2, FolderOpen, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  folderName: string;
  childCount: number;
  onDeleteAll: () => void;
  onKeepChildren: () => void;
  onClose: () => void;
}

export function DeleteFolderModal({
  open, folderName, childCount, onDeleteAll, onKeepChildren, onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[440px] max-w-[92vw] overflow-hidden">
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-slate-900">Esta carpeta tiene contenido</h2>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                <span className="font-semibold text-slate-700">{folderName}</span> contiene{' '}
                <span className="font-semibold">{childCount}</span>{' '}
                {childCount === 1 ? 'elemento' : 'elementos'}. ¿Qué hacemos con ellos?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <button
            type="button"
            onClick={onKeepChildren}
            className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
              <FolderOpen size={15} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-slate-800">Mover el contenido al nivel superior</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Se borra solo la carpeta. Los {childCount} {childCount === 1 ? 'elemento sube' : 'elementos suben'} un nivel y se conserva{childCount === 1 ? '' : 'n'}.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onDeleteAll}
            className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-red-50/60 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 group-hover:bg-red-200 transition-colors">
              <Trash2 size={15} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-slate-800">Borrar la carpeta y todo su contenido</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Se eliminan la carpeta y los {childCount} {childCount === 1 ? 'elemento' : 'elementos'}. No se puede deshacer.
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end px-5 py-3 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-[12px] font-medium text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
