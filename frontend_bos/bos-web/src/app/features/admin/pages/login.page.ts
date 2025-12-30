import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
})
export class LoginPage {
  private api = inject(ApiService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  email = 'admin@mitienda.com'
  password = 'Admin123!'
  loading = signal(false)
  error = signal<string | null>(null)
  returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/orders'

  login() {
    if (!this.email || !this.password) {
      this.error.set('Por favor completa todos los campos')
      return
    }

    this.loading.set(true)
    this.error.set(null)

    this.api.login({
      tenantId: 'tenant-demo',
      email: this.email,
      password: this.password,
    }).subscribe({
      next: (response) => {
        localStorage.setItem('authToken', response.token)
        this.loading.set(false)

        try {
          const payload = JSON.parse(atob(response.token.split('.')[1]))
          const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

          if (role === 'SuperAdmin') {
            this.router.navigate(['/super-admin'])
          } else {
            this.router.navigateByUrl(this.returnUrl)
          }
        } catch (error) {
          this.router.navigateByUrl(this.returnUrl)
        }
      },
      error: (err) => {
        this.loading.set(false)
        console.error('Login error:', err)
        this.error.set(err.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.')
      },
    })
  }
}
