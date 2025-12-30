import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NavigationEnd, Router, RouterModule } from '@angular/router'
import { Subscription } from 'rxjs'

interface LandingSlide {
  kicker: string
  headline: string
  body: string
  detail: string
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.page.html',
})
export class LandingPage implements OnInit, OnDestroy {
  slides: LandingSlide[] = [
    {
      kicker: 'Pedidos sin WhatsApp',
      headline: 'Recibi pedidos sin chatear',
      body: 'Cambia el estado y el cliente se notifica solo.',
      detail: 'Menos mensajes, mas control en cada venta.',
    },
    {
      kicker: 'Tienda lista para compartir',
      headline: 'Un link simple para vender',
      body: 'Compartis tu link y empezas a recibir pedidos.',
      detail: 'Tus clientes compran desde el celular en minutos.',
    },
    {
      kicker: 'Todo en un solo lugar',
      headline: 'Tu negocio ordenado',
      body: 'Productos, promos y pedidos sin planillas.',
      detail: 'Todo ordenado, todo actualizado.',
    },
    {
      kicker: 'Cada negocio separado',
      headline: 'Tus datos, tus ventas',
      body: 'Nada se mezcla, todo queda en tu tienda.',
      detail: 'Seguridad y confianza para crecer.',
    },
    {
      kicker: 'Actualizaciones al instante',
      headline: 'Todos ven lo mismo',
      body: 'Cocina, admin y cliente siempre sincronizados.',
      detail: 'Menos llamadas, mas control operativo.',
    },
  ]
  currentSlide = 0
  private slideInterval?: number
  private sub?: Subscription

  constructor(private router: Router) {}

  ngOnInit() {
    this.startAutoPlay()
    this.scrollFromUrl(this.router.url)
    this.sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.scrollFromUrl(event.urlAfterRedirects)
      }
    })
  }

  ngOnDestroy() {
    this.stopAutoPlay()
    this.sub?.unsubscribe()
  }

  startAutoPlay() {
    this.stopAutoPlay()
    this.slideInterval = window.setInterval(() => {
      this.nextSlide()
    }, 5500)
  }

  stopAutoPlay() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval)
      this.slideInterval = undefined
    }
  }

  nextSlide() {
    if (this.slides.length === 0) {
      return
    }
    this.currentSlide = (this.currentSlide + 1) % this.slides.length
  }

  previousSlide() {
    if (this.slides.length === 0) {
      return
    }
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length
  }

  goToSlide(index: number) {
    this.currentSlide = index
  }

  goToLogin() {
    this.router.navigate(['/login'])
  }

  goToDemo() {
    this.router.navigate(['/demo'])
  }

  private scrollFromUrl(url: string) {
    const path = url.split('?')[0].split('#')[0]
    const sectionId = path.replace('/', '')

    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const target = document.getElementById(sectionId)
    if (!target) {
      return
    }

    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }
}
