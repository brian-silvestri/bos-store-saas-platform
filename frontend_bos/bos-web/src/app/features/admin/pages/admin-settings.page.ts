import { CommonModule } from '@angular/common'
import { Component, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { StoreConfigService } from '../../../core/services/store-config.service'
import { ThemeKey } from '../../../core/services/theme-palettes'
import { ConfirmService } from '../../../core/services/confirm.service'
import { CarouselSlide } from '../../../core/models/store-config.model'

type SettingsTab = 'info' | 'theme' | 'social' | 'carousel'

interface SocialMedia {
  type: string
  url: string
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.page.html',
  styleUrl: './admin-settings.page.css',
})
export class AdminSettingsPage implements OnInit {
  // Tab actual
  currentTab = signal<SettingsTab>('info')

  // Estado de guardado
  saving = signal(false)
  savedSuccessfully = signal(false)

  // Carousel slides
  carouselSlides: CarouselSlide[] = []
  maxSlides = 4

  // Redes sociales (máximo 3)
  socialMedia: SocialMedia[] = []
  maxSocialMedia = 3
  availableSocialTypes = ['instagram', 'facebook', 'twitter', 'linkedin']

  constructor(public store: StoreConfigService, private confirm: ConfirmService) {}

  ngOnInit() {
    this.initializeCarouselSlides()
    this.initializeSocialMedia()
  }

  // ============================================
  // TAB NAVIGATION
  // ============================================

  setTab(tab: SettingsTab) {
    this.currentTab.set(tab)
  }

  nextTab() {
    const tabs: SettingsTab[] = ['info', 'theme', 'social', 'carousel']
    const currentIndex = tabs.indexOf(this.currentTab())
    if (currentIndex < tabs.length - 1) {
      this.currentTab.set(tabs[currentIndex + 1])
    }
  }

  prevTab() {
    const tabs: SettingsTab[] = ['info', 'theme', 'social', 'carousel']
    const currentIndex = tabs.indexOf(this.currentTab())
    if (currentIndex > 0) {
      this.currentTab.set(tabs[currentIndex - 1])
    }
  }

  get canGoPrev(): boolean {
    return this.currentTab() !== 'info'
  }

  get canGoNext(): boolean {
    return this.currentTab() !== 'carousel'
  }

  // ============================================
  // SAVE CHANGES
  // ============================================

  async saveChanges() {
    const ok = await this.confirm.confirm(
      '¿Guardar todos los cambios? Los cambios se aplicarán en toda la tienda (Landing + Store)'
    )
    if (!ok) return

    this.saving.set(true)

    // Actualizar config con redes sociales
    this.updateSocialMediaInConfig()

    // Aplicar branding y guardar en backend
    this.store.applyBranding()

    this.store.saveConfig().subscribe({
      next: () => {
        this.saving.set(false)
        this.savedSuccessfully.set(true)

        // Ocultar mensaje después de 3 segundos
        setTimeout(() => this.savedSuccessfully.set(false), 3000)
      },
      error: (err) => {
        this.saving.set(false)
        console.error('Error guardando configuración:', err)
        alert('Error al guardar los cambios. Por favor, intenta nuevamente.')
      }
    })
  }

  // ============================================
  // THEME & COLORS
  // ============================================

  onThemeChange(themeKey: ThemeKey) {
    this.store.previewTheme(themeKey)
  }

  onColorChange() {
    this.store.applyBranding()
  }

  // ============================================
  // LOGO
  // ============================================

  onLogoFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      this.store.config.logoUrl = base64
    }
    reader.readAsDataURL(file)
  }

  clearLogo() {
    this.store.config.logoUrl = undefined
  }

  // ============================================
  // REDES SOCIALES
  // ============================================

  private initializeSocialMedia() {
    this.socialMedia = []

    // Cargar redes existentes desde config
    if (this.store.config.socialMedia1Type && this.store.config.socialMedia1Url) {
      this.socialMedia.push({
        type: this.store.config.socialMedia1Type,
        url: this.store.config.socialMedia1Url
      })
    }
    if (this.store.config.socialMedia2Type && this.store.config.socialMedia2Url) {
      this.socialMedia.push({
        type: this.store.config.socialMedia2Type,
        url: this.store.config.socialMedia2Url
      })
    }
    if (this.store.config.socialMedia3Type && this.store.config.socialMedia3Url) {
      this.socialMedia.push({
        type: this.store.config.socialMedia3Type,
        url: this.store.config.socialMedia3Url
      })
    }
  }

  private updateSocialMediaInConfig() {
    // Limpiar
    this.store.config.socialMedia1Type = undefined
    this.store.config.socialMedia1Url = undefined
    this.store.config.socialMedia2Type = undefined
    this.store.config.socialMedia2Url = undefined
    this.store.config.socialMedia3Type = undefined
    this.store.config.socialMedia3Url = undefined

    // Actualizar desde el array
    if (this.socialMedia[0]) {
      this.store.config.socialMedia1Type = this.socialMedia[0].type
      this.store.config.socialMedia1Url = this.socialMedia[0].url
    }
    if (this.socialMedia[1]) {
      this.store.config.socialMedia2Type = this.socialMedia[1].type
      this.store.config.socialMedia2Url = this.socialMedia[1].url
    }
    if (this.socialMedia[2]) {
      this.store.config.socialMedia3Type = this.socialMedia[2].type
      this.store.config.socialMedia3Url = this.socialMedia[2].url
    }
  }

  addSocialMedia() {
    if (this.socialMedia.length < this.maxSocialMedia) {
      this.socialMedia.push({ type: 'instagram', url: '' })
    }
  }

  removeSocialMedia(index: number) {
    this.socialMedia.splice(index, 1)
  }

  canAddSocialMedia(): boolean {
    return this.socialMedia.length < this.maxSocialMedia
  }

  // ============================================
  // CAROUSEL SLIDES
  // ============================================

  private initializeCarouselSlides() {
    if (!this.store.config.carouselSlides || this.store.config.carouselSlides.length === 0) {
      this.carouselSlides = [
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
      this.store.config.carouselSlides = this.carouselSlides
    } else {
      this.carouselSlides = this.store.config.carouselSlides
    }
  }

  addNewSlide() {
    if (this.carouselSlides.length < this.maxSlides) {
      const newSlide: CarouselSlide = {
        title: 'Nuevo Slide',
        subtitle: 'Agrega un subtítulo descriptivo',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&h=1080&fit=crop',
        buttonText: 'Ver Más',
        buttonLink: '/store',
        active: true
      }
      this.carouselSlides.push(newSlide)
      this.store.config.carouselSlides = this.carouselSlides
    }
  }

  removeSlide(index: number) {
    this.carouselSlides.splice(index, 1)
    this.store.config.carouselSlides = this.carouselSlides
  }

  canAddSlide(): boolean {
    return this.carouselSlides.length < this.maxSlides
  }

  moveSlideUp(index: number) {
    if (index > 0) {
      [this.carouselSlides[index - 1], this.carouselSlides[index]] =
      [this.carouselSlides[index], this.carouselSlides[index - 1]]
      this.store.config.carouselSlides = this.carouselSlides
    }
  }

  moveSlideDown(index: number) {
    if (index < this.carouselSlides.length - 1) {
      [this.carouselSlides[index], this.carouselSlides[index + 1]] =
      [this.carouselSlides[index + 1], this.carouselSlides[index]]
      this.store.config.carouselSlides = this.carouselSlides
    }
  }

  onSlideImageChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      this.carouselSlides[index].image = base64
      this.store.config.carouselSlides = this.carouselSlides
    }
    reader.readAsDataURL(file)
  }
}
