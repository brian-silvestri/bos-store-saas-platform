export interface Plan {
  id: string
  name: string
  description: string
  price: number
  durationDays: number
  maxUsers: number
  features: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LicenseCode {
  code: string
  planId: string
  planName?: string
  durationDays: number
  isUsed: boolean
  usedByTenantId?: string
  usedAt?: Date
  expiresAt: Date
  createdAt: Date
  isExpired?: boolean
}

export interface Subscription {
  id: string
  planId: string
  planName: string
  status: string
  startDate: Date
  endDate: Date
  daysRemaining: number
}

export interface CreatePlanRequest {
  id: string
  name: string
  description: string
  price: number
  durationDays: number
  maxUsers: number
  features: string
}

export interface GenerateLicenseRequest {
  planId: string
  durationDays?: number
  codeExpirationDays?: number
}

export interface ActivateLicenseRequest {
  licenseCode: string
}
