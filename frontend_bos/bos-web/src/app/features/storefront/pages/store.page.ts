import { CommonModule } from '@angular/common'
import { Component, computed, inject, signal, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import { TenantContextService } from '../../../core/services/tenant-context.service'
import { Product } from '../../../core/models/product.model'
import { ToastService } from '../../../core/services/toast.service'
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component'
import { PromoCardComponent } from '../../../shared/components/promo-card/promo-card.component'
import { ToastComponent } from '../../../shared/components/toast/toast.component'
import { ProductInfo, PromotionInfo } from '../../../core/models/storefront.model'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, PromoCardComponent, ToastComponent],
  templateUrl: './store.page.html',
})
export class StorePage implements OnInit {
  private api = inject(ApiService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private tenantContext = inject(TenantContextService)
  private toastService = inject(ToastService)

  slug = signal<string>('')
  loading = signal(true)
  error = signal<string | null>(null)

  allProducts = signal<ProductInfo[]>([])
  allPromotions = signal<PromotionInfo[]>([])
  allCategories = signal<string[]>([])

  products = computed(() => this.allProducts())
  categories = computed(() => ['All', 'Combos', ...this.allCategories()])
  private promotionsSignal = computed(() => this.allPromotions())

  minPrice = computed(() => {
    const prices = this.products().map(p => p.price ?? 0)
    return prices.length ? Math.min(...prices) : 0
  })
  maxPrice = computed(() => {
    const prices = this.products().map(p => p.price ?? 0)
    return prices.length ? Math.max(...prices) : 0
  })

  search = signal('')
  selectedCategory = signal('All')
  minFilter = signal(this.minPrice())
  maxFilter = signal(this.maxPrice())

  baseFilteredProducts = computed(() =>
    this.products().filter(p => {
      const matchesCategory =
        this.selectedCategory() === 'All' ||
        (this.selectedCategory() !== 'Combos' && p.category === this.selectedCategory())
      const matchesSearch = p.name.toLowerCase().includes(this.search().toLowerCase())
      const min = this.minFilter() ?? this.minPrice()
      const max = this.maxFilter() ?? this.maxPrice()
      const withinPrice =
        p.price === undefined || (p.price >= min && p.price <= max)
      return matchesCategory && matchesSearch && withinPrice
    })
  )

  filteredProducts = computed(() => {
    if (this.selectedCategory() === 'Combos') return []
    return this.baseFilteredProducts()
  })

  promoItems = computed(() => {
    const term = this.search().toLowerCase().trim()
    const promos = this.promotionsSignal()
    if (!term) return promos
    return promos.filter(p => p.name.toLowerCase().includes(term))
  })

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug']
      if (!slug) {
        this.error.set('No store slug provided')
        this.loading.set(false)
        return
      }

      this.slug.set(slug)
      this.tenantContext.setSlug(slug)
      this.loadStorefront()
    })
  }

  loadStorefront() {
    this.loading.set(true)
    this.error.set(null)

    this.api.getStorefrontBySlug(this.slug()).subscribe({
      next: (data) => {
        this.tenantContext.setStorefrontData(data)

        // Map products with category names
        const categoryMap = new Map(data.categories.map(c => [c.id, c.name]))
        const productsWithCategories = data.products.map(p => ({
          ...p,
          category: categoryMap.get(p.categoryId) || ''
        }))

        // Map promotions with required fields for compatibility
        const promotionsWithFields = data.promotions.map(p => ({
          ...p,
          type: 'discount' as const,
          productIds: [],
          active: true,
          percentage: p.discountPercentage,
          buyQty: 0,
          payQty: 0
        }))

        this.allProducts.set(productsWithCategories)
        this.allPromotions.set(promotionsWithFields)
        this.allCategories.set(data.categories.map(c => c.name))
        this.loading.set(false)
      },
      error: (err) => {
        console.error('Error loading storefront:', err)
        this.error.set('Store not found or unavailable')
        this.loading.set(false)
      }
    })
  }

  onAdded(event: { product: Product; quantity: number }) {
    const { product, quantity } = event
    const suffix = quantity > 1 ? ` x${quantity}` : ''
    this.toastService.showSuccess(`${product.name}${suffix} added to cart`)
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat)
  }

  resetFilters() {
    this.search.set('')
    this.selectedCategory.set('All')
    this.minFilter.set(this.minPrice())
    this.maxFilter.set(this.maxPrice())
  }

  trackById(_index: number, item: ProductInfo) {
    return item.id
  }
}
