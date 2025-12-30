import { Product } from './product.model'
import { Promotion } from './promotion.model'

export type CartItem =
  | {
      type: 'product'
      product: Product
      quantity: number
    }
  | {
      type: 'promo'
      promo: Promotion
      quantity: number
    }
