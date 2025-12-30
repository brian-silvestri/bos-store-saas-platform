import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { AdminSidebarComponent, SidebarLink } from '../../shared/components/admin-sidebar.component'

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent],
  template: `
    <div class="min-h-screen flex bg-[var(--neutral-surface)]">
      <app-admin-sidebar
        title="BosStore"
        subtitle="Super Admin"
        [links]="superAdminLinks"
        footerText="Platform Admin"
      />

      <section class="flex-1 p-6">
        <router-outlet></router-outlet>
      </section>
    </div>
  `
})
export class SuperAdminLayoutComponent {
  superAdminLinks: SidebarLink[] = [
    { label: 'Dashboard', route: '/super-admin' },
    { label: 'Tenants', route: '/super-admin/tenants' },
    { label: 'Licenses', route: '/super-admin/licenses' },
  ]
}
