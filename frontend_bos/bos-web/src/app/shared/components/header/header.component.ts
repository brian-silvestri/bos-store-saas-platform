import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { CartService } from '../../../core/services/cart.service'
import { StoreConfigService } from '../../../core/services/store-config.service'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Input() showCart = true
  constructor(public cart: CartService, public store: StoreConfigService) {}
}
