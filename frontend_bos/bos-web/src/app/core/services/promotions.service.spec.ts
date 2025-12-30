import { TestBed } from '@angular/core/testing'
import { PromotionsService } from './promotions.service'
import { Product } from '../models/product.model'

describe('PromotionsService', () => {
  let service: PromotionsService

  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({})
    service = TestBed.inject(PromotionsService)
  })

  it('calculates discount and nxm totals and applies the best one', () => {
    const product: Product = {
      id: 'test',
      name: 'Test',
      price: 100,
      category: 'Cat',
      isPromotion: false,
    }

    service.addPromotion({
      name: '20% OFF',
      type: 'discount',
      productIds: ['test'],
      active: true,
      percentage: 20,
    })

    service.addPromotion({
      name: '2x1',
      type: 'nxm',
      productIds: ['test'],
      active: true,
      buyQty: 2,
      payQty: 1,
    })

    expect(service.getLineTotal(product, 2)).toBe(100)
  })

  it('calculates promo price from product sum when price not provided', () => {
    const products: Product[] = [
      { id: 'a', name: 'A', price: 40, category: 'Cat', isPromotion: false },
      { id: 'b', name: 'B', price: 60, category: 'Cat', isPromotion: false },
    ]

    const promo = {
      id: 'promo',
      name: 'Combo',
      type: 'bundle' as const,
      productIds: ['a', 'b'],
      active: true,
    }

    expect(service.getPromoPrice(promo, products)).toBe(100)
  })
})
