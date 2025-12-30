import { Injectable, inject } from '@angular/core'
import { CartService } from './cart.service'
import { StoreConfigService } from './store-config.service'
import { OrderAdminService } from './order-admin.service'
import { OrderStatus } from '../models/order-tracking.model'
import { ApiService } from './api.service'

export interface OrderPayload {
  name: string
  phone: string
  deliveryMethod: 'pickup' | 'delivery'
  paymentMethod: 'transfer' | 'card' | 'cash'
  address?: {
    street?: string
    number?: string
    neighborhood?: string
    floor?: string
    apartment?: string
    reference?: string
  }
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private adminOrders = inject(OrderAdminService)
  private api = inject(ApiService)
  constructor(private cart: CartService, private store: StoreConfigService) {}

  sendOrder(payload: OrderPayload) {
    const items = this.cart.cartItems()
    const currency = this.store.config.currency
    const storeAddress = this.store.config.address ?? ''
    const orderId = `ORD-${Date.now()}`
    const summary = items
      .map(i => (i.type === 'product' ? i.product.name : i.promo.name) + ` x${i.quantity}`)
      .join(', ')
    const total = this.cart.totalAmount()
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

    const lines = [
      `Order for ${this.store.config.name} (${orderId})`,
      '',
      `Customer: ${payload.name}`,
      `Phone: ${payload.phone}`,
      '',
      `Delivery: ${
        payload.deliveryMethod === 'delivery'
          ? `Home delivery${this.buildAddressLine(payload.address)}`
          : `Store pickup${storeAddress ? ` - ${storeAddress}` : ''}`
      }`,
      `Payment: ${this.formatPayment(payload.paymentMethod)}`,
      '',
      'Items:',
      ...items.map(
        i =>
          `- ${
            i.type === 'product' ? i.product.name : i.promo.name
          } x${i.quantity} = ${this.store.currencySymbol} ${this.cart.getLineTotalForItem(i)}`
      ),
      '',
      `Total: ${this.store.currencySymbol} ${total}`,
      '',
      `Tracking: ${this.buildTrackingUrl(orderId)}`,
    ]

    const message = lines.join('\n')
    const phone = this.store.config.whatsappNumber
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')

    const status: OrderStatus = 'pending'

    // Save to local admin orders (for backward compatibility)
    this.adminOrders.addOrder(
      {
        id: orderId,
        customer: payload.name,
        items: itemsCount,
        total,
        status,
      },
      {
        id: orderId,
        status,
        deliveryMethod: payload.deliveryMethod,
        paymentMethod: payload.paymentMethod,
        summary,
        total,
        currency: this.store.currencySymbol,
      }
    )

    // Save to backend API
    const orderForApi = {
      id: orderId,
      tenantId: 'tenant-demo',
      customerName: payload.name,
      customerPhone: payload.phone,
      status: status,
      deliveryMethod: payload.deliveryMethod,
      paymentMethod: payload.paymentMethod,
      total: total,
      currency: currency,
      street: payload.address?.street,
      number: payload.address?.number,
      neighborhood: payload.address?.neighborhood,
      floor: payload.address?.floor,
      apartment: payload.address?.apartment,
      reference: payload.address?.reference,
      orderItems: items.map(item => ({
        type: item.type,
        productId: item.type === 'product' ? item.product.id : undefined,
        promotionId: item.type === 'promo' ? item.promo.id : undefined,
        quantity: item.quantity,
        unitPrice: this.cart.getUnitPriceForItem(item) || 0,
        lineTotal: this.cart.getLineTotalForItem(item) || 0
      }))
    }

    this.api.createOrder(orderForApi).subscribe({
      next: (response) => {
        console.log('Order saved to backend:', response)
      },
      error: (error) => {
        console.error('Error saving order to backend:', error)
      }
    })

    return orderId
  }

  private buildAddressLine(address?: OrderPayload['address']) {
    if (!address) return ''
    const parts = [
      address.street,
      address.number,
      address.neighborhood ? `(${address.neighborhood})` : '',
      address.floor,
      address.apartment,
      address.reference,
    ].filter(Boolean)
    return parts.length ? ` - ${parts.join(' ')}` : ''
  }

  private buildTrackingUrl(orderId: string) {
    const origin = window.location.origin
    return `${origin}/track/${orderId}`
  }

  private formatPayment(method: OrderPayload['paymentMethod']) {
    switch (method) {
      case 'transfer':
        return 'Bank transfer'
      case 'card':
        return 'Card (in store)'
      case 'cash':
        return 'Cash'
      default:
        return ''
    }
  }
}
