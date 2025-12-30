import { Injectable, computed, inject, signal } from '@angular/core'
import { AdminOrder } from '../models/admin-order.model'
import { OrderStatus, OrderTracking } from '../models/order-tracking.model'
import { OrderTrackingService } from './order-tracking.service'
import { ApiService } from './api.service'

@Injectable({ providedIn: 'root' })
export class OrderAdminService {
  private tracking = inject(OrderTrackingService)
  private api = inject(ApiService)
  private orders = signal<AdminOrder[]>([])

  ordersList = computed(() => this.orders())

  constructor() {
    this.loadOrdersFromAPI()
  }

  private loadOrdersFromAPI() {
    this.api.getOrders().subscribe({
      next: (ordersFromAPI) => {
        const adminOrders: AdminOrder[] = ordersFromAPI.map(order => ({
          id: order.id || '',
          customer: order.customerName,
          customerPhone: order.customerPhone,
          items: order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0,
          total: order.total,
          status: order.status as OrderStatus,
          deliveryMethod: order.deliveryMethod,
          paymentMethod: order.paymentMethod,
          street: order.street,
          number: order.number,
          neighborhood: order.neighborhood,
          floor: order.floor,
          apartment: order.apartment,
          reference: order.reference,
          orderItems: order.orderItems?.map(item => ({
            id: item.id,
            type: item.type,
            productId: item.productId,
            promotionId: item.promotionId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
          }))
        }))
        // Sort by creation date descending (newest first)
        adminOrders.sort((a, b) => b.id.localeCompare(a.id))
        this.orders.set(adminOrders)
        this.seedTracking()
      },
      error: (error) => {
        console.error('Error loading orders from API:', error)
        // Fallback to empty list
        this.orders.set([])
      }
    })
  }

  addOrder(order: AdminOrder, tracking: OrderTracking) {
    // Update local state immediately for instant feedback
    this.orders.update(list => {
      if (list.some(item => item.id === order.id)) {
        return list.map(item => (item.id === order.id ? { ...item, ...order } : item))
      }
      return [order, ...list]
    })
    this.tracking.ensureOrder(tracking)

    // Reload from API after a short delay to get the persisted version
    setTimeout(() => {
      this.loadOrdersFromAPI()
    }, 1000)
  }

  updateStatus(id: string, status: OrderStatus) {
    // Update local state immediately
    this.orders.update(list => list.map(item => (item.id === id ? { ...item, status } : item)))
    this.tracking.updateStatus(id, status)

    // Update in backend
    this.api.updateOrderStatus(id, status).subscribe({
      next: () => {
        console.log(`Order ${id} status updated to ${status}`)
      },
      error: (error) => {
        console.error(`Error updating order ${id} status:`, error)
        // Optionally reload orders from API to sync
        this.loadOrdersFromAPI()
      }
    })
  }

  updateStatusLocally(id: string, status: OrderStatus) {
    // Only update local state (called from SignalR events)
    this.orders.update(list => list.map(item => (item.id === id ? { ...item, status } : item)))
    this.tracking.updateStatus(id, status)
  }

  refreshOrders() {
    this.loadOrdersFromAPI()
  }

  private seedTracking() {
    this.orders().forEach(order => this.tracking.ensureOrder(this.toTrackingOrder(order)))
  }

  private toTrackingOrder(order: AdminOrder): OrderTracking {
    return {
      id: order.id,
      status: order.status,
      deliveryMethod: 'delivery',
      paymentMethod: 'card',
      summary: `${order.items} item(s) for ${order.customer}`,
      total: order.total,
      currency: '$',
    }
  }
}
