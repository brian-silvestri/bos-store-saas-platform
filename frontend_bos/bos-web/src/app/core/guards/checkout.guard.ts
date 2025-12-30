import { CanActivateFn } from '@angular/router'
import { inject } from '@angular/core'
import { CheckoutAccessService } from '../services/checkout-access.service'

export const checkoutGuard: CanActivateFn = () => {
  return inject(CheckoutAccessService).canActivate()
}
