import { Routes } from '@angular/router'
import { LandingPage } from './features/storefront/pages/landing.page'
import { TenantLandingPage } from './features/storefront/pages/tenant-landing.page'
import { StorePage } from './features/storefront/pages/store.page'
import { CartPage } from './features/storefront/pages/cart.page'
import { CheckoutPage } from './features/storefront/pages/checkout.page'
import { checkoutGuard } from './core/guards/checkout.guard'
import { authGuard } from './core/guards/auth.guard'
import { adminGuard } from './core/guards/admin.guard'
import { superAdminGuard } from './core/guards/super-admin.guard'
import { OrderTrackingPage } from './features/storefront/pages/order-tracking.page'
import { ProductDetailPage } from './features/storefront/pages/product-detail.page'
import { PromoDetailPage } from './features/storefront/pages/promo-detail.page'
import { LoginPage } from './features/admin/pages/login.page'
import { AdminLayoutComponent } from './features/admin/admin-layout.component'
import { AdminDashboardPage } from './features/admin/pages/admin-dashboard.page'
import { AdminProductsPage } from './features/admin/pages/admin-products.page'
import { AdminCategoriesPage } from './features/admin/pages/admin-categories.page'
import { AdminPromotionsPage } from './features/admin/pages/admin-promotions.page'
import { AdminOrdersPage } from './features/admin/pages/admin-orders.page'
import { AdminPublicPage } from './features/admin/pages/admin-public.page'
import { AdminSettingsPage } from './features/admin/pages/admin-settings.page'
import { SuperAdminPage } from './features/super-admin/pages/super-admin.page'
import { SuperAdminLayoutComponent } from './features/super-admin/super-admin-layout.component'
import { LicensesPage } from './features/super-admin/pages/licenses.page'
import { AdminSubscriptionPage } from './features/admin/pages/admin-subscription.page'

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'producto', component: LandingPage },
  { path: 'funciones', component: LandingPage },
  { path: 'proceso', component: LandingPage },
  { path: 'contacto', component: LandingPage },
  { path: 'login', component: LoginPage },
  { path: 'store/:slug', component: StorePage },
  { path: 'store/:slug/product/:id', component: ProductDetailPage },
  { path: 'store/:slug/promo/:id', component: PromoDetailPage },
  { path: 'store/:slug/cart', component: CartPage },
  { path: 'store/:slug/checkout', component: CheckoutPage, canActivate: [checkoutGuard] },
  { path: 'store/:slug/track/:orderId', component: OrderTrackingPage },
  {
    path: 'super-admin',
    component: SuperAdminLayoutComponent,
    canActivate: [superAdminGuard],
    children: [
      { path: '', component: SuperAdminPage },
      { path: 'tenants', component: SuperAdminPage },
      { path: 'licenses', component: LicensesPage },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardPage },
      { path: 'products', component: AdminProductsPage },
      { path: 'categories', component: AdminCategoriesPage },
      { path: 'promotions', component: AdminPromotionsPage },
      { path: 'orders', component: AdminOrdersPage },
      { path: 'subscription', component: AdminSubscriptionPage },
      { path: 'public', component: AdminPublicPage },
      { path: 'settings', component: AdminSettingsPage },
    ],
  },
  { path: ':slug', component: TenantLandingPage },
  { path: '**', redirectTo: 'store' },
]
