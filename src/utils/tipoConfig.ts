import type { NaturalezaConcepto } from '../types';

interface TipoConfig {
  label: string;
  short: string;
  color: string;
  colorLight: string;
}

export const TIPO_CONFIG: Record<NaturalezaConcepto, TipoConfig> = {
  Capitulo:    { label: 'Capitulo',    short: 'CAP', color: '#2563eb', colorLight: '#dbeafe' },
  Partida:     { label: 'Partida',     short: 'PAR', color: '#059669', colorLight: '#d1fae5' },
  Material:    { label: 'Material',    short: 'MAT', color: '#d97706', colorLight: '#fef3c7' },
  ManoObra:    { label: 'Mano Obra',   short: 'M.O', color: '#7c3aed', colorLight: '#ede9fe' },
  Maquinaria:  { label: 'Maquinaria',  short: 'MAQ', color: '#dc2626', colorLight: '#fee2e2' },
  Subcontrato: { label: 'Subcontrato', short: 'SUB', color: '#0891b2', colorLight: '#cffafe' },
  Otros:       { label: 'Otros',       short: 'OTR', color: '#64748b', colorLight: '#f1f5f9' },
};

export const TIPO_LIST: NaturalezaConcepto[] = [
  'Capitulo', 'Partida', 'Material', 'ManoObra', 'Maquinaria', 'Subcontrato', 'Otros'
];
