import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { StoreConfigService } from '../../../core/services/store-config.service'

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  currentYear = new Date().getFullYear()

  constructor(
    private router: Router,
    public store: StoreConfigService
  ) {}

  navigateTo(route: string) {
    this.router.navigate([route])
  }

  getWhatsAppLink(): string {
    const phone = this.store.config.whatsappNumber
    const message = encodeURIComponent(`Hola! Estoy interesado en sus productos`)
    return `https://wa.me/${phone}?text=${message}`
  }
}
