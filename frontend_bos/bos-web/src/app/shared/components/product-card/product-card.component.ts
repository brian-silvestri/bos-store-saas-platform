import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { Product } from '../../../core/models/product.model'
import { CartService } from '../../../core/services/cart.service'
import { StoreConfigService } from '../../../core/services/store-config.service'
import { PromotionsService } from '../../../core/services/promotions.service'

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() product!: Product
  @Output() added = new EventEmitter<{ product: Product; quantity: number }>()

  quantity = 1
  private promotions = inject(PromotionsService)
  private promotionsSignal = this.promotions.getPromotions()

  constructor(public cart: CartService, public store: StoreConfigService) {}

  badges = computed(() => {
    this.promotionsSignal()
    return this.promotions.getBadges(this.product?.id)
  })

  discountPercent = computed(() => {
    this.promotionsSignal()
    return this.promotions.getBestDiscountPercent(this.product?.id)
  })

  effectivePrice = computed(() => {
    this.promotionsSignal()
    return this.promotions.getUnitPrice(this.product)
  })

  primaryPromotion() {
    return this.promotions.getPrimaryPromotion(this.product?.id)
  }

  add() {
    this.cart.add(this.product, this.quantity)
    this.added.emit({ product: this.product, quantity: this.quantity })
  }

  changeQty(delta: number) {
    const next = this.quantity + delta
    this.quantity = next < 1 ? 1 : next
  }
}
