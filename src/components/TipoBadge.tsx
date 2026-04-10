import type { NaturalezaConcepto } from '../types';
import { TIPO_CONFIG } from '../utils/tipoConfig';
import { ROLE_CONFIG, type CapituloRole } from '../utils/capituloRoles';

interface Props {
  tipo: NaturalezaConcepto;
  capituloRole?: CapituloRole | null;
  size?: 'sm' | 'md';
}

export function TipoBadge({ tipo, capituloRole, size = 'sm' }: Props) {
  const baseConfig = TIPO_CONFIG[tipo];
  const useRole = tipo === 'Capitulo' && capituloRole;
  const config = useRole
    ? {
        label: ROLE_CONFIG[capituloRole].label,
        short: ROLE_CONFIG[capituloRole].short,
        color: ROLE_CONFIG[capituloRole].color,
        colorLight: ROLE_CONFIG[capituloRole].colorLight,
      }
    : baseConfig;
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
