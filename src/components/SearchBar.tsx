import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  resultCount: number | null;
}

export const SearchBar = forwardRef<HTMLInputElement, Props>(function SearchBar(
  { value, onChange, resultCount },
  ref
) {
  const hasQuery = value.length > 0;

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <div className="relative flex-1 flex items-center">
        <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" strokeWidth={2.25} />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.preventDefault();
              onChange('');
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          placeholder="Buscar por código o descripción…  (⌘K)"
          className="w-full pl-7 pr-8 py-1.5 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        {hasQuery && (
          <button
            onClick={() => onChange('')}
            className="absolute right-1.5 p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            title="Limpiar"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {hasQuery && resultCount !== null && (
        <div
          className={`text-[10px] font-mono-num font-semibold px-2 py-1 rounded whitespace-nowrap ${
            resultCount === 0
              ? 'bg-red-50 text-red-600'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
        </div>
      )}
    </div>
  );
});
