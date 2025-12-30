import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PromotionsService } from '../../../core/services/promotions.service'
import { CatalogService } from '../../../core/services/catalog.service'
import { ConfirmService } from '../../../core/services/confirm.service'
import { Promotion, PromotionType } from '../../../core/models/promotion.model'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-promotions.page.html',
})
export class AdminPromotionsPage {
  private promotionsService = inject(PromotionsService)
  private catalog = inject(CatalogService)
  private confirm = inject(ConfirmService)

  promotions = this.promotionsService.getPromotions()
  products = this.catalog.getProducts()
  formOpen = false
  editingId: string | null = null
  form = {
    name: '',
    type: 'discount' as PromotionType,
    percentage: 30,
    buyQty: 2,
    payQty: 1,
    productIds: [] as string[],
    active: true,
    description: '',
    imageUrl: '',
    price: null as number | null,
  }

  toggleForm() {
    this.formOpen = !this.formOpen
    if (!this.formOpen) {
      this.resetForm()
    }
  }

  resetForm() {
    this.editingId = null
    this.form = {
      name: '',
      type: 'discount',
      percentage: 30,
      buyQty: 2,
      payQty: 1,
      productIds: [],
      active: true,
      description: '',
      imageUrl: '',
      price: null,
    }
  }

  isSelected(productId: string) {
    return this.form.productIds.includes(productId)
  }

  toggleProduct(productId: string) {
    if (this.isSelected(productId)) {
      this.form.productIds = this.form.productIds.filter(id => id !== productId)
    } else {
      this.form.productIds = [...this.form.productIds, productId]
    }
  }

  savePromotion() {
    const name = this.form.name.trim()
    if (!name || this.form.productIds.length === 0) return

    const data = {
      name,
      type: this.form.type,
      productIds: this.form.productIds,
      active: this.form.active,
      description: this.form.description.trim() || undefined,
      imageUrl: this.form.imageUrl.trim() || undefined,
      price: this.form.price === null ? undefined : Number(this.form.price),
      percentage: this.form.type === 'discount' ? Number(this.form.percentage) : undefined,
      buyQty: this.form.type === 'nxm' ? Number(this.form.buyQty) : undefined,
      payQty: this.form.type === 'nxm' ? Number(this.form.payQty) : undefined,
    }

    if (this.editingId) {
      this.promotionsService.updatePromotion({ id: this.editingId, ...data })
    } else {
      this.promotionsService.addPromotion(data)
    }

    this.formOpen = false
    this.resetForm()
  }

  editPromotion(promo: Promotion) {
    this.formOpen = true
    this.editingId = promo.id
    this.form = {
      name: promo.name,
      type: promo.type,
      percentage: promo.percentage ?? 0,
      buyQty: promo.buyQty ?? 2,
      payQty: promo.payQty ?? 1,
      productIds: [...promo.productIds],
      active: promo.active,
      description: promo.description ?? '',
      imageUrl: promo.imageUrl ?? '',
      price: promo.price ?? null,
    }
  }

  async deletePromotion(promo: Promotion) {
    const ok = await this.confirm.confirm(`Delete promotion "${promo.name}"?`)
    if (!ok) return
    this.promotionsService.deletePromotion(promo.id)
  }

  typeLabel(promo: Promotion) {
    if (promo.type === 'discount') return promo.percentage ? `-${promo.percentage}%` : 'Discount'
    if (promo.type === 'nxm') return promo.buyQty && promo.payQty ? `${promo.buyQty}x${promo.payQty}` : 'NxM'
    return 'Bundle'
  }
}
