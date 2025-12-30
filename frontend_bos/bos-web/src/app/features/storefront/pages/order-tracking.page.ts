import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { OrderTrackingService } from '../../../core/services/order-tracking.service'
import { OrderStatus } from '../../../core/models/order-tracking.model'
import { SignalRService } from '../../../core/services/signalr.service'
import { Subscription } from 'rxjs'

const STATUS_STEPS: { key: OrderStatus; title: string; subtitle: string }[] = [
  { key: 'pending', title: 'Pending', subtitle: 'Order received' },
  { key: 'confirmed', title: 'Confirmed', subtitle: 'Order confirmed' },
  { key: 'preparing', title: 'In Preparation', subtitle: 'Being prepared' },
  { key: 'ready', title: 'Ready', subtitle: 'Ready for pickup/delivery' },
  { key: 'delivered', title: 'Delivered', subtitle: 'Order completed' },
  { key: 'canceled', title: 'Canceled', subtitle: 'Order canceled' },
]

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-tracking.page.html',
  styleUrls: ['./order-tracking.page.css'],
})
export class OrderTrackingPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private trackingService = inject(OrderTrackingService)
  private signalR = inject(SignalRService)
  private subscription?: Subscription

  orderId = this.route.snapshot.paramMap.get('orderId') ?? 'ORDER-12345'
  order = this.trackingService.getOrder(this.orderId)
  steps = STATUS_STEPS
  showSummary = false

  ngOnInit() {
    // Join the SignalR group for this specific order
    this.signalR.joinOrderGroup(this.orderId)

    // Listen for status updates
    this.subscription = this.signalR.onOrderStatusChanged().subscribe(update => {
      if (update.orderId === this.orderId) {
        console.log('Order status updated in real-time:', update)
        this.trackingService.updateStatus(this.orderId, update.status as OrderStatus)
      }
    })
  }

  ngOnDestroy() {
    // Leave the SignalR group when component is destroyed
    this.signalR.leaveOrderGroup(this.orderId)
    this.subscription?.unsubscribe()
  }

  get statusLabel() {
    const current = this.order()
    const found = this.steps.find(s => s.key === current?.status)
    return found?.title ?? 'Pending'
  }

  isActive(step: OrderStatus) {
    const order = this.order()
    if (!order) return false
    if (order.status === 'canceled') {
      return step === 'canceled'
    }
    const currentIndex = this.steps.findIndex(s => s.key === order.status)
    const stepIndex = this.steps.findIndex(s => s.key === step)
    return step !== 'canceled' && stepIndex <= currentIndex
  }

  toggleSummary() {
    this.showSummary = !this.showSummary
  }
}
