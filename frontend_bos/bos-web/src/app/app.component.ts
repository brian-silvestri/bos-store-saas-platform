import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit, signal } from '@angular/core'
import { Router, RouterOutlet, NavigationEnd } from '@angular/router'
import { HeaderComponent } from './shared/components/header/header.component'
import { NavbarComponent } from './shared/components/navbar/navbar.component'
import { FooterComponent } from './shared/components/footer/footer.component'
import { WhatsAppFloatComponent } from './shared/components/whatsapp-float/whatsapp-float.component'
import { StoreConfigService } from './core/services/store-config.service'
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, NavbarComponent, FooterComponent, WhatsAppFloatComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  isAdminRoute = signal(false)
  isStoreRoute = signal(false)
  isTrackingRoute = signal(false)
  isLandingRoute = signal(false)
  isAuthRoute = signal(false)
  private sub?: Subscription

  constructor(private storeConfig: StoreConfigService, private router: Router) {}

  ngOnInit() {
    this.storeConfig.applyBranding()
    this.checkRoutes(this.router.url)
    this.sub = this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        this.checkRoutes(ev.urlAfterRedirects)
      }
    })
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }

  private checkRoutes(url: string) {
    const baseUrl = url.split('#')[0].split('?')[0]
    const landingRoutes = new Set(['/', '/producto', '/funciones', '/proceso', '/contacto'])
    this.isAdminRoute.set(baseUrl.startsWith('/admin') || baseUrl.startsWith('/super-admin'))
    this.isStoreRoute.set(baseUrl.startsWith('/store'))
    this.isTrackingRoute.set(baseUrl.startsWith('/track'))
    this.isLandingRoute.set(landingRoutes.has(baseUrl))
    this.isAuthRoute.set(baseUrl === '/login')
  }
}
