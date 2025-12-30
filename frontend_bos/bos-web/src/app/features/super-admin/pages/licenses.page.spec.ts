import { ComponentFixture, TestBed } from '@angular/core/testing'
import { LicensesPage } from './licenses.page'
import { ApiService } from '../../../core/services/api.service'
import { of, throwError } from 'rxjs'
import { FormsModule } from '@angular/forms'

describe('LicensesPage', () => {
  let component: LicensesPage
  let fixture: ComponentFixture<LicensesPage>
  let mockApiService: jasmine.SpyObj<ApiService>

  const mockPlans = [
    {
      id: 'trial',
      name: 'Trial',
      description: 'Free trial',
      price: 0,
      durationDays: 14,
      maxUsers: 1,
      features: '["basic"]',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Professional',
      price: 29.99,
      durationDays: 30,
      maxUsers: 5,
      features: '["advanced"]',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const mockLicenseCodes = [
    {
      code: 'BOS-PRO-ABCD-1234',
      planId: 'pro',
      planName: 'Pro',
      durationDays: 30,
      isUsed: false,
      usedByTenantId: null,
      usedAt: null,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    }
  ]

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', [
      'getPlans',
      'createPlan',
      'getLicenseCodes',
      'generateLicenseCode',
      'revokeLicenseCode'
    ])

    await TestBed.configureTestingModule({
      imports: [LicensesPage, FormsModule],
      providers: [
        { provide: ApiService, useValue: mockApiService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(LicensesPage)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load plans and license codes on init', () => {
    mockApiService.getPlans.and.returnValue(of(mockPlans))
    mockApiService.getLicenseCodes.and.returnValue(of(mockLicenseCodes))

    component.ngOnInit()

    expect(mockApiService.getPlans).toHaveBeenCalled()
    expect(mockApiService.getLicenseCodes).toHaveBeenCalled()
    expect(component.plans()).toEqual(mockPlans)
    expect(component.licenseCodes()).toEqual(mockLicenseCodes)
  })

  it('should open create plan modal', () => {
    component.openCreatePlanModal()

    expect(component.showCreatePlanModal()).toBeTrue()
    expect(component.newPlan()).toEqual({
      id: '',
      name: '',
      description: '',
      price: 0,
      durationDays: 30,
      maxUsers: 1,
      features: ''
    })
  })

  it('should close create plan modal', () => {
    component.showCreatePlanModal.set(true)

    component.closeCreatePlanModal()

    expect(component.showCreatePlanModal()).toBeFalse()
  })

  it('should validate plan before creating', () => {
    spyOn(window, 'alert')
    component.newPlan.set({
      id: '',
      name: '',
      description: '',
      price: 0,
      durationDays: 30,
      maxUsers: 1,
      features: ''
    })

    component.createPlan()

    expect(window.alert).toHaveBeenCalledWith('Por favor completa todos los campos')
    expect(mockApiService.createPlan).not.toHaveBeenCalled()
  })

  it('should create plan successfully', () => {
    const planData = {
      id: 'test',
      name: 'Test Plan',
      description: 'Test',
      price: 9.99,
      durationDays: 7,
      maxUsers: 3,
      features: '["test"]'
    }
    component.newPlan.set(planData)
    mockApiService.createPlan.and.returnValue(of(planData as any))
    mockApiService.getPlans.and.returnValue(of([...mockPlans, planData as any]))
    mockApiService.getLicenseCodes.and.returnValue(of(mockLicenseCodes))

    component.createPlan()

    expect(mockApiService.createPlan).toHaveBeenCalledWith(planData)
    expect(component.showCreatePlanModal()).toBeFalse()
  })

  it('should open generate code modal', () => {
    component.openGenerateCodeModal()

    expect(component.showGenerateCodeModal()).toBeTrue()
    expect(component.generateCodeForm()).toEqual({
      planId: '',
      codeExpirationDays: 90
    })
  })

  it('should close generate code modal', () => {
    component.showGenerateCodeModal.set(true)

    component.closeGenerateCodeModal()

    expect(component.showGenerateCodeModal()).toBeFalse()
  })

  it('should generate license code successfully', () => {
    const generatedCode = {
      code: 'BOS-TEST-WXYZ-5678',
      planId: 'test',
      planName: 'Test',
      durationDays: 30,
      expiresAt: new Date(),
      createdAt: new Date()
    }
    component.generateCodeForm.set({
      planId: 'test',
      codeExpirationDays: 90
    })
    mockApiService.generateLicenseCode.and.returnValue(of(generatedCode))
    mockApiService.getLicenseCodes.and.returnValue(of([...mockLicenseCodes, generatedCode as any]))

    component.generateCode()

    expect(mockApiService.generateLicenseCode).toHaveBeenCalled()
    expect(component.showGenerateCodeModal()).toBeFalse()
  })

  it('should revoke license code after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true)
    mockApiService.revokeLicenseCode.and.returnValue(of(undefined))
    mockApiService.getLicenseCodes.and.returnValue(of([]))

    component.revokeCode('BOS-TEST-CODE')

    expect(window.confirm).toHaveBeenCalled()
    expect(mockApiService.revokeLicenseCode).toHaveBeenCalledWith('BOS-TEST-CODE')
  })

  it('should not revoke license code if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false)

    component.revokeCode('BOS-TEST-CODE')

    expect(mockApiService.revokeLicenseCode).not.toHaveBeenCalled()
  })

  it('should copy code to clipboard', () => {
    const clipboardSpy = jasmine.createSpyObj('Clipboard', ['writeText'])
    clipboardSpy.writeText.and.returnValue(Promise.resolve())
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve())
    spyOn(window, 'alert')

    component.copyCode('BOS-TEST-CODE')

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('BOS-TEST-CODE')
  })

  it('should get plan name by id', () => {
    component.plans.set(mockPlans)

    const planName = component.getPlanName('pro')

    expect(planName).toBe('Pro')
  })

  it('should return Unknown for invalid plan id', () => {
    component.plans.set(mockPlans)

    const planName = component.getPlanName('invalid')

    expect(planName).toBe('Unknown')
  })

  it('should determine if code is expired', () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)

    expect(component.isExpired(futureDate)).toBeFalse()
    expect(component.isExpired(pastDate)).toBeTrue()
  })

  it('should format date correctly', () => {
    const date = new Date('2025-12-28T12:00:00')

    const formatted = component.formatDate(date)

    expect(formatted).toContain('28/12/2025')
  })

  it('should handle plan creation error', () => {
    const consoleErrorSpy = spyOn(console, 'error')
    spyOn(window, 'alert')
    component.newPlan.set({
      id: 'test',
      name: 'Test',
      description: 'Test',
      price: 9.99,
      durationDays: 7,
      maxUsers: 1,
      features: '[]'
    })
    mockApiService.createPlan.and.returnValue(
      throwError(() => ({ error: { message: 'Creation failed' } }))
    )

    component.createPlan()

    expect(window.alert).toHaveBeenCalledWith('Error al crear el plan')
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should handle license code generation error', () => {
    const consoleErrorSpy = spyOn(console, 'error')
    spyOn(window, 'alert')
    component.generateCodeForm.set({
      planId: 'test',
      codeExpirationDays: 90
    })
    mockApiService.generateLicenseCode.and.returnValue(
      throwError(() => ({ error: { message: 'Generation failed' } }))
    )

    component.generateCode()

    expect(window.alert).toHaveBeenCalledWith('Error al generar el código')
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
