import { useEffect, useRef, useState } from 'react';
import { GripHorizontal, TrendingUp } from 'lucide-react';
import { formatMoney } from '../utils/formatters';

interface Props {
  height: number;
  onHeightChange: (h: number) => void;
  minHeight?: number;
  maxHeight?: number;
  grandTotalInterno: number;
  grandTotalCliente: number;
}

export function TotalGeneralPanel({
  height,
  onHeightChange,
  minHeight = 56,
  maxHeight = 400,
  grandTotalInterno,
  grandTotalCliente,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const delta = startYRef.current - e.clientY;
      const next = Math.max(minHeight, Math.min(maxHeight, startHeightRef.current + delta));
      onHeightChange(next);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragging, minHeight, maxHeight, onHeightChange]);

  const margen = grandTotalCliente > 0
    ? ((grandTotalCliente - grandTotalInterno) / grandTotalCliente) * 100
    : 0;

  return (
    <div
      className="flex flex-col bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] shrink-0"
      style={{ height }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={(e) => {
          startYRef.current = e.clientY;
          startHeightRef.current = height;
          setDragging(true);
        }}
        onDoubleClick={() => onHeightChange(minHeight)}
        className={`group h-2 cursor-row-resize flex items-center justify-center border-b border-slate-100 transition-colors ${
          dragging ? 'bg-blue-100' : 'hover:bg-slate-100'
        }`}
        title="Arrastra para redimensionar — doble click para colapsar"
      >
        <GripHorizontal
          size={14}
          className={`transition-colors ${dragging ? 'text-blue-500' : 'text-slate-300 group-hover:text-slate-500'}`}
        />
      </div>

      {/* Totals content */}
      <div className="flex items-center justify-between px-5 py-2 gap-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total general</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/50">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <div>
              <div className="text-[8px] uppercase tracking-wider text-amber-500/70 font-bold leading-none">Interno</div>
              <div className="text-[13px] font-mono-num font-bold text-amber-700 leading-tight">
                {formatMoney(grandTotalInterno)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/80 border border-blue-200/50">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <div>
              <div className="text-[8px] uppercase tracking-wider text-blue-500/70 font-bold leading-none">Cliente</div>
              <div className="text-[13px] font-mono-num font-bold text-blue-800 leading-tight">
                {formatMoney(grandTotalCliente)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200/50">
            <TrendingUp size={11} className="text-emerald-500" />
            <div>
              <div className="text-[8px] uppercase tracking-wider text-emerald-500/70 font-bold leading-none">Margen</div>
              <div className="text-[13px] font-mono-num font-bold text-emerald-700 leading-tight">
                {margen.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
