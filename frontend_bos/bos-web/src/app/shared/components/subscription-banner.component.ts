import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { ApiService } from '../../core/services/api.service'
import { Subscription } from '../../core/models/license.model'

@Component({
  selector: 'app-subscription-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShowBanner()) {
      <div class="subscription-banner" [class]="'banner-' + getBannerType()">
        <div class="container">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="banner-icon">
                @if (getBannerType() === 'expired') {
                  ⚠️
                } @else {
                  ⏰
                }
              </span>
              <div>
                <div class="banner-title">
                  @if (getBannerType() === 'expired') {
                    Tu suscripción ha expirado
                  } @else {
                    Tu suscripción está por vencer
                  }
                </div>
                <div class="banner-message">
                  @if (getDaysRemaining() <= 0) {
                    Activa un código de licencia para continuar usando la plataforma
                  } @else {
                    Te quedan {{ getDaysRemaining() }} días. Activa un código de licencia para extender tu plan.
                  }
                </div>
              </div>
            </div>
            <button
              (click)="goToSubscription()"
              class="banner-button"
            >
              Activar Licencia
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .subscription-banner {
      padding: 1rem 0;
      border-bottom: 2px solid;
      font-weight: 500;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .banner-warning {
      background: rgba(245, 158, 11, 0.1);
      border-color: #f59e0b;
      color: #d97706;
    }

    .banner-expired {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
      color: #dc2626;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .banner-icon {
      font-size: 1.5rem;
    }

    .banner-title {
      font-weight: 700;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .banner-message {
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .banner-button {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      white-space: nowrap;
      transition: all 0.2s;
      border: 2px solid currentColor;
      background: white;
    }

    .banner-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class SubscriptionBannerComponent implements OnInit {
  subscription = signal<Subscription | null>(null)
  loading = signal(false)

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

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
      error: () => {
        this.loading.set(false)
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

  shouldShowBanner(): boolean {
    if (!this.subscription()) return false
    const days = this.getDaysRemaining()
    return days <= 7 // Show banner if 7 days or less remaining
  }

  getBannerType(): 'warning' | 'expired' {
    const days = this.getDaysRemaining()
    return days <= 0 ? 'expired' : 'warning'
  }

  goToSubscription() {
    this.router.navigate(['/admin/subscription'])
  }
}
