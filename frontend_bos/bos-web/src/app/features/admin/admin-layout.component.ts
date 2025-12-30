import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { StoreConfigService } from '../../core/services/store-config.service'
import { AdminSidebarComponent, SidebarLink } from '../../shared/components/admin-sidebar.component'
import { SubscriptionBannerComponent } from '../../shared/components/subscription-banner.component'
import { AdminHeaderComponent } from '../../shared/components/admin-header.component'

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent, SubscriptionBannerComponent, AdminHeaderComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {
  adminLinks: SidebarLink[] = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Products', route: '/admin/products' },
    { label: 'Categories', route: '/admin/categories' },
    { label: 'Promotions', route: '/admin/promotions' },
    { label: 'Orders', route: '/admin/orders' },
    { label: 'Subscription', route: '/admin/subscription' },
    { label: 'Public store', route: '/admin/public' },
    { label: 'Settings', route: '/admin/settings' },
  ]

  constructor(public store: StoreConfigService) {}
}
