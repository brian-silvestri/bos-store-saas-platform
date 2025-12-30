import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StoreConfigService } from '../../../core/services/store-config.service'

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-float.component.html',
})
export class WhatsAppFloatComponent {
  isHovered = false

  constructor(public store: StoreConfigService) {}

  getWhatsAppLink(): string {
    const phone = this.store.config.whatsappNumber
    const message = encodeURIComponent('Hola! Necesito ayuda para elegir un producto')
    return `https://wa.me/${phone}?text=${message}`
  }
}
