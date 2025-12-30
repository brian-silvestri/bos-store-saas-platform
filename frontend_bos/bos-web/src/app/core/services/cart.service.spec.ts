import { TestBed } from '@angular/core/testing'
import { CartService } from './cart.service'
import { PromotionsService } from './promotions.service'
import { CatalogService } from './catalog.service'
import { Product } from '../models/product.model'
import { Promotion } from '../models/promotion.model'

describe('CartService', () => {
  let cart: CartService
  let promos: PromotionsService

  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({})
    cart = TestBed.inject(CartService)
    promos = TestBed.inject(PromotionsService)
    TestBed.inject(CatalogService)
  })

  it('applies discount promotions in totals', () => {
    const product: Product = {
      id: 'discounted',
      name: 'Discounted',
      price: 100,
      category: 'Cat',
      isPromotion: false,
    }

    promos.addPromotion({
      name: '10% OFF',
      type: 'discount',
      productIds: ['discounted'],
      active: true,
      percentage: 10,
    })

    cart.add(product, 1)
    expect(cart.totalAmount()).toBe(90)
  })

  it('adds promo items with fixed price', () => {
    const promo: Promotion = {
      id: 'combo-1',
      name: 'Combo',
      type: 'bundle',
      productIds: [],
      active: true,
      price: 55,
    }

    cart.addPromo(promo, 1)
    expect(cart.totalAmount()).toBe(55)
  })
})
