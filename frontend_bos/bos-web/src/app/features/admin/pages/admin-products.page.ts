import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpClient } from '@angular/common/http'
import { CatalogService } from '../../../core/services/catalog.service'
import { Product } from '../../../core/models/product.model'
import { ConfirmService } from '../../../core/services/confirm.service'
import { StoreConfigService } from '../../../core/services/store-config.service'
import { PromotionsService } from '../../../core/services/promotions.service'
import { environment } from '../../../../environments/environment'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.page.html',
})
export class AdminProductsPage {
  private catalog = inject(CatalogService)
  private confirm = inject(ConfirmService)
  private storeConfig = inject(StoreConfigService)
  private promotions = inject(PromotionsService)
  private http = inject(HttpClient)

  products = this.catalog.getProducts()
  categories = this.catalog.getCategories()
  search = ''
  formOpen = false
  editingId: string | null = null
  uploadingImage = signal(false)
  form = {
    name: '',
    price: null as number | null,
    category: '',
    isPromotion: false,
    imageUrl: '',
    description: '',
  }

  get storeCurrency() {
    return `${this.storeConfig.currencySymbol} `
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
      price: null,
      category: '',
      isPromotion: false,
      imageUrl: '',
      description: '',
    }
  }

  filteredProducts() {
    const term = this.search.toLowerCase().trim()
    return this.products().filter(p =>
      !term ? true : p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
    )
  }

  editProduct(product: Product) {
    this.formOpen = true
    this.editingId = product.id
    this.form = {
      name: product.name,
      price: product.price ?? null,
      category: product.category,
      isPromotion: product.isPromotion,
      imageUrl: product.imageUrl ?? '',
      description: product.description ?? '',
    }
  }

  async deleteProduct(product: Product) {
    const promos = this.promotions.getProductPromotions(product.id)
    if (promos.length) {
      await this.confirm.confirm(
        `This product is in ${promos.length} promotion(s). Remove it from the promotion before deleting.`
      )
      return
    }
    const ok = await this.confirm.confirm(`Delete "${product.name}"?`)
    if (!ok) return
    this.catalog.deleteProduct(product.id)
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const formData = new FormData()
    formData.append('file', file)

    this.uploadingImage.set(true)

    this.http.post<{ url: string }>(`${environment.apiUrl}/uploads/image`, formData)
      .subscribe({
        next: (response) => {
          this.form.imageUrl = response.url
          this.uploadingImage.set(false)
        },
        error: (err) => {
          console.error('Error uploading image:', err)
          alert('Error uploading image. Please try again.')
          this.uploadingImage.set(false)
        }
      })
  }

  getImageUrl(url: string): string {
    if (!url) return ''
    // If it's a relative URL from our backend, prepend the API URL
    if (url.startsWith('/uploads/')) {
      return `${environment.apiUrl}${url}`
    }
    // Otherwise it's an external URL
    return url
  }

  saveProduct() {
    const name = this.form.name.trim()
    if (!name) return
    const category = this.form.category.trim()
    const imageUrl = this.form.imageUrl.trim() || undefined
    const description = this.form.description.trim() || undefined
    const price =
      this.form.price === null || Number.isNaN(this.form.price) ? undefined : Number(this.form.price)

    if (this.editingId) {
      this.catalog.updateProduct({
        id: this.editingId,
        name,
        price,
        category,
        isPromotion: this.form.isPromotion,
        imageUrl,
        description,
      })
    } else {
      this.catalog.addProduct({
        name,
        price,
        category,
        isPromotion: this.form.isPromotion,
        imageUrl,
        description,
      })
    }

    this.formOpen = false
    this.resetForm()
  }
}
