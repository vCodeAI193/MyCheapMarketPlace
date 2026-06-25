import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cart'
import { Product } from '@/types'

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Test Produkt',
  slug: 'test-produkt',
  description: 'Beschreibung',
  price: 19.99,
  stock: 10,
  images: [],
  categoryId: 'cat-1',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
}

const mockProduct2: Product = {
  ...mockProduct,
  id: 'prod-2',
  name: 'Zweites Produkt',
  slug: 'zweites-produkt',
  price: 9.50,
}

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
})

describe('CartStore — addItem', () => {
  it('fügt ein neues Produkt hinzu', () => {
    useCartStore.getState().addItem(mockProduct)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe('prod-1')
    expect(items[0].quantity).toBe(1)
  })

  it('erhöht Menge bei bereits vorhandenem Produkt (kein Duplikat)', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().addItem(mockProduct, 3)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(4)
  })

  it('fügt mehrere verschiedene Produkte hinzu', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().addItem(mockProduct2)
    expect(useCartStore.getState().items).toHaveLength(2)
  })
})

describe('CartStore — removeItem', () => {
  it('entfernt ein Produkt aus dem Warenkorb', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().removeItem('prod-1')
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('entfernt nur das angegebene Produkt', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().addItem(mockProduct2)
    useCartStore.getState().removeItem('prod-1')
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe('prod-2')
  })
})

describe('CartStore — updateQuantity', () => {
  it('aktualisiert die Menge eines Produkts', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().updateQuantity('prod-1', 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('entfernt Produkt wenn Menge auf 0 gesetzt wird', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().updateQuantity('prod-1', 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('entfernt Produkt bei negativer Menge', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().updateQuantity('prod-1', -1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('CartStore — total()', () => {
  it('berechnet die korrekte Gesamtsumme', () => {
    useCartStore.getState().addItem(mockProduct, 2)  // 2 × 19.99 = 39.98
    useCartStore.getState().addItem(mockProduct2, 1) // 1 × 9.50  = 9.50
    expect(useCartStore.getState().total()).toBeCloseTo(49.48)
  })

  it('gibt 0 zurück bei leerem Warenkorb', () => {
    expect(useCartStore.getState().total()).toBe(0)
  })
})

describe('CartStore — itemCount()', () => {
  it('zählt die Gesamtanzahl der Artikel', () => {
    useCartStore.getState().addItem(mockProduct, 3)
    useCartStore.getState().addItem(mockProduct2, 2)
    expect(useCartStore.getState().itemCount()).toBe(5)
  })

  it('gibt 0 zurück bei leerem Warenkorb', () => {
    expect(useCartStore.getState().itemCount()).toBe(0)
  })
})

describe('CartStore — clearCart()', () => {
  it('leert den Warenkorb vollständig', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().addItem(mockProduct2)
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
