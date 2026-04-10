import { useState, useRef, useEffect } from 'react';
import { Minus, Plus, ChevronDown } from 'lucide-react';

const ZOOM_PRESETS = [50, 75, 90, 100, 125, 150, 200];
const MIN_ZOOM = ZOOM_PRESETS[0];
const MAX_ZOOM = ZOOM_PRESETS[ZOOM_PRESETS.length - 1];

interface Props {
  zoom: number;
  onChange: (zoom: number) => void;
}

export function ZoomControl({ zoom, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const stepDown = () => {
    const lower = [...ZOOM_PRESETS].reverse().find(p => p < zoom);
    if (lower !== undefined) onChange(lower);
  };
  const stepUp = () => {
    const higher = ZOOM_PRESETS.find(p => p > zoom);
    if (higher !== undefined) onChange(higher);
  };

  return (
    <div ref={ref} className="relative flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        onClick={stepDown}
        disabled={zoom <= MIN_ZOOM}
        className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-l-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Reducir zoom"
      >
        <Minus size={12} strokeWidth={2.5} />
      </button>

      <div className="w-px h-5 bg-slate-200" />

      <button
        onClick={() => setOpen(o => !o)}
        onDoubleClick={() => onChange(100)}
        className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono-num font-semibold text-slate-700 hover:bg-slate-100 transition-colors min-w-[58px] justify-center"
        title="Doble click para volver a 100%"
      >
        {zoom}%
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className="w-px h-5 bg-slate-200" />

      <button
        onClick={stepUp}
        disabled={zoom >= MAX_ZOOM}
        className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-r-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Aumentar zoom"
      >
        <Plus size={12} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[60]">
          {ZOOM_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => { onChange(p); setOpen(false); }}
              className={`w-full px-3 py-1.5 text-left text-[11px] font-mono-num transition-colors ${
                p === zoom
                  ? 'text-blue-600 font-bold bg-blue-50/60'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
