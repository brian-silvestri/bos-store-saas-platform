import { Injectable, signal } from '@angular/core'
import { Promotion } from '../models/promotion.model'
import { PROMOTIONS_MOCK } from '../mocks/promotions.mock'
import { Product } from '../models/product.model'

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private promotions = signal<Promotion[]>(PROMOTIONS_MOCK)
  private storageKey = 'bos.catalog.promotions'

  constructor() {
    this.load()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorage)
    }
  }

  getPromotions() {
    return this.promotions.asReadonly()
  }

  getPromotionById(id: string) {
    return this.promotions().find(p => p.id === id) ?? null
  }

  addPromotion(data: Omit<Promotion, 'id'> & { id?: string }) {
    const promotion: Promotion = {
      ...data,
      id: data.id ?? this.generateId(),
    }
    this.promotions.set([promotion, ...this.promotions()])
    this.save()
  }

  updatePromotion(promotion: Promotion) {
    const current = this.promotions()
    const index = current.findIndex(p => p.id === promotion.id)
    if (index === -1) return
    const next = [...current]
    next[index] = { ...promotion }
    this.promotions.set(next)
    this.save()
  }

  deletePromotion(id: string) {
    this.promotions.set(this.promotions().filter(p => p.id !== id))
    this.save()
  }

  getProductPromotions(productId?: string) {
    if (!productId) return []
    return this.promotions().filter(p => p.active && p.productIds.includes(productId))
  }

  getPrimaryPromotion(productId?: string) {
    const promos = this.getProductPromotions(productId)
    return promos.length ? promos[0] : null
  }

  getPromoPrice(promo: Promotion, products: Product[]) {
    if (typeof promo.price === 'number') return promo.price
    const items = products.filter(p => promo.productIds.includes(p.id))
    const sum = items.reduce((total, item) => total + (item.price ?? 0), 0)
    return this.roundPrice(sum)
  }

  hasPromotion(productId?: string) {
    return this.getProductPromotions(productId).length > 0
  }

  getBadges(productId?: string) {
    return this.getProductPromotions(productId).map(p => this.formatBadge(p))
  }

  getBestDiscountPercent(productId?: string) {
    const discounts = this.getProductPromotions(productId)
      .filter(p => p.type === 'discount' && typeof p.percentage === 'number')
      .map(p => p.percentage as number)
    return discounts.length ? Math.max(...discounts) : 0
  }

  getBestNxm(productId?: string) {
    const nxm = this.getProductPromotions(productId).filter(p => p.type === 'nxm')
    return nxm.length ? nxm[0] : null
  }

  getUnitPrice(product: Product) {
    if (product.price === undefined) return undefined
    const discount = this.getBestDiscountPercent(product.id)
    if (!discount) return product.price
    return this.roundPrice(product.price * (1 - discount / 100))
  }

  getLineTotal(product: Product, quantity: number) {
    if (product.price === undefined) return 0
    const baseTotal = product.price * quantity

    const discount = this.getBestDiscountPercent(product.id)
    const discountTotal = discount
      ? this.roundPrice(product.price * (1 - discount / 100) * quantity)
      : baseTotal

    const nxm = this.getBestNxm(product.id)
    const nxmTotal = nxm ? this.getNxmTotal(product.price, quantity, nxm) : baseTotal

    return Math.min(discountTotal, nxmTotal)
  }

  private getNxmTotal(price: number, quantity: number, promo: Promotion) {
    const buyQty = promo.buyQty ?? 0
    const payQty = promo.payQty ?? 0
    if (!buyQty || !payQty || buyQty <= payQty) return price * quantity
    const groups = Math.floor(quantity / buyQty)
    const remainder = quantity % buyQty
    const paid = groups * payQty + remainder
    return price * paid
  }

  private formatBadge(promo: Promotion) {
    if (promo.type === 'discount') {
      return promo.percentage ? `-${promo.percentage}%` : promo.name
    }
    if (promo.type === 'nxm') {
      const buy = promo.buyQty ?? 0
      const pay = promo.payQty ?? 0
      return buy && pay ? `${buy}x${pay}` : promo.name
    }
    return promo.name
  }

  private generateId() {
    return `PR${Date.now()}${Math.floor(Math.random() * 1000)}`
  }

  private roundPrice(value: number) {
    return Math.round(value * 100) / 100
  }

  private save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.promotions()))
    } catch {
      // Ignore storage failures (private mode, disabled storage).
    }
  }

  private load() {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as Promotion[]
      this.promotions.set(parsed)
    } catch {
      // Ignore invalid or unavailable stored data.
    }
  }

  private handleStorage = (event: StorageEvent) => {
    if (event.key !== this.storageKey) return
    this.load()
  }
}
