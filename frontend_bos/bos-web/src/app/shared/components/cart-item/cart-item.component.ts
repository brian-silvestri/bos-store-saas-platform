import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { CartItem } from '../../../core/models/cart-item.model'
import { CartService } from '../../../core/services/cart.service'
import { StoreConfigService } from '../../../core/services/store-config.service'
import { ToastService } from '../../../core/services/toast.service'
import { ConfirmService } from '../../../core/services/confirm.service'

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.css'],
})
export class CartItemComponent {
  @Input() item!: CartItem
  constructor(
    public cart: CartService,
    public store: StoreConfigService,
    private toast: ToastService,
    private confirm: ConfirmService
  ) {}

  async decrease() {
    const itemName = this.item.type === 'product' ? this.item.product.name : this.item.promo.name
    const confirmed = await this.confirm.confirm(
      `Reduce quantity for ${itemName}?`
    )
    if (!confirmed) return

    const removing = this.item.quantity === 1
    this.cart.updateQty(
      this.item.type,
      this.item.type === 'product' ? this.item.product.id : this.item.promo.id,
      -1
    )
    if (removing) {
      this.toast.showSuccess(`${itemName} eliminado`)
    }
  }
}
