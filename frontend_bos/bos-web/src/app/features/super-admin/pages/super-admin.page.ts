import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ApiService } from '../../../core/services/api.service'
import { TenantSummary, GlobalStats } from '../../../core/models/super-admin.model'

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './super-admin.page.html',
  styleUrls: ['./super-admin.page.css'],
})
export class SuperAdminPage implements OnInit {
  private api = inject(ApiService)

  tenants = signal<TenantSummary[]>([])
  stats = signal<GlobalStats | null>(null)
  loading = signal(true)

  ngOnInit() {
    this.loadData()
  }

  loadData() {
    this.loading.set(true)

    this.api.getSuperAdminTenants().subscribe({
      next: (data) => {
        this.tenants.set(data)
        this.loading.set(false)
      },
      error: (error) => {
        console.error('Error loading tenants:', error)
        this.loading.set(false)
      }
    })

    this.api.getSuperAdminStats().subscribe({
      next: (data) => {
        this.stats.set(data)
      },
      error: (error) => {
        console.error('Error loading stats:', error)
      }
    })
  }

  toggleTenantStatus(tenantId: string) {
    this.api.toggleTenantStatus(tenantId).subscribe({
      next: () => {
        this.loadData()
      },
      error: (error) => {
        console.error('Error toggling tenant status:', error)
      }
    })
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  trackById(index: number, item: TenantSummary): string {
    return item.id
  }
}
