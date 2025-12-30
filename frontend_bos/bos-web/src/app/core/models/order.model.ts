export interface Order {
  id?: string
  tenantId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  status: OrderStatus
  deliveryMethod: string
  paymentMethod: string
  total: number
  currency: string
  street?: string
  number?: string
  neighborhood?: string
  floor?: string
  apartment?: string
  reference?: string
  orderItems?: OrderItem[]
  createdAt?: Date
  updatedAt?: Date
}

export interface OrderItem {
  id?: string
  orderId?: string
  type: string
  productId?: string
  promotionId?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
