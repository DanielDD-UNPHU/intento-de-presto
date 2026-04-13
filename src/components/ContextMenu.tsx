import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  divider?: boolean;
  danger?: boolean;
  disabled?: boolean;
  submenu?: ContextMenuItem[];
}

interface Props {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Clamp position to viewport
  const adjustedX = Math.min(x, window.innerWidth - 240);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 32 - 20);

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[220px] bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-[12px]"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={`d-${i}`} className="h-px bg-slate-100 my-1" />
        ) : (
          <button
            key={i}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.onClick();
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
              item.disabled
                ? 'text-slate-300 cursor-not-allowed'
                : item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {item.icon && <item.icon size={14} strokeWidth={2} className="shrink-0" />}
            <span className="flex-1 truncate">{item.label}</span>
          </button>
        )
      )}
    </div>
  );
}
