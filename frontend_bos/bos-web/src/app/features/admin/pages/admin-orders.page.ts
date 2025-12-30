import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core'
import { AdminOrder } from '../../../core/models/admin-order.model'
import { OrderStatus } from '../../../core/models/order-tracking.model'
import { OrderAdminService } from '../../../core/services/order-admin.service'
import { SignalRService } from '../../../core/services/signalr.service'
import { Subscription } from 'rxjs'

type AdminOrderStatus = OrderStatus

type ViewMode = 'kanban' | 'list'

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.page.html',
  styleUrls: ['./admin-orders.page.css'],
})
export class AdminOrdersPage implements OnInit, OnDestroy {
  private ordersStore = inject(OrderAdminService)
  private signalR = inject(SignalRService)
  private subscriptions: Subscription[] = []

  statuses: { key: AdminOrderStatus; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'canceled', label: 'Canceled' },
  ]

  statusClasses: Record<AdminOrderStatus, string> = {
    pending: 'col-pending',
    confirmed: 'col-confirmed',
    preparing: 'col-preparing',
    ready: 'col-ready',
    delivered: 'col-delivered',
    canceled: 'col-canceled',
  }

  orders = this.ordersStore.ordersList
  viewMode: ViewMode = 'kanban'
  selectedOrder = signal<AdminOrder | null>(null)
  isFullscreen = false

  dragging: AdminOrder | null = null
  dragOver: AdminOrderStatus | null = null

  ngOnInit() {
    // Join the tenant group to receive all order updates for this tenant
    this.signalR.joinTenantGroup('tenant-demo')

    // Listen for new orders
    const orderCreatedSub = this.signalR.onOrderCreated().subscribe(order => {
      console.log('New order received in real-time:', order)
      this.ordersStore.refreshOrders()
    })

    // Listen for order status changes
    const statusChangedSub = this.signalR.onOrderStatusChanged().subscribe(update => {
      console.log('Order status changed in real-time:', update)
      this.ordersStore.updateStatusLocally(update.orderId, update.status as OrderStatus)
    })

    this.subscriptions.push(orderCreatedSub, statusChangedSub)
  }

  ngOnDestroy() {
    this.signalR.leaveTenantGroup('tenant-demo')
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  filtered(status: AdminOrderStatus) {
    return this.orders().filter(o => o.status === status)
  }

  move(order: AdminOrder, status: AdminOrderStatus) {
    this.ordersStore.updateStatus(order.id, status)
  }

  setView(mode: ViewMode) {
    this.viewMode = mode
  }

  onStatusChange(order: AdminOrder, event: Event) {
    const value = (event.target as HTMLSelectElement).value as AdminOrderStatus
    this.move(order, value)
  }

  trackById(_index: number, item: AdminOrder) {
    return item.id
  }

  onDragStart(order: AdminOrder, event: DragEvent) {
    this.dragging = order
    event.dataTransfer?.setData('text/plain', order.id)
  }

  allowDrop(event: DragEvent) {
    event.preventDefault()
  }

  onDrop(status: AdminOrderStatus, event: DragEvent) {
    event.preventDefault()
    if (this.dragging) {
      this.move(this.dragging, status)
      this.dragging = null
    }
    this.dragOver = null
  }

  onDragEnter(status: AdminOrderStatus) {
    this.dragOver = status
  }

  onDragLeave() {
    this.dragOver = null
  }

  getAvailableActions(currentStatus: AdminOrderStatus): { key: AdminOrderStatus; label: string; type: 'next' | 'prev' | 'cancel' }[] {
    const currentIndex = this.statuses.findIndex(s => s.key === currentStatus)
    const actions: { key: AdminOrderStatus; label: string; type: 'next' | 'prev' | 'cancel' }[] = []

    // Si no está cancelado ni entregado, puede cancelar
    if (currentStatus !== 'canceled' && currentStatus !== 'delivered') {
      actions.push({ key: 'canceled', label: 'Cancel', type: 'cancel' })
    }

    // Puede retroceder un estado (excepto si está en pending, canceled o delivered)
    if (currentIndex > 0 && currentStatus !== 'canceled' && currentStatus !== 'delivered') {
      const prevStatus = this.statuses[currentIndex - 1]
      actions.push({ key: prevStatus.key, label: `← ${prevStatus.label}`, type: 'prev' })
    }

    // Puede avanzar al siguiente estado (excepto si está en delivered o canceled)
    if (currentIndex < this.statuses.length - 2 && currentStatus !== 'canceled' && currentStatus !== 'delivered') {
      const nextStatus = this.statuses[currentIndex + 1]
      actions.push({ key: nextStatus.key, label: `${nextStatus.label} →`, type: 'next' })
    }

    return actions
  }

  getStatusLabel(status: AdminOrderStatus): string {
    return this.statuses.find(s => s.key === status)?.label || status
  }

  openOrderDetails(order: AdminOrder) {
    this.selectedOrder.set(order)
  }

  closeOrderDetails() {
    this.selectedOrder.set(null)
  }

  toggleFullscreen() {
    if (!this.isFullscreen) {
      // Enter fullscreen
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      }
      this.isFullscreen = true
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      this.isFullscreen = false
    }
  }

  getStatusClass(status: AdminOrderStatus): string {
    const classes: Record<AdminOrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border border-purple-300',
      ready: 'bg-green-100 text-green-800 border border-green-300',
      delivered: 'bg-green-200 text-green-900 border border-green-400',
      canceled: 'bg-red-100 text-red-800 border border-red-300',
    }
    return classes[status] || ''
  }

  getActionButtonClass(type: 'next' | 'prev' | 'cancel'): string {
    const classes = {
      next: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-2 border-green-600',
      prev: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400',
      cancel: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-2 border-red-600',
    }
    return classes[type] || ''
  }
}
