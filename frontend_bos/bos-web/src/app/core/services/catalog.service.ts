import { Injectable, signal } from '@angular/core'
import { Product } from '../models/product.model'

const DEFAULT_CATEGORY = 'Uncategorized'

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private products = signal<Product[]>([])
  private categories = signal<string[]>([])
  private storageKeyProducts = 'bos.catalog.products'
  private storageKeyCategories = 'bos.catalog.categories'

  constructor() {
    this.load()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorage)
    }
  }

  getProducts() {
    return this.products.asReadonly()
  }

  getCategories() {
    return this.categories.asReadonly()
  }

  addProduct(data: Omit<Product, 'id'> & { id?: string }) {
    const category = this.normalizeCategory(data.category) || DEFAULT_CATEGORY
    this.ensureCategory(category)
    const product: Product = {
      ...data,
      id: data.id ?? this.generateId(),
      category,
    }
    this.products.set([product, ...this.products()])
    this.save()
  }

  updateProduct(product: Product) {
    const category = this.normalizeCategory(product.category) || DEFAULT_CATEGORY
    this.ensureCategory(category)
    const current = this.products()
    const index = current.findIndex(p => p.id === product.id)
    if (index === -1) return
    const next = [...current]
    next[index] = { ...product, category }
    this.products.set(next)
    this.save()
  }

  deleteProduct(id: string) {
    this.products.set(this.products().filter(p => p.id !== id))
    this.save()
  }

  addCategory(name: string) {
    const normalized = this.normalizeCategory(name)
    if (!normalized) return
    if (this.categories().includes(normalized)) return
    this.categories.set([...this.categories(), normalized])
    this.save()
  }

  updateCategory(oldName: string, newName: string) {
    const normalized = this.normalizeCategory(newName)
    if (!normalized) return
    const current = this.categories()
    if (!current.includes(oldName)) return
    if (current.includes(normalized)) return
    const nextCategories = current.map(c => (c === oldName ? normalized : c))
    this.categories.set(nextCategories)
    this.products.set(
      this.products().map(p => (p.category === oldName ? { ...p, category: normalized } : p))
    )
    this.save()
  }

  deleteCategory(name: string) {
    const current = this.categories().filter(c => c !== name)
    const products = this.products().map(p =>
      p.category === name ? { ...p, category: DEFAULT_CATEGORY } : p
    )
    this.categories.set(this.ensureDefaultCategory(current, products))
    this.products.set(products)
    this.save()
  }

  private buildCategories(products: Product[]) {
    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
    return this.ensureDefaultCategory(categories, products)
  }

  private ensureCategory(name: string) {
    if (!this.categories().includes(name)) {
      this.categories.set([...this.categories(), name])
    }
  }

  private ensureDefaultCategory(categories: string[], products: Product[]) {
    const needsDefault = products.some(p => p.category === DEFAULT_CATEGORY)
    if (!needsDefault) return categories
    if (categories.includes(DEFAULT_CATEGORY)) return categories
    return [...categories, DEFAULT_CATEGORY]
  }

  private normalizeCategory(value: string) {
    return value?.trim()
  }

  private generateId() {
    return `P${Date.now()}${Math.floor(Math.random() * 1000)}`
  }

  private save() {
    try {
      localStorage.setItem(this.storageKeyProducts, JSON.stringify(this.products()))
      localStorage.setItem(this.storageKeyCategories, JSON.stringify(this.categories()))
    } catch {
      // Ignore storage failures (private mode, disabled storage).
    }
  }

  private load() {
    try {
      const rawProducts = localStorage.getItem(this.storageKeyProducts)
      const rawCategories = localStorage.getItem(this.storageKeyCategories)
      let products = this.products()
      if (rawProducts) {
        products = JSON.parse(rawProducts) as Product[]
        this.products.set(products)
      }
      if (rawCategories) {
        const parsed = JSON.parse(rawCategories) as string[]
        this.categories.set(parsed)
      } else if (rawProducts) {
        this.categories.set(this.buildCategories(products))
      }
    } catch {
      // Ignore invalid or unavailable stored data.
    }
  }

  private handleStorage = (event: StorageEvent) => {
    if (event.key !== this.storageKeyProducts && event.key !== this.storageKeyCategories) return
    this.load()
  }
}
