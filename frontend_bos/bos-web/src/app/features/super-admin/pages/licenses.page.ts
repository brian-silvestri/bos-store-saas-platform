import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { Plan, LicenseCode, GenerateLicenseRequest } from '../../../core/models/license.model'

@Component({
  selector: 'app-licenses-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './licenses.page.html',
  styleUrls: ['./licenses.page.css']
})
export class LicensesPage implements OnInit {
  plans = signal<Plan[]>([])
  licenseCodes = signal<LicenseCode[]>([])
  loading = signal(false)

  // Modal states
  showCreatePlanModal = signal(false)
  showGenerateCodeModal = signal(false)

  // Form data
  newPlan = {
    id: '',
    name: '',
    description: '',
    price: 0,
    durationDays: 30,
    maxUsers: 1,
    features: '[]'
  }

  generateCodeForm = {
    planId: '',
    durationDays: null as number | null,
    codeExpirationDays: 90
  }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData()
  }

  loadData() {
    this.loading.set(true)

    this.api.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans)
      },
      error: (err) => console.error('Error loading plans:', err)
    })

    this.api.getLicenseCodes().subscribe({
      next: (codes) => {
        this.licenseCodes.set(codes)
        this.loading.set(false)
      },
      error: (err) => {
        console.error('Error loading license codes:', err)
        this.loading.set(false)
      }
    })
  }

  openCreatePlanModal() {
    this.newPlan = {
      id: '',
      name: '',
      description: '',
      price: 0,
      durationDays: 30,
      maxUsers: 1,
      features: '[]'
    }
    this.showCreatePlanModal.set(true)
  }

  closeCreatePlanModal() {
    this.showCreatePlanModal.set(false)
  }

  createPlan() {
    this.api.createPlan(this.newPlan).subscribe({
      next: () => {
        this.closeCreatePlanModal()
        this.loadData()
      },
      error: (err) => console.error('Error creating plan:', err)
    })
  }

  openGenerateCodeModal() {
    this.generateCodeForm = {
      planId: this.plans()[0]?.id || '',
      durationDays: null,
      codeExpirationDays: 90
    }
    this.showGenerateCodeModal.set(true)
  }

  closeGenerateCodeModal() {
    this.showGenerateCodeModal.set(false)
  }

  generateCode() {
    const request: GenerateLicenseRequest = {
      planId: this.generateCodeForm.planId,
      durationDays: this.generateCodeForm.durationDays || undefined,
      codeExpirationDays: this.generateCodeForm.codeExpirationDays
    }

    this.api.generateLicenseCode(request).subscribe({
      next: () => {
        this.closeGenerateCodeModal()
        this.loadData()
      },
      error: (err) => console.error('Error generating code:', err)
    })
  }

  revokeCode(code: string) {
    if (!confirm(`¿Estás seguro de revocar el código ${code}?`)) return

    this.api.revokeLicenseCode(code).subscribe({
      next: () => {
        this.loadData()
      },
      error: (err) => console.error('Error revoking code:', err)
    })
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    alert('Código copiado al portapapeles')
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-AR')
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount)
  }

  trackById(index: number, item: any): string {
    return item.id || item.code || index
  }
}
