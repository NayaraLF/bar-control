import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrencyInput, formatStock } from './format'

describe('formatCurrency', () => {
  it('formata valor inteiro', () => {
    expect(formatCurrency(10)).toBe('R$ 10,00')
  })

  it('formata valor com centavos', () => {
    expect(formatCurrency(25.5)).toBe('R$ 25,50')
  })

  it('formata valor zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })

  it('formata valor com separador de milhar', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
  })
})

describe('parseCurrencyInput', () => {
  it('converte input com vírgula', () => {
    expect(parseCurrencyInput('25,50')).toBe(25.5)
  })

  it('converte input com R$', () => {
    expect(parseCurrencyInput('R$ 10,00')).toBe(10)
  })

  it('retorna 0 para input vazio', () => {
    expect(parseCurrencyInput('')).toBe(0)
  })

  it('retorna 0 para input inválido', () => {
    expect(parseCurrencyInput('abc')).toBe(0)
  })

  it('converte input com ponto de milhar e vírgula decimal', () => {
    expect(parseCurrencyInput('1.234,56')).toBe(1234.56)
  })

  it('arredonda para 2 casas decimais', () => {
    expect(parseCurrencyInput('10,999')).toBe(11)
  })
})

describe('formatStock', () => {
  it('formata unidade', () => {
    expect(formatStock(5, 'un')).toBe('5 un')
  })

  it('formata mililitros', () => {
    expect(formatStock(1000, 'ml')).toBe('1.000 ml')
  })

  it('formata gramas', () => {
    expect(formatStock(500, 'g')).toBe('500 g')
  })
})
