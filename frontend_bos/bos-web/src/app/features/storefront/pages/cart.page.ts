import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CartService } from '../../../core/services/cart.service'
import { CartItemComponent } from '../../../shared/components/cart-item/cart-item.component'
import { Router, RouterLink } from '@angular/router'
import { ToastComponent } from '../../../shared/components/toast/toast.component'
import { CheckoutAccessService } from '../../../core/services/checkout-access.service'

@Component({
  standalone: true,
  imports: [CommonModule, CartItemComponent, RouterLink, ToastComponent],
  templateUrl: './cart.page.html',
})
export class CartPage {
  constructor(
    public cart: CartService,
    private router: Router,
    private checkoutAccess: CheckoutAccessService
  ) {}

  goToCheckout() {
    this.checkoutAccess.allowOnce()
    this.router.navigate(['/checkout'])
  }
}
