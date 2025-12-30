import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SubscriptionBannerComponent } from './subscription-banner.component'
import { ApiService } from '../../core/services/api.service'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'

describe('SubscriptionBannerComponent', () => {
  let component: SubscriptionBannerComponent
  let fixture: ComponentFixture<SubscriptionBannerComponent>
  let mockApiService: jasmine.SpyObj<ApiService>
  let mockRouter: jasmine.SpyObj<Router>

  const createMockSubscription = (daysFromNow: number) => ({
    id: 'sub-1',
    tenantId: 'test-tenant',
    planId: 'pro',
    planName: 'Pro',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
    maxUsers: 5,
    features: '["advanced"]',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getMySubscription'])
    mockRouter = jasmine.createSpyObj('Router', ['navigate'])

    await TestBed.configureTestingModule({
      imports: [SubscriptionBannerComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(SubscriptionBannerComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load subscription on init', () => {
    const mockSubscription = createMockSubscription(30)
    mockApiService.getMySubscription.and.returnValue(of(mockSubscription))

    component.ngOnInit()

    expect(mockApiService.getMySubscription).toHaveBeenCalled()
    expect(component.subscription()).toEqual(mockSubscription)
  })

  it('should calculate days remaining correctly', () => {
    const mockSubscription = createMockSubscription(15)
    component.subscription.set(mockSubscription)

    const daysRemaining = component.getDaysRemaining()

    expect(daysRemaining).toBeGreaterThanOrEqual(14)
    expect(daysRemaining).toBeLessThanOrEqual(15)
  })

  it('should show banner when 7 days or less remaining', () => {
    const mockSubscription = createMockSubscription(5)
    component.subscription.set(mockSubscription)

    const shouldShow = component.shouldShowBanner()

    expect(shouldShow).toBeTrue()
  })

  it('should NOT show banner when more than 7 days remaining', () => {
    const mockSubscription = createMockSubscription(30)
    component.subscription.set(mockSubscription)

    const shouldShow = component.shouldShowBanner()

    expect(shouldShow).toBeFalse()
  })

  it('should show banner when subscription expired', () => {
    const mockSubscription = createMockSubscription(-1) // Expired yesterday
    component.subscription.set(mockSubscription)

    const shouldShow = component.shouldShowBanner()

    expect(shouldShow).toBeTrue()
  })

  it('should return warning type when days remaining is 1-7', () => {
    const mockSubscription = createMockSubscription(5)
    component.subscription.set(mockSubscription)

    const bannerType = component.getBannerType()

    expect(bannerType).toBe('warning')
  })

  it('should return expired type when subscription expired', () => {
    const mockSubscription = createMockSubscription(-1)
    component.subscription.set(mockSubscription)

    const bannerType = component.getBannerType()

    expect(bannerType).toBe('expired')
  })

  it('should navigate to subscription page when clicking activate button', () => {
    component.goToSubscription()

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/subscription'])
  })

  it('should handle API errors gracefully', () => {
    mockApiService.getMySubscription.and.returnValue(
      throwError(() => new Error('API Error'))
    )

    component.ngOnInit()

    expect(component.loading()).toBeFalse()
    expect(component.subscription()).toBeNull()
  })

  it('should not show banner when no subscription loaded', () => {
    component.subscription.set(null)

    const shouldShow = component.shouldShowBanner()

    expect(shouldShow).toBeFalse()
  })
})
