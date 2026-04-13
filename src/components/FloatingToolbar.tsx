import type { NaturalezaConcepto } from '../types';
import { TIPO_CONFIG, TIPO_LIST } from '../utils/tipoConfig';
import {
  ArrowUp, ArrowDown, ArrowRight, ArrowLeft, Trash2, ChevronDown, Layers,
  Link2, Copy, FolderPlus, Shapes
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Props {
  selectedCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onDelete: () => void;
  onChangeTipo: (tipo: NaturalezaConcepto) => void;
  onCopyAsComponent: () => void;
  onCopyAsIndependent: () => void;
  onCreateFolder: () => void;
  hasCapituloSelected: boolean;
  onCreateComponente: () => void;
}

export function FloatingToolbar({
  selectedCount, onMoveUp, onMoveDown, onIndent, onOutdent, onDelete, onChangeTipo,
  onCopyAsComponent, onCopyAsIndependent, onCreateFolder, hasCapituloSelected,
  onCreateComponente,
}: Props) {
  const [showTipoMenu, setShowTipoMenu] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const tipoRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tipoRef.current && !tipoRef.current.contains(e.target as Node)) setShowTipoMenu(false);
      if (copyRef.current && !copyRef.current.contains(e.target as Node)) setShowCopyMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedCount === 0) return null;

  const Btn = ({ onClick, children, title, danger }: {
    onClick: () => void; children: React.ReactNode; title: string; danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all duration-150 ${
        danger
          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/15'
          : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed bottom-5 left-1/2 toolbar-animate z-50 flex items-center gap-0.5 px-2 py-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40">
      {/* Count */}
      <div className="flex items-center gap-1.5 px-3 py-1 mr-1">
        <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-blue-400 font-mono-num">{selectedCount}</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">fila{selectedCount > 1 ? 's' : ''}</span>
      </div>

      <div className="w-px h-7 bg-white/10" />

      <Btn onClick={onMoveUp} title="Subir (Alt+Up)"><ArrowUp size={15} /></Btn>
      <Btn onClick={onMoveDown} title="Bajar (Alt+Down)"><ArrowDown size={15} /></Btn>

      <div className="w-px h-7 bg-white/10" />

      <Btn onClick={onOutdent} title="Aumentar nivel (Alt+Left)"><ArrowLeft size={15} /></Btn>
      <Btn onClick={onIndent} title="Disminuir nivel (Alt+Right)"><ArrowRight size={15} /></Btn>

      <div className="w-px h-7 bg-white/10" />

      {/* Create folder — only when a Capitulo is selected */}
      {hasCapituloSelected && (
        <Btn onClick={onCreateFolder} title="Nueva carpeta dentro">
          <FolderPlus size={15} />
        </Btn>
      )}

      {/* Crear componente — solo con multi-selección */}
      {selectedCount > 1 && (
        <button
          onClick={onCreateComponente}
          title="Crear componente de la selección"
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sky-300 hover:text-sky-200 hover:bg-sky-500/15 transition-all duration-150"
        >
          <Shapes size={13} />
          <span className="text-[11px] font-semibold">Crear componente</span>
        </button>
      )}

      <div className="w-px h-7 bg-white/10" />

      {/* Tipo selector */}
      <div className="relative" ref={tipoRef}>
        <button
          onClick={() => { setShowTipoMenu(!showTipoMenu); setShowCopyMenu(false); }}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150"
        >
          <Layers size={13} />
          <span className="text-[11px] font-semibold">Tipo</span>
          <ChevronDown size={11} className={`transition-transform duration-200 ${showTipoMenu ? 'rotate-180' : ''}`} />
        </button>
        {showTipoMenu && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 rounded-xl border border-white/10 py-1.5 min-w-[160px] shadow-2xl shadow-black/50 backdrop-blur-xl">
            {TIPO_LIST.map(tipo => (
              <button
                key={tipo}
                onClick={() => { onChangeTipo(tipo); setShowTipoMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/8 transition-colors"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TIPO_CONFIG[tipo].color }} />
                <span className="text-[11px] text-slate-300 font-medium">{TIPO_CONFIG[tipo].label}</span>
                <span className="ml-auto text-[9px] text-slate-500 font-mono-num">{TIPO_CONFIG[tipo].short}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-7 bg-white/10" />

      {/* Copy menu */}
      <div className="relative" ref={copyRef}>
        <button
          onClick={() => { setShowCopyMenu(!showCopyMenu); setShowTipoMenu(false); }}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150"
        >
          <Copy size={13} />
          <span className="text-[11px] font-semibold">Copiar</span>
          <ChevronDown size={11} className={`transition-transform duration-200 ${showCopyMenu ? 'rotate-180' : ''}`} />
        </button>
        {showCopyMenu && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 rounded-xl border border-white/10 py-1.5 min-w-[220px] shadow-2xl shadow-black/50 backdrop-blur-xl">
            <button
              onClick={() => { onCopyAsComponent(); setShowCopyMenu(false); }}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-white/8 transition-colors"
            >
              <Link2 size={13} className="text-violet-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-200 font-semibold">Como componente</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Copia ligada — cambios se propagan</div>
              </div>
            </button>
            <button
              onClick={() => { onCopyAsIndependent(); setShowCopyMenu(false); }}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-white/8 transition-colors"
            >
              <Copy size={13} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-200 font-semibold">Copia independiente</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Clon libre — sin vinculo</div>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-7 bg-white/10" />

      <Btn onClick={onDelete} title="Eliminar (Supr)" danger>
        <Trash2 size={15} />
      </Btn>
    </div>
  );
}
