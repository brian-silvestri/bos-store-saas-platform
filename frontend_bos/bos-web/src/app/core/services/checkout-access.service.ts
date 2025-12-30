import { Injectable, signal, inject } from '@angular/core'
import { Router, UrlTree } from '@angular/router'
import { CartService } from './cart.service'
import { ToastService } from './toast.service'

@Injectable({ providedIn: 'root' })
export class CheckoutAccessService {
  private allowedOnce = signal(false)
  private router = inject(Router)
  private toast = inject(ToastService)
  private cart = inject(CartService)

  allowOnce() {
    this.allowedOnce.set(true)
  }

  canActivate(): boolean | UrlTree {
    if (this.cart.cartItems().length === 0) {
      this.toast.showError('Add items before checkout.')
      return this.router.createUrlTree(['/cart'])
    }

    if (this.allowedOnce()) {
      this.allowedOnce.set(false)
      return true
    }

    this.toast.showError('Use "Continue" in the cart to proceed to checkout')
    return this.router.createUrlTree(['/cart'])
  }
}
