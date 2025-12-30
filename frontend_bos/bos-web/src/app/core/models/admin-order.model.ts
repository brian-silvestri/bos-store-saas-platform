import { OrderStatus } from './order-tracking.model'

export interface AdminOrderItem {
  id?: string
  type: string
  productId?: string
  promotionId?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface AdminOrder {
  id: string
  customer: string
  customerPhone?: string
  items: number
  total: number
  status: OrderStatus
  deliveryMethod?: string
  paymentMethod?: string
  street?: string
  number?: string
  neighborhood?: string
  floor?: string
  apartment?: string
  reference?: string
  orderItems?: AdminOrderItem[]
}
