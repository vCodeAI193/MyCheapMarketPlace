import { describe, it, expect } from 'vitest'
import { ORDER_STATUS, ORDER_STATUSES } from './order-status'

const EXPECTED_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

describe('ORDER_STATUS', () => {
  it('enthält Einträge für alle 5 Bestellstatus', () => {
    for (const status of EXPECTED_STATUSES) {
      expect(ORDER_STATUS[status]).toBeDefined()
    }
  })

  it('jeder Eintrag hat ein label (string)', () => {
    for (const status of EXPECTED_STATUSES) {
      expect(typeof ORDER_STATUS[status].label).toBe('string')
      expect(ORDER_STATUS[status].label.length).toBeGreaterThan(0)
    }
  })

  it('jeder Eintrag hat eine color (string)', () => {
    for (const status of EXPECTED_STATUSES) {
      expect(typeof ORDER_STATUS[status].color).toBe('string')
      expect(ORDER_STATUS[status].color.length).toBeGreaterThan(0)
    }
  })

  it('PENDING hat deutsches Label', () => {
    expect(ORDER_STATUS.PENDING.label).toBe('Ausstehend')
  })

  it('CANCELLED hat rote Farbklasse', () => {
    expect(ORDER_STATUS.CANCELLED.color).toContain('red')
  })

  it('DELIVERED hat grüne Farbklasse', () => {
    expect(ORDER_STATUS.DELIVERED.color).toContain('green')
  })
})

describe('ORDER_STATUSES', () => {
  it('ist ein Array mit genau 5 Elementen', () => {
    expect(ORDER_STATUSES).toHaveLength(5)
  })

  it('enthält alle erwarteten Statuswerte', () => {
    for (const status of EXPECTED_STATUSES) {
      expect(ORDER_STATUSES).toContain(status)
    }
  })
})
