import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { PromotionsService } from '../../../core/services/promotions.service'
import { CatalogService } from '../../../core/services/catalog.service'
import { CartService } from '../../../core/services/cart.service'
import { StoreConfigService } from '../../../core/services/store-config.service'

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promo-detail.page.html',
})
export class PromoDetailPage {
  private route = inject(ActivatedRoute)
  private promotions = inject(PromotionsService)
  private catalog = inject(CatalogService)

  promoId = this.route.snapshot.paramMap.get('id') ?? ''
  private promosSignal = this.promotions.getPromotions()
  private productsSignal = this.catalog.getProducts()
  promo = () => {
    this.promosSignal()
    return this.promotions.getPromotionById(this.promoId)
  }

  constructor(public cart: CartService, public store: StoreConfigService) {}

  promoProducts() {
    const promo = this.promo()
    if (!promo) return []
    return this.productsSignal().filter(p => promo.productIds.includes(p.id))
  }

  typeLabel() {
    const promo = this.promo()
    if (!promo) return ''
    if (promo.type === 'discount') return promo.percentage ? `-${promo.percentage}%` : 'Descuento'
    if (promo.type === 'nxm') return promo.buyQty && promo.payQty ? `${promo.buyQty}x${promo.payQty}` : 'NxM'
    return 'Kit'
  }
}
