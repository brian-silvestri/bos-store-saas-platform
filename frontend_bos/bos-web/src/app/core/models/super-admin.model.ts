export interface TenantMetrics {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
}

export interface TenantSummary {
  id: string
  name: string
  subdomain: string
  isActive: boolean
  createdAt: Date
  ownerEmail: string
  ownerName: string
  metrics: TenantMetrics
}

export interface GlobalStats {
  totalTenants: number
  activeTenants: number
  inactiveTenants: number
  totalOrders: number
  totalRevenue: number
  recentTenants: Array<{
    id: string
    name: string
    subdomain: string
    createdAt: Date
  }>
}
