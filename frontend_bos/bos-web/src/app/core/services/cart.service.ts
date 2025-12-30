import { Injectable, computed, signal, inject } from '@angular/core'
import { CartItem } from '../models/cart-item.model'
import { Product } from '../models/product.model'
import { Promotion } from '../models/promotion.model'
import { CatalogService } from './catalog.service'
import { PromotionsService } from './promotions.service'

@Injectable({ providedIn: 'root' })
export class CartService {
  private promotions = inject(PromotionsService)
  private catalog = inject(CatalogService)
  private items = signal<CartItem[]>([])

  cartItems = this.items.asReadonly()

  totalItems = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0))

  totalAmount = computed(() =>
    this.items().reduce((sum, i) => sum + this.getLineTotalForItem(i), 0)
  )

  getUnitPrice(product: Product) {
    return this.promotions.getUnitPrice(product)
  }

  getLineTotal(product: Product, quantity: number) {
    return this.promotions.getLineTotal(product, quantity)
  }

  addPromo(promo: Promotion, quantity = 1) {
    const current = this.items()
    const found = current.find(i => i.type === 'promo' && i.promo.id === promo.id)

    if (found && found.type === 'promo') {
      found.quantity += quantity
      this.items.set([...current])
    } else {
      this.items.set([...current, { type: 'promo', promo, quantity }])
    }
  }

  add(product: Product, quantity = 1) {
    const current = this.items()
    const found = current.find(i => i.type === 'product' && i.product.id === product.id)

    if (found && found.type === 'product') {
      found.quantity += quantity
      this.items.set([...current])
    } else {
      this.items.set([...current, { type: 'product', product, quantity }])
    }
  }

  updateQty(itemType: CartItem['type'], id: string, delta: number) {
    const current = this.items()
    const item = current.find(i =>
      itemType === 'product'
        ? i.type === 'product' && i.product.id === id
        : i.type === 'promo' && i.promo.id === id
    )
    if (!item) return

    item.quantity += delta
    if (item.quantity <= 0) {
      this.items.set(
        current.filter(i =>
          itemType === 'product'
            ? !(i.type === 'product' && i.product.id === id)
            : !(i.type === 'promo' && i.promo.id === id)
        )
      )
    } else {
      this.items.set([...current])
    }
  }

  getLineTotalForItem(item: CartItem) {
    if (item.type === 'product') {
      return this.promotions.getLineTotal(item.product, item.quantity)
    }
    const price = this.promotions.getPromoPrice(item.promo, this.catalog.getProducts()())
    return price * item.quantity
  }

  getUnitPriceForItem(item: CartItem) {
    if (item.type === 'product') {
      return this.getUnitPrice(item.product)
    }
    return this.promotions.getPromoPrice(item.promo, this.catalog.getProducts()())
  }
}
