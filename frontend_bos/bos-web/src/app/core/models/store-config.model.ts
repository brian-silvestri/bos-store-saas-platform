export interface CarouselSlide {
  title: string
  subtitle: string
  image: string
  buttonText: string
  buttonLink: string
  active: boolean
}

export interface StoreConfig {
  name: string
  whatsappNumber: string
  currency: 'ARS' | 'USD'
  primaryColor: string
  secondaryColor: string
  address?: string
  themeKey?: string
  logoUrl?: string
  carouselSlides?: CarouselSlide[]

  // Redes Sociales (máximo 3)
  socialMedia1Type?: string
  socialMedia1Url?: string
  socialMedia2Type?: string
  socialMedia2Url?: string
  socialMedia3Type?: string
  socialMedia3Url?: string
}
