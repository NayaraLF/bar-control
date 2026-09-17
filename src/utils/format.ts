export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[R$\s.]/g, '').replace(',', '.')
  const value = parseFloat(cleaned)
  return isNaN(value) ? 0 : Math.round(value * 100) / 100
}

export const unitLabels: Record<string, string> = {
  un: 'un',
  ml: 'ml',
  g: 'g',
}

export const unitLabelsFull: Record<string, string> = {
  un: 'unidade(s)',
  ml: 'mililitros',
  g: 'gramas',
}

export function formatStock(value: number, unit: string): string {
  if (unit === 'un') return `${value} un`
  return `${value.toLocaleString('pt-BR')} ${unit}`
}
