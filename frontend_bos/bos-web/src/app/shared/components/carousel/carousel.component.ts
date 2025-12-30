import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core'
import { Router } from '@angular/router'
import { StoreConfigService } from '../../../core/services/store-config.service'
import { CarouselSlide } from '../../../core/models/store-config.model'

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
})
export class CarouselComponent implements OnInit, OnDestroy {
  currentSlide = signal(0)
  private intervalId?: number

  // Slides por defecto si no hay configurados
  private defaultSlides: CarouselSlide[] = [
    {
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&h=1080&fit=crop',
      title: 'Más de 30 años de experiencia en repuestos',
      subtitle: 'Asesoramiento profesional para elegir el repuesto correcto',
      buttonText: 'Consultar por WhatsApp',
      buttonLink: '/store',
      active: true
    },
    {
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&h=1080&fit=crop',
      title: 'Multimarca – Trabajamos con todas las marcas',
      subtitle: 'Si no lo ves publicado, consultanos',
      buttonText: 'Ver Catálogo',
      buttonLink: '/store',
      active: true
    },
    {
      image: 'https://images.unsplash.com/photo-1611695434369-a8f5d76cce4e?w=1920&h=1080&fit=crop',
      title: 'Pedidos simples por WhatsApp',
      subtitle: 'Consultá disponibilidad y precios al instante',
      buttonText: 'Contactar Ahora',
      buttonLink: '/store',
      active: true
    },
    {
      image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1920&h=1080&fit=crop',
      title: 'Envíos rápidos o retiro en local',
      subtitle: 'Entregas en 24–48 hs o retiro coordinado',
      buttonText: 'Ver Productos',
      buttonLink: '/store',
      active: true
    }
  ]

  // Usar slides configurados o por defecto, y filtrar solo activos
  slides = computed(() => {
    const configSlides = this.store.config.carouselSlides
    const allSlides = configSlides && configSlides.length > 0 ? configSlides : this.defaultSlides
    return allSlides.filter(slide => slide.active)
  })

  constructor(
    private router: Router,
    private store: StoreConfigService
  ) {}

  ngOnInit() {
    this.startAutoPlay()
  }

  ngOnDestroy() {
    this.stopAutoPlay()
  }

  startAutoPlay() {
    this.intervalId = window.setInterval(() => {
      this.nextSlide()
    }, 5000)
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  nextSlide() {
    this.currentSlide.update(current =>
      current === this.slides().length - 1 ? 0 : current + 1
    )
  }

  previousSlide() {
    this.currentSlide.update(current =>
      current === 0 ? this.slides().length - 1 : current - 1
    )
  }

  goToSlide(index: number) {
    this.currentSlide.set(index)
  }

  navigate(link: string) {
    this.router.navigate([link])
  }
}
