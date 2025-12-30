import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { PromoCardComponent } from './promo-card.component'
import { PromotionsService } from '../../../core/services/promotions.service'
import { CatalogService } from '../../../core/services/catalog.service'
import { CartService } from '../../../core/services/cart.service'
import { StoreConfigService } from '../../../core/services/store-config.service'
import { Promotion } from '../../../core/models/promotion.model'

describe('PromoCardComponent', () => {
  let fixture: ComponentFixture<PromoCardComponent>
  let cart: CartService

  beforeEach(async () => {
    localStorage.clear()
    await TestBed.configureTestingModule({
      imports: [PromoCardComponent, RouterTestingModule],
      providers: [PromotionsService, CatalogService, CartService, StoreConfigService],
    }).compileComponents()

    cart = TestBed.inject(CartService)
    fixture = TestBed.createComponent(PromoCardComponent)
  })

  it('adds promo to cart when clicking add', () => {
    const promo: Promotion = {
      id: 'combo-1',
      name: 'Combo',
      type: 'bundle',
      productIds: [],
      active: true,
      price: 50,
    }

    fixture.componentInstance.promo = promo
    spyOn(cart, 'addPromo')
    fixture.detectChanges()

    const button = fixture.nativeElement.querySelector('button')
    button.click()
    expect(cart.addPromo).toHaveBeenCalledWith(promo, 1)
  })
})
