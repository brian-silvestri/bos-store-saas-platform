import { CommonModule } from '@angular/common'
import { Component, Input, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { Promotion } from '../../../core/models/promotion.model'
import { PromotionsService } from '../../../core/services/promotions.service'
import { CatalogService } from '../../../core/services/catalog.service'
import { CartService } from '../../../core/services/cart.service'
import { StoreConfigService } from '../../../core/services/store-config.service'

@Component({
  selector: 'app-promo-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promo-card.component.html',
})
export class PromoCardComponent {
  @Input() promo!: Promotion
  private promotions = inject(PromotionsService)
  private catalog = inject(CatalogService)

  constructor(public cart: CartService, public store: StoreConfigService) {}

  promoPrice() {
    return this.promotions.getPromoPrice(this.promo, this.catalog.getProducts()())
  }

  typeLabel() {
    if (this.promo.type === 'discount') {
      return this.promo.percentage ? `-${this.promo.percentage}%` : 'Descuento'
    }
    if (this.promo.type === 'nxm') {
      return this.promo.buyQty && this.promo.payQty ? `${this.promo.buyQty}x${this.promo.payQty}` : 'NxM'
    }
    return 'Kit'
  }
}
