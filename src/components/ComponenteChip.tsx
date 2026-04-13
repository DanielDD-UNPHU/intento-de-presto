import type { ComponenteInfo } from '../types';

interface Props {
  info: ComponenteInfo;
  onClick?: (e: React.MouseEvent) => void;
  flashing?: boolean;
}

export function ComponenteChip({ info, onClick, flashing }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={info.nombre}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold max-w-full transition-all ${
        flashing ? 'ring-2 ring-cyan-400 ring-offset-1' : ''
      }`}
      style={{
        backgroundColor: `${info.color}22`,
        color: info.color,
        border: `1px solid ${info.color}66`,
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: info.color }}
      />
      <span className="truncate">{info.nombre}</span>
    </button>
  );
}
