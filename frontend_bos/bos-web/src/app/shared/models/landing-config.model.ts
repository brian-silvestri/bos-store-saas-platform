export interface LandingConfig {
  // Branding
  brandName: string;
  brandLogo?: string;
  brandColor: string;

  // Hero section
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroCta: {
    primary: { text: string; action: () => void };
    secondary?: { text: string; action: () => void };
  };
  heroFeatures: string[];

  // Preview section
  previewUrl?: string;
  previewTitle?: string;

  // Features
  featuresTitle: string;
  featuresSubtitle: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;

  // How it works
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  howItWorksSteps: Array<{
    number: number;
    title: string;
    description: string;
  }>;

  // CTA
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonAction: () => void;

  // Footer
  footerText: string;

  // Optional sections
  showCarousel?: boolean;
  showFaq?: boolean;
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
}
