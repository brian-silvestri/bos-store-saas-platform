import { Injectable, computed, signal } from '@angular/core'
import { OrderStatus, OrderTracking } from '../models/order-tracking.model'

@Injectable({ providedIn: 'root' })
export class OrderTrackingService {
  private orders = signal<Record<string, OrderTracking>>({
    'ORDER-12345': {
      id: 'ORDER-12345',
      status: 'preparing',
      deliveryMethod: 'delivery',
      paymentMethod: 'card',
      summary: 'Combo Familia: 2 Pizzas + Coca Cola 2L x3',
      total: 15600,
      currency: '$',
    },
  })

  getOrder(id: string) {
    return computed(() => this.orders()[id])
  }

  updateStatus(id: string, status: OrderStatus) {
    const current = this.orders()
    if (!current[id]) return
    this.orders.set({ ...current, [id]: { ...current[id], status } })
  }

  ensureOrder(order: OrderTracking) {
    const current = this.orders()
    this.orders.set({ ...current, [order.id]: order })
  }
}
