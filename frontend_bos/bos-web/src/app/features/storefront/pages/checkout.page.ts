import { CommonModule } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { CartService } from '../../../core/services/cart.service'
import { StoreConfigService } from '../../../core/services/store-config.service'
import { ToastComponent } from '../../../shared/components/toast/toast.component'
import { ToastService } from '../../../core/services/toast.service'
import { OrderService } from '../../../core/services/order.service'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastComponent],
  templateUrl: './checkout.page.html',
})
export class CheckoutPage implements OnInit {
  name = ''
  phone = ''
  deliveryMethod: 'pickup' | 'delivery' | '' = ''
  paymentMethod: 'transfer' | 'card' | 'cash' | '' = ''
  submitted = false
  isSubmitting = false
  successOrderId: string | null = null
  address = {
    street: '',
    number: '',
    neighborhood: '',
    floor: '',
    apartment: '',
  }

  private router = inject(Router)
  private toast = inject(ToastService)
  private order = inject(OrderService)

  constructor(public cart: CartService, public store: StoreConfigService) {}

  ngOnInit() {
    if (this.cart.cartItems().length === 0) {
      this.router.navigate(['/store'])
    }
  }

  submit() {
    this.submitted = true
    if (this.hasErrors()) return
    if (this.cart.cartItems().length === 0 || this.cart.cartItems().some(i => i.quantity <= 0)) {
      return
    }

    this.isSubmitting = true
    const orderId = this.order.sendOrder({
      name: this.name,
      phone: this.phone,
      deliveryMethod: this.deliveryMethod as 'pickup' | 'delivery',
      paymentMethod: this.paymentMethod as 'transfer' | 'card' | 'cash',
      address:
        this.deliveryMethod === 'delivery'
          ? {
              street: this.address.street,
              number: this.address.number,
              neighborhood: this.address.neighborhood,
              floor: this.address.floor,
              apartment: this.address.apartment,
            }
          : undefined,
    })
    this.isSubmitting = false
    this.successOrderId = orderId
    this.toast.showSuccess('Order ready to send')
  }

  isInvalid(field: string) {
    if (!this.submitted) return false
    switch (field) {
      case 'name':
        return !this.name.trim()
      case 'phone':
        return !this.phone.trim()
      case 'deliveryMethod':
        return !this.deliveryMethod
      case 'paymentMethod':
        return !this.paymentMethod
      case 'street':
        return this.deliveryMethod === 'delivery' && !this.address.street.trim()
      case 'number':
        return this.deliveryMethod === 'delivery' && !this.address.number.trim()
      case 'neighborhood':
        return this.deliveryMethod === 'delivery' && !this.address.neighborhood.trim()
      default:
        return false
    }
  }

  hasErrors() {
    return (
      !this.name.trim() ||
      !this.phone.trim() ||
      !this.deliveryMethod ||
      !this.paymentMethod ||
      (this.deliveryMethod === 'delivery' &&
        (!this.address.street.trim() || !this.address.number.trim() || !this.address.neighborhood.trim()))
    )
  }
}
