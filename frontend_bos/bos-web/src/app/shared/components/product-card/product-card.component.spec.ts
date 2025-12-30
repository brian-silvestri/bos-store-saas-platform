import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { ProductCardComponent } from './product-card.component'
import { PromotionsService } from '../../../core/services/promotions.service'
import { CatalogService } from '../../../core/services/catalog.service'
import { CartService } from '../../../core/services/cart.service'
import { StoreConfigService } from '../../../core/services/store-config.service'
import { Product } from '../../../core/models/product.model'

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>
  let promos: PromotionsService

  beforeEach(async () => {
    localStorage.clear()
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent, RouterTestingModule],
      providers: [PromotionsService, CatalogService, CartService, StoreConfigService],
    }).compileComponents()

    promos = TestBed.inject(PromotionsService)
    fixture = TestBed.createComponent(ProductCardComponent)
  })

  it('shows discounted price when promotion is active', () => {
    const product: Product = {
      id: 'p1',
      name: 'Product',
      price: 100,
      category: 'Cat',
      isPromotion: false,
    }

    promos.addPromotion({
      name: '10% OFF',
      type: 'discount',
      productIds: ['p1'],
      active: true,
      percentage: 10,
    })

    fixture.componentInstance.product = product
    fixture.detectChanges()

    const text = fixture.nativeElement.textContent
    expect(text).toContain('90')
    expect(text).toContain('View details')
  })
})
