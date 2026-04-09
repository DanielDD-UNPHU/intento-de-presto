export function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parsePastedRows(text: string): string[][] {
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.split('\t'));
}
