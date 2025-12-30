import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit, inject } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { CatalogService } from '../../../core/services/catalog.service'
import { PromotionsService } from '../../../core/services/promotions.service'
import { CartService } from '../../../core/services/cart.service'
import { StoreConfigService } from '../../../core/services/store-config.service'
import { Subscription } from 'rxjs'

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.page.html',
})
export class ProductDetailPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private catalog = inject(CatalogService)
  private promotions = inject(PromotionsService)
  private promotionsSignal = this.promotions.getPromotions()
  private sub?: Subscription

  quantity = 1
  productId = this.route.snapshot.paramMap.get('id') ?? ''
  returnPromoId: string | null = null
  private productsSignal = this.catalog.getProducts()
  product = () => this.productsSignal().find(p => p.id === this.productId) ?? null

  constructor(public cart: CartService, public store: StoreConfigService) {}

  ngOnInit() {
    this.sub = this.route.queryParamMap.subscribe(params => {
      this.returnPromoId = params.get('promo')
    })
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }

  badges() {
    this.promotionsSignal()
    return this.promotions.getBadges(this.product()?.id)
  }

  discountPercent() {
    this.promotionsSignal()
    return this.promotions.getBestDiscountPercent(this.product()?.id)
  }

  effectivePrice() {
    this.promotionsSignal()
    const product = this.product()
    return product ? this.promotions.getUnitPrice(product) : undefined
  }

  promotionsForProduct() {
    this.promotionsSignal()
    return this.promotions.getProductPromotions(this.product()?.id)
  }

  changeQty(delta: number) {
    const next = this.quantity + delta
    this.quantity = next < 1 ? 1 : next
  }

  add() {
    const product = this.product()
    if (!product) return
    this.cart.add(product, this.quantity)
  }
}
