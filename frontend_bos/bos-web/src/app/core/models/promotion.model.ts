export type PromotionType = 'discount' | 'nxm' | 'bundle'

export interface Promotion {
  id: string
  name: string
  type: PromotionType
  productIds: string[]
  active: boolean
  description?: string
  imageUrl?: string
  price?: number
  percentage?: number
  buyQty?: number
  payQty?: number
}
