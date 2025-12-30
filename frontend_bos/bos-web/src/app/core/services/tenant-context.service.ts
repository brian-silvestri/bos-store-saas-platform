import { Injectable, signal } from '@angular/core'
import { StorefrontResponse } from '../models/storefront.model'

@Injectable({
  providedIn: 'root'
})
export class TenantContextService {
  private currentSlug = signal<string | null>(null)
  private storefrontData = signal<StorefrontResponse | null>(null)

  setSlug(slug: string) {
    this.currentSlug.set(slug)
  }

  getSlug(): string | null {
    return this.currentSlug()
  }

  setStorefrontData(data: StorefrontResponse) {
    this.storefrontData.set(data)
    this.currentSlug.set(data.slug)
  }

  getStorefrontData(): StorefrontResponse | null {
    return this.storefrontData()
  }

  clearContext() {
    this.currentSlug.set(null)
    this.storefrontData.set(null)
  }
}
