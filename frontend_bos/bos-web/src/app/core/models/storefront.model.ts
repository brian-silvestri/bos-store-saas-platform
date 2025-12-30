import { Product } from './product.model'
import { PromotionType } from './promotion.model'

export interface StorefrontResponse {
  tenantId: string
  tenantName: string
  slug: string
  store: StoreInfo
  products: ProductInfo[]
  categories: CategoryInfo[]
  promotions: PromotionInfo[]
}

export interface StoreInfo {
  name: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  themeKey: string
  currency: string
  address: string
  whatsappNumber: string
  socialMedia: SocialMediaLink[]
}

export interface SocialMediaLink {
  type: string
  url: string
}

export interface ProductInfo extends Product {
  categoryId: string
  stock: number
}

export interface CategoryInfo {
  id: string
  name: string
  description: string
}

export interface PromotionInfo {
  id: string
  name: string
  description?: string
  discountPercentage: number
  imageUrl?: string
  startDate: Date
  endDate: Date
  // For compatibility with existing Promotion interface
  type: PromotionType
  productIds: string[]
  active: boolean
  price?: number
  percentage?: number
  buyQty?: number
  payQty?: number
}

export interface StorefrontOrderRequest {
  customerName: string
  customerPhone: string
  deliveryMethod: string
  paymentMethod: string
  street: string
  number: string
  floor: string
  apartment: string
  neighborhood: string
  reference: string
  total: string
  currency: string
  items: StorefrontOrderItemRequest[]
}

export interface StorefrontOrderItemRequest {
  productId: string
  type: string
  quantity: number
  unitPrice: string
  lineTotal: string
}

export interface OrderResponse {
  orderId: string
  status: string
  total: string
  currency: string
}
