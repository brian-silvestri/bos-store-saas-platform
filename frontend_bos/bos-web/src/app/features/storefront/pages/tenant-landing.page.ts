import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { LandingTemplateComponent } from '../../../shared/components/landing-template.component';
import { LandingConfig } from '../../../shared/models/landing-config.model';

@Component({
  selector: 'app-tenant-landing',
  standalone: true,
  imports: [CommonModule, LandingTemplateComponent],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="text-gray-500">Cargando...</div>
      </div>
    } @else if (landingConfig()) {
      <app-landing-template [config]="landingConfig()!" />
    } @else {
      <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="text-gray-500">No se pudo cargar la información de la tienda</div>
      </div>
    }
  `,
})
export class TenantLandingPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  slug = signal('');
  storeName = signal('');
  storeDescription = signal('');
  loading = signal(true);

  landingConfig = computed<LandingConfig | null>(() => {
    if (this.loading() || !this.storeName()) return null;

    return {
      brandName: this.storeName(),
      brandColor: '#f97316', // orange-500
      heroTagline: 'Bienvenido a nuestra tienda',
      heroTitle: this.storeName(),
      heroSubtitle: 'Tu tienda online de confianza',
      heroDescription: 'Descubre nuestros productos y realiza tus pedidos de forma rápida y segura. Compra desde tu celular en minutos.',
      heroCta: {
        primary: {
          text: 'Ver productos',
          action: () => this.goToStore()
        },
      },
      heroFeatures: ['Pedidos online', 'Seguimiento en tiempo real', 'Ofertas exclusivas'],
      featuresTitle: 'Por qué elegirnos',
      featuresSubtitle: 'Todo lo que necesitas para una experiencia de compra perfecta',
      features: [
        {
          icon: 'M13 10V3L4 14h7v7l9-11h-7z',
          title: 'Compra rápida y fácil',
          description: 'Navega nuestro catálogo y realiza pedidos en minutos desde tu celular.'
        },
        {
          icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
          title: 'Seguimiento en tiempo real',
          description: 'Sabe el estado de tu pedido en todo momento con actualizaciones instantáneas.'
        },
        {
          icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
          title: 'Ofertas y promociones',
          description: 'Aprovecha nuestras ofertas especiales y descuentos exclusivos.'
        },
        {
          icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
          title: 'Pago seguro',
          description: 'Tus datos están protegidos con los más altos estándares de seguridad.'
        },
        {
          icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
          title: 'Carrito inteligente',
          description: 'Agrega productos, revisa tu pedido y finaliza tu compra con facilidad.'
        },
        {
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          title: 'Garantía de calidad',
          description: 'Todos nuestros productos son de la mejor calidad garantizada.'
        }
      ],
      howItWorksTitle: 'Compra en 3 pasos',
      howItWorksSubtitle: 'Proceso simple y rápido',
      howItWorksSteps: [
        {
          number: 1,
          title: 'Explora el catálogo',
          description: 'Navega por nuestros productos y agrega los que te gusten al carrito.'
        },
        {
          number: 2,
          title: 'Completa tu pedido',
          description: 'Ingresa tus datos de envío y elige tu método de pago preferido.'
        },
        {
          number: 3,
          title: 'Recibe tu pedido',
          description: 'Sigue el estado de tu pedido y recíbelo en la puerta de tu casa.'
        }
      ],
      ctaTitle: 'Empezá a comprar ahora',
      ctaDescription: 'Descubre todos nuestros productos y promociones',
      ctaButtonText: 'Ver productos',
      ctaButtonAction: () => this.goToStore(),
      footerText: `© 2025 ${this.storeName()}. Todos los derechos reservados.`,
      showFaq: false
    };
  });

  ngOnInit() {
    this.slug.set(this.route.snapshot.paramMap.get('slug') || '');
    this.loadTenantInfo();
  }

  loadTenantInfo() {
    this.api.getStorefrontBySlug(this.slug()).subscribe({
      next: (data) => {
        this.storeName.set(data.store.name);
        this.storeDescription.set('Bienvenido a nuestra tienda online');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tenant info:', err);
        this.loading.set(false);
      }
    });
  }

  goToStore() {
    this.router.navigate(['/store', this.slug()]);
  }
}
