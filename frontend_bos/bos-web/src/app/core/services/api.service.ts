import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StoreConfig } from '../models/store-config.model';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import {
  StorefrontResponse,
  ProductInfo,
  StorefrontOrderRequest,
  OrderResponse
} from '../models/storefront.model';

export interface LoginRequest {
  tenantId: string;
  email: string;
  password: string;
}

export interface RegisterRequest {
  tenantId: string;
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  tenantId: string;
  email: string;
  name: string;
}

export interface OrderCreateResponse {
  id: string;
}

export interface OrderStatusUpdate {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api`;

  // Authentication
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request);
  }

  // Store Configuration
  getStoreConfig(): Observable<StoreConfig> {
    return this.http.get<StoreConfig>(`${this.apiUrl}/storeconfig`);
  }

  updateStoreConfig(config: StoreConfig): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/storeconfig`, config);
  }

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: Product): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  // Orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  createOrder(order: Order): Observable<OrderCreateResponse> {
    return this.http.post<OrderCreateResponse>(`${this.apiUrl}/orders`, order);
  }

  updateOrderStatus(id: string, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  // Promotions
  getPromotions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promotions`);
  }

  // Super Admin
  getSuperAdminTenants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/superadmin/tenants`);
  }

  getSuperAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/superadmin/stats`);
  }

  toggleTenantStatus(tenantId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/superadmin/tenants/${tenantId}/toggle-status`, {});
  }

  // License Management (SuperAdmin)
  getPlans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/license/plans`);
  }

  createPlan(plan: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/license/plans`, plan);
  }

  generateLicenseCode(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/license/generate-code`, request);
  }

  getLicenseCodes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/license/codes`);
  }

  revokeLicenseCode(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/license/codes/${code}`);
  }

  // License Management (Tenant)
  activateLicense(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/license/activate`, request);
  }

  getMySubscription(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/license/subscription`);
  }

  // Storefront (public endpoints - slug-based tenant resolution)
  getStorefrontBySlug(slug: string): Observable<StorefrontResponse> {
    return this.http.get<StorefrontResponse>(`${this.apiUrl}/storefront/${slug}`);
  }

  getStorefrontProducts(slug: string): Observable<ProductInfo[]> {
    return this.http.get<ProductInfo[]>(`${this.apiUrl}/storefront/${slug}/products`);
  }

  getStorefrontProduct(slug: string, productId: string): Observable<ProductInfo> {
    return this.http.get<ProductInfo>(`${this.apiUrl}/storefront/${slug}/product/${productId}`);
  }

  createStorefrontOrder(slug: string, request: StorefrontOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/storefront/${slug}/order`, request);
  }
}
