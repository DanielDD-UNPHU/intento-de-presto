import type { NaturalezaConcepto } from '../types';
import { TIPO_CONFIG } from '../utils/tipoConfig';

interface Props {
  tipo: NaturalezaConcepto;
  size?: 'sm' | 'md';
}

export function TipoBadge({ tipo, size = 'sm' }: Props) {
  const config = TIPO_CONFIG[tipo];
  const isSm = size === 'sm';

  return (
    <span
      className="inline-flex items-center justify-center shrink-0 font-mono-num select-none"
      style={{
        backgroundColor: config.colorLight,
        color: config.color,
        border: `1.5px solid ${config.color}20`,
        borderRadius: isSm ? 4 : 5,
        width: isSm ? 30 : 40,
        height: isSm ? 18 : 22,
        fontSize: isSm ? 9 : 10,
        fontWeight: 700,
        letterSpacing: '0.04em',
      }}
      title={config.label}
    >
      {config.short}
    </span>
  );
}
