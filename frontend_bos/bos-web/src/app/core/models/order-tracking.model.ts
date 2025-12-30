export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'canceled'

export interface OrderTracking {
  id: string
  status: OrderStatus
  deliveryMethod: 'pickup' | 'delivery'
  paymentMethod: 'transfer' | 'card' | 'cash'
  summary: string
  total: number
  currency: string
}
