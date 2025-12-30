import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AdminSubscriptionPage } from './admin-subscription.page'
import { ApiService } from '../../../core/services/api.service'
import { of, throwError } from 'rxjs'
import { FormsModule } from '@angular/forms'

describe('AdminSubscriptionPage', () => {
  let component: AdminSubscriptionPage
  let fixture: ComponentFixture<AdminSubscriptionPage>
  let mockApiService: jasmine.SpyObj<ApiService>

  const mockSubscription = {
    id: 'sub-1',
    tenantId: 'test-tenant',
    planId: 'pro',
    planName: 'Pro',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    maxUsers: 5,
    features: '["advanced"]',
    licenseCode: 'BOS-PRO-TEST-1234',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', [
      'getMySubscription',
      'activateLicense'
    ])

    await TestBed.configureTestingModule({
      imports: [AdminSubscriptionPage, FormsModule],
      providers: [
        { provide: ApiService, useValue: mockApiService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(AdminSubscriptionPage)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load subscription on init', () => {
    mockApiService.getMySubscription.and.returnValue(of(mockSubscription))

    component.ngOnInit()

    expect(mockApiService.getMySubscription).toHaveBeenCalled()
    expect(component.subscription()).toEqual(mockSubscription)
    expect(component.loading()).toBeFalse()
  })

  it('should handle subscription load error', () => {
    const consoleErrorSpy = spyOn(console, 'error')
    mockApiService.getMySubscription.and.returnValue(
      throwError(() => new Error('API Error'))
    )

    component.ngOnInit()

    expect(component.loading()).toBeFalse()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should calculate days remaining correctly', () => {
    component.subscription.set(mockSubscription)

    const daysRemaining = component.getDaysRemaining()

    expect(daysRemaining).toBeGreaterThan(29)
    expect(daysRemaining).toBeLessThanOrEqual(30)
  })

  it('should return 0 days remaining for expired subscription', () => {
    const expiredSubscription = {
      ...mockSubscription,
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
    }
    component.subscription.set(expiredSubscription)

    const daysRemaining = component.getDaysRemaining()

    expect(daysRemaining).toBeLessThanOrEqual(0)
  })

  it('should show error when activating empty license code', () => {
    spyOn(window, 'alert')
    component.licenseCode = ''

    component.activateLicense()

    expect(window.alert).toHaveBeenCalledWith('Por favor ingresa un código de licencia')
  })

  it('should activate license successfully', () => {
    const spy = spyOn(window, 'alert')
    mockApiService.activateLicense.and.returnValue(of(mockSubscription))
    mockApiService.getMySubscription.and.returnValue(of(mockSubscription))
    component.licenseCode = 'BOS-PRO-ABCD-1234'

    component.activateLicense()

    expect(mockApiService.activateLicense).toHaveBeenCalledWith({
      licenseCode: 'BOS-PRO-ABCD-1234'
    })
    expect(spy).toHaveBeenCalledWith('¡Código activado exitosamente!')
    expect(component.licenseCode).toBe('')
  })

  it('should handle license activation error', () => {
    spyOn(window, 'alert')
    const consoleErrorSpy = spyOn(console, 'error')
    mockApiService.activateLicense.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid code' } }))
    )
    component.licenseCode = 'INVALID-CODE'

    component.activateLicense()

    expect(window.alert).toHaveBeenCalledWith('Invalid code')
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should get correct status color for active subscription', () => {
    component.subscription.set(mockSubscription)

    const color = component.getStatusColor()

    expect(color).toBe('active')
  })

  it('should get warning color when expiring soon', () => {
    const expiringSoon = {
      ...mockSubscription,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
    }
    component.subscription.set(expiringSoon)

    const color = component.getStatusColor()

    expect(color).toBe('warning')
  })

  it('should get expired color when subscription expired', () => {
    const expired = {
      ...mockSubscription,
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
    }
    component.subscription.set(expired)

    const color = component.getStatusColor()

    expect(color).toBe('expired')
  })

  it('should format date correctly', () => {
    const date = new Date('2025-12-28')

    const formatted = component.formatDate(date)

    expect(formatted).toContain('diciembre')
    expect(formatted).toContain('2025')
  })

  it('should get correct status text', () => {
    component.subscription.set(mockSubscription)
    expect(component.getStatusText()).toBe('Activo')

    const expiringSoon = {
      ...mockSubscription,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
    component.subscription.set(expiringSoon)
    expect(component.getStatusText()).toBe('Por vencer')

    const expired = {
      ...mockSubscription,
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
    component.subscription.set(expired)
    expect(component.getStatusText()).toBe('Expirado')
  })
})
