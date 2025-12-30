import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { Subscription } from '../../../core/models/license.model'

@Component({
  selector: 'app-admin-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-subscription.page.html',
  styleUrls: ['./admin-subscription.page.css']
})
export class AdminSubscriptionPage implements OnInit {
  subscription = signal<Subscription | null>(null)
  loading = signal(false)
  licenseCode = ''
  activating = signal(false)

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadSubscription()
  }

  loadSubscription() {
    this.loading.set(true)
    this.api.getMySubscription().subscribe({
      next: (sub) => {
        this.subscription.set(sub)
        this.loading.set(false)
      },
      error: (err) => {
        console.error('Error loading subscription:', err)
        this.loading.set(false)
      }
    })
  }

  activateLicense() {
    if (!this.licenseCode.trim()) {
      alert('Por favor ingresa un código de licencia')
      return
    }

    this.activating.set(true)
    this.api.activateLicense({ licenseCode: this.licenseCode }).subscribe({
      next: () => {
        alert('¡Código activado exitosamente!')
        this.licenseCode = ''
        this.loadSubscription()
        this.activating.set(false)
      },
      error: (err) => {
        console.error('Error activating license:', err)
        alert(err.error?.message || 'Error al activar el código')
        this.activating.set(false)
      }
    })
  }

  getDaysRemaining(): number {
    if (!this.subscription()) return 0
    const end = new Date(this.subscription()!.endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  getStatusColor(): string {
    const days = this.getDaysRemaining()
    if (days <= 0) return 'expired'
    if (days <= 7) return 'warning'
    return 'active'
  }

  getStatusText(): string {
    const days = this.getDaysRemaining()
    if (days <= 0) return 'Expirado'
    if (days <= 7) return 'Por vencer'
    return 'Activo'
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
